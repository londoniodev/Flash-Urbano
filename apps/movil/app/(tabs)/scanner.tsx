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
import { API_BASE_URL } from '../../src/constants/config';
import ProductPassport from '../../src/components/ProductPassport';
import FastMovementModal from '../../src/components/FastMovementModal';
import { Hub } from '../../src/types';

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

  // Estado para Passport (Hoja de Vida)
  const [showPassport, setShowPassport] = useState(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [pendingSku, setPendingSku] = useState<string | null>(null);

  // Estado para Modal de Acción Rápida
  const [showFastModal, setShowFastModal] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [operatorProfile, setOperatorProfile] = useState<any>(null);

  const colors = COLORS.dark;

  useEffect(() => {
    // Cargar sedes para traslados
    fetch(`${API_BASE_URL}/hubs`)
      .then(res => res.json())
      .then(data => setHubs(data))
      .catch(err => console.error('Error fetching hubs', err));
    
    // Cargar perfil del operario para saber su hubId
    if (user?.id) {
      fetch(`${API_BASE_URL}/users/${user.id}`)
        .then(res => res.json())
        .then(data => setOperatorProfile(data))
        .catch(err => console.error('Error fetching profile', err));
    }
  }, [user]);

  const fetchPassport = async (sku: string) => {
    setPassportLoading(true);
    try {
      // Primero buscamos el producto por SKU, luego pedimos su passport
      const token = user?.id; // TODO: get actual auth token
      const findRes = await fetch(`${API_BASE_URL}/products/sku/_/${sku}`);
      if (!findRes.ok) {
        // Producto no registrado aún — mostrar SKU sin datos
        setPassportData(null);
        return;
      }
      const product = await findRes.json();
      const passRes = await fetch(`${API_BASE_URL}/products/${product.id}/passport`);
      if (passRes.ok) {
        setPassportData(await passRes.json());
      } else {
        setPassportData(null);
      }
    } catch (e) {
      console.error('Error fetching passport', e);
      setPassportData(null);
    } finally {
      setPassportLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (!isActive) return;
      const code = codes[0];
      if (!code?.value || !user?.id) return;

      const accepted = handleScan(code.value);
      if (accepted) {
        setIsActive(false);
        setPendingSku(code.value);
        // Cambiamos el flujo: Mostrar acción rápida directamente
        setShowFastModal(true);
        fetchPassport(code.value); // Seguimos cargando datos en segundo plano por si acaso
      }
    },
  });

  const handleConfirmFastMovement = (type: MovementType, qty: number, toHubId?: string) => {
    if (!pendingSku || !user?.id) return;
    
    const userHubId = operatorProfile?.hubId;

    recordMovement(
      pendingSku, 
      type, 
      qty, 
      user.id, 
      (type === MovementType.SALIDA || type === MovementType.TRASLADO) ? userHubId : undefined,
      (type === MovementType.INGRESO || type === MovementType.AJUSTE || type === MovementType.TRASLADO) ? (type === MovementType.TRASLADO ? toHubId : userHubId) : undefined
    );

    sessionCount.current += 1;
    setDisplayCode(pendingSku);
    setDisplayCount(sessionCount.current);
    refreshPending();

    setShowFastModal(false);
    setPendingSku(null);
    setPassportData(null);
    setTimeout(() => setIsActive(true), 500);
  };

  const handleCloseFastModal = () => {
    setShowFastModal(false);
    setPendingSku(null);
    setPassportData(null);
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
            <Text style={[styles.resultCode, { color: colors.primary }]} numberOfLines={1} ellipsizeMode="middle">
              {displayCode}
            </Text>
            <View style={styles.resultMeta}>
              <Text style={[styles.resultType, { color: colors.text }]}>{movementType}</Text>
              <Text style={[styles.sessionCounter, { color: colors.textMuted }]}>Sesión: {displayCount}</Text>
            </View>
          </Card>
        ) : (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Apunta la cámara al código QR del producto
          </Text>
        )}
      </View>

      {/* Modal Acción Rápida (Optimizado) */}
      <FastMovementModal
        visible={showFastModal}
        product={passportData?.product || (pendingSku ? { name: 'Cargando...', sku: pendingSku } : null)}
        hubs={hubs}
        defaultType={movementType}
        onConfirm={handleConfirmFastMovement}
        onClose={handleCloseFastModal}
      />

      {/* Modal Passport (Ahora secundario o para consulta) */}
      <Modal visible={showPassport} transparent animationType="slide">
        <View style={styles.passportOverlay}>
          <ProductPassport
            data={passportData}
            loading={passportLoading}
            onRegisterMovement={() => { setShowPassport(false); setShowFastModal(true); }}
            onClose={handleClosePassport}
          />
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
  passportOverlay: { flex: 1, backgroundColor: COLORS.dark.background, paddingTop: SPACING.xxl },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.dark.surface, padding: SPACING.lg, borderRadius: RADIUS.lg, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: 'bold', color: COLORS.dark.text, marginBottom: SPACING.xs },
  modalSku: { fontSize: FONT_SIZE.md, fontFamily: 'monospace', color: COLORS.dark.primary, marginBottom: SPACING.xs },
  modalType: { fontSize: FONT_SIZE.sm, color: COLORS.dark.textMuted, marginBottom: SPACING.md },
  input: { width: '100%', height: 60, backgroundColor: COLORS.dark.background, color: COLORS.dark.text, fontSize: 32, textAlign: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.dark.border, marginBottom: SPACING.lg },
  modalButtons: { flexDirection: 'row', gap: SPACING.md, width: '100%' },
  modalBtn: { flex: 1 },
});
