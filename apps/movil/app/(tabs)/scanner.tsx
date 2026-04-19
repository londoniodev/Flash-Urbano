import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput } from 'react-native';
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
import { recordMovement } from '../../src/services/KardexService';

export default function ScannerScreen() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { handleScan, sessionCount } = useScanner();
  const { pendingCount, refreshPending } = useSync();
  const network = useNetworkStatus();
  const { user } = useAuth();

  const [movementType, setMovementType] = useState<MovementType>(MovementType.INGRESO);
  const [displayCode, setDisplayCode] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Modal State para Cantidad
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [quantityInput, setQuantityInput] = useState<string>('1');

  const colors = COLORS.dark;

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (!isActive) return;
      const code = codes[0];
      if (!code?.value || !user?.id) return;

      const accepted = handleScan(code.value);
      if (accepted) {
        setIsActive(false); // Pausar cámara
        setPendingSku(code.value);
        setQuantityInput('1');
        setShowQuantityModal(true);
      }
    },
  });

  const handleSaveMovement = () => {
    if (!pendingSku || !user?.id) return;
    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty <= 0) {
      // Si la cantidad es inválida, no hacer nada o mostrar error
      return;
    }

    // El from/to hub debería sacarse de contexto, por ahora es null
    recordMovement(pendingSku, movementType, qty, user.id, undefined, undefined);
    
    sessionCount.current += 1;
    setDisplayCode(pendingSku);
    setDisplayCount(sessionCount.current);
    refreshPending();

    // Resetear y volver a activar cámara
    setShowQuantityModal(false);
    setPendingSku(null);
    setTimeout(() => setIsActive(true), 500); // Pequeño delay para no doble escanear
  };

  const handleCancelMovement = () => {
    setShowQuantityModal(false);
    setPendingSku(null);
    setTimeout(() => setIsActive(true), 500);
  };

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
          <Text style={[styles.title, { color: colors.text }]}>WMS Scanner</Text>
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
            Apunta la cámara al código de barras del SKU
          </Text>
        )}
      </View>

      {/* Modal para Cantidad */}
      <Modal visible={showQuantityModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingresar Cantidad</Text>
            <Text style={styles.modalSku}>SKU: {pendingSku}</Text>
            <Text style={styles.modalType}>Operación: {movementType}</Text>
            
            <TextInput
              style={styles.input}
              value={quantityInput}
              onChangeText={setQuantityInput}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
            />
            
            <View style={styles.modalButtons}>
              <Button title="Cancelar" variant="secondary" onPress={handleCancelMovement} style={styles.modalBtn} />
              <Button title="Guardar" variant="primary" onPress={handleSaveMovement} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  message: { fontSize: FONT_SIZE.lg, marginBottom: SPACING.md, textAlign: 'center' },
  header: { paddingTop: SPACING.xxl, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '800', letterSpacing: -0.5 },
  indicators: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  typeSelector: { flexDirection: 'row', gap: SPACING.sm },
  typeButton: { flex: 1, minHeight: 44, paddingVertical: SPACING.sm },
  cameraContainer: { flex: 1, overflow: 'hidden', marginHorizontal: SPACING.md, borderRadius: RADIUS.lg },
  scanOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 250, height: 100, borderWidth: 2, borderColor: COLORS.dark.primary, borderRadius: RADIUS.md, backgroundColor: 'transparent' },
  footer: { padding: SPACING.md, minHeight: 120, justifyContent: 'center' },
  resultCard: { padding: SPACING.md },
  resultLabel: { fontSize: FONT_SIZE.xs, marginBottom: SPACING.xs, textTransform: 'uppercase', letterSpacing: 1 },
  resultCode: { fontSize: FONT_SIZE.md, fontWeight: '600', fontFamily: 'monospace', marginBottom: SPACING.sm },
  resultMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultType: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  sessionCounter: { fontSize: FONT_SIZE.sm },
  hint: { textAlign: 'center', fontSize: FONT_SIZE.md },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.dark.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.dark.text, marginBottom: SPACING.xs },
  modalSku: { fontSize: FONT_SIZE.md, fontFamily: 'monospace', color: COLORS.dark.primary, marginBottom: SPACING.xs },
  modalType: { fontSize: FONT_SIZE.sm, color: COLORS.dark.textMuted, marginBottom: SPACING.md },
  input: { width: '100%', height: 60, backgroundColor: COLORS.dark.background, color: COLORS.dark.text, fontSize: 32, textAlign: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.dark.border, marginBottom: SPACING.lg },
  modalButtons: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  modalBtn: { flex: 1 },
});
