import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useScanner } from '../../src/hooks/useScanner';
import { useSync } from '../../src/hooks/useSync';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { useAuth } from '../../src/context/AuthContext';
import { MovementType } from '../../src/types';
import { Button, Alert, Badge, Card } from '../../src/components/Alvarosky';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';
import { v4 as uuidv4 } from 'uuid';
import { recordMovement } from '../../src/services/KardexService';

export default function ScannerScreen() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { handleScan, sessionCount, lastScannedCode } = useScanner();
  const { pendingCount, refreshPending } = useSync();
  const network = useNetworkStatus();
  const { user } = useAuth();

  const [movementType, setMovementType] = useState<MovementType>(MovementType.INGRESO);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const colors = COLORS.dark;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      const code = codes[0];
      if (!code?.value || !user?.id) return;

      const accepted = handleScan(code.value, movementType, user.id);
      if (accepted) {
        setDisplayCode(code.value);
        setDisplayCount(sessionCount.current);
        refreshPending();
      }
    },
  });

  const runStressTest = useCallback(() => {
    if (!user?.id) return;
    
    console.time('StressTest:100-Inserts');
    for (let i = 0; i < 100; i++) {
        // Ignoramos handleScan para evitar el debounce y el haptic
        // Invocamos directamente el KardexService simulando la velocidad brutal
        recordMovement(`STRESS-MOCK-${uuidv4()}`, movementType, user.id);
    }
    console.timeEnd('StressTest:100-Inserts');
    
    refreshPending();
  }, [user?.id, movementType, refreshPending]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.message, { color: colors.text }]}>
          Se requiere permiso de cámara
        </Text>
        <Button title="Conceder Permiso" onPress={requestPermission} />
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Alert message="No se encontró cámara en el dispositivo" variant="error" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]}>Flash Urbano</Text>
          <View style={styles.indicators}>
            <View
              style={[
                styles.dot,
                { backgroundColor: network.isConnected ? colors.primary : colors.danger },
              ]}
            />
            {pendingCount > 0 && <Badge count={pendingCount} variant="warning" />}
          </View>
        </View>

        <View style={styles.typeSelector}>
          {[MovementType.INGRESO, MovementType.SALIDA].map((type) => (
            <Button
              key={type}
              title={type}
              variant={movementType === type ? 'primary' : 'secondary'}
              onPress={() => setMovementType(type)}
              style={styles.typeButton}
            />
          ))}
        </View>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          codeScanner={codeScanner}
        />

        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      <View style={styles.footer}>
        {displayCode ? (
          <Card style={styles.resultCard}>
            <Text style={[styles.resultLabel, { color: colors.textMuted }]}>
              Último escaneo
            </Text>
            <Text
              style={[styles.resultCode, { color: colors.primary }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {displayCode}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={[styles.resultType, { color: colors.text }]}>
                {movementType}
              </Text>
              <Text style={[styles.sessionCounter, { color: colors.textMuted }]}>
                Sesión: {displayCount}
              </Text>
            </View>
          </Card>
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Apunta la cámara a un código QR
          </Text>
        )}
        <Button 
          title="🔥 MOCK STRESS (100x)" 
          onPress={runStressTest} 
          variant="secondary"
          style={{ marginTop: SPACING.md, borderColor: colors.danger, borderWidth: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  message: {
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    minHeight: 44,
    paddingVertical: SPACING.sm,
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.dark.primary,
    borderRadius: RADIUS.md,
    backgroundColor: 'transparent',
  },
  footer: {
    padding: SPACING.md,
    minHeight: 120,
    justifyContent: 'center',
  },
  resultCard: {
    padding: SPACING.md,
  },
  resultLabel: {
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  resultCode: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultType: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  sessionCounter: {
    fontSize: FONT_SIZE.sm,
  },
  hint: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
  },
});
