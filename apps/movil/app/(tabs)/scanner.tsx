import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useFocusEffect } from 'expo-router';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  // Estado para Passport (Hoja de Vida)
  const [showPassport, setShowPassport] = useState(false);
  const [passportData, setPassportData] = useState<any>(null);
  const [passportLoading, setPassportLoading] = useState(false);
  const [pendingSku, setPendingSku] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<{ name: string; sku: string } | null>(null);

  // Estado para Modal de Acción Rápida
  const [showFastModal, setShowFastModal] = useState(false);
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [operatorProfile, setOperatorProfile] = useState<any>(null);

  const colors = COLORS.dark;

  const getTypeColor = (type: MovementType) => {
    if (type === MovementType.INGRESO) return colors.success;   // Verde
    if (type === MovementType.SALIDA) return colors.danger;     // Rojo
    if (type === MovementType.TRASLADO) return colors.warning;  // Amarillo
    if (type === MovementType.AJUSTE) return colors.info;       // Azul
    return colors.textMuted;
  };
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
      // Paso 1: Buscar producto por SKU — obtenemos el nombre inmediatamente
      const findRes = await fetch(`${API_BASE_URL}/products/sku/_/${sku}`);
      if (!findRes.ok) {
        // Producto no registrado — no tenemos nombre
        setScannedProduct({ name: sku, sku });
        setPassportData(null);
        return;
      }
      const product = await findRes.json();
      // Actualizar nombre del producto INMEDIATAMENTE para el modal
      setScannedProduct({ name: product.name || sku, sku });
      
      // Paso 2: Obtener passport completo (puede demorar más)
      const passRes = await fetch(`${API_BASE_URL}/products/${product.id}/passport`);
      if (passRes.ok) {
        setPassportData(await passRes.json());
      } else {
        setPassportData(null);
      }
    } catch (e) {
      console.error('Error fetching passport', e);
      setScannedProduct({ name: sku, sku });
      setPassportData(null);
    } finally {
      setPassportLoading(false);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (isProcessing || !isFocused) return;
      const code = codes[0];
      if (!code?.value || !user?.id) return;

      const accepted = handleScan(code.value);
      if (accepted) {
        setIsProcessing(true);
        setPendingSku(code.value);
        setScannedProduct(null); // Reset para mostrar "Cargando..."
        setShowFastModal(true);
        fetchPassport(code.value);
      }
    },
  });

  const [displayName, setDisplayName] = useState<string | null>(null);

  const [lastMovementType, setLastMovementType] = useState<MovementType>(MovementType.INGRESO);

  const handleConfirmFastMovement = (type: MovementType, qty: number, toHubId?: string) => {
    if (!pendingSku || !user?.id) return;
    
    const userHubId = operatorProfile?.hubId;
    // Prioridad: scannedProduct (llega rápido) > passportData > SKU crudo
    const productName = scannedProduct?.name || passportData?.product?.name || pendingSku;

    recordMovement(
      pendingSku, 
      type, 
      qty, 
      user.id, 
      productName,
      (type === MovementType.SALIDA || type === MovementType.TRASLADO) ? userHubId : undefined,
      (type === MovementType.INGRESO || type === MovementType.AJUSTE || type === MovementType.TRASLADO) ? (type === MovementType.TRASLADO ? toHubId : userHubId) : undefined
    );

    sessionCount.current += 1;
    setDisplayCode(pendingSku);
    setDisplayName(productName);
    setLastMovementType(type);
    setDisplayCount(sessionCount.current);
    refreshPending();

    setShowFastModal(false);
    setPendingSku(null);
    setScannedProduct(null);
    setPassportData(null);
    
    // Slight delay before allowing new scans to prevent accidental double-scans
    setTimeout(() => setIsProcessing(false), 800);
  };

  const handleCloseFastModal = () => {
    setShowFastModal(false);
    setPendingSku(null);
    setPassportData(null);
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleClosePassport = () => {
    setShowPassport(false);
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Flash Urbano</Text>
          </View>
          <View style={styles.indicators}>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: network.isConnected ? colors.success + '20' : colors.danger + '20' },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: network.isConnected ? colors.success : colors.danger },
                ]}
              />
              <Text style={[styles.statusText, { color: network.isConnected ? colors.success : colors.danger }]}>
                {network.isConnected ? 'En línea' : 'Offline'}
              </Text>
            </View>
            {pendingCount > 0 && <Badge count={pendingCount} variant="warning" />}
          </View>
        </View>
      </View>

      {/* Camera */}
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isFocused}
          codeScanner={codeScanner}
        />
        <View style={styles.scanOverlay}>
          {/* Corner markers instead of full border */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            <View style={styles.scanLine} />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {displayCode ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Último escaneo</Text>
              <Text style={styles.sessionBadge}>#{displayCount}</Text>
            </View>
            <Text style={styles.resultName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.resultCode} numberOfLines={1}>
              {displayCode}
            </Text>
            <View style={styles.resultMeta}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(lastMovementType) + '20' }]}>
                <Text style={[styles.typeText, { color: getTypeColor(lastMovementType) }]}>
                  {lastMovementType}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Text style={styles.hint}>
            Apunta la cámara al código QR del producto
          </Text>
        )}
      </View>

      {/* Modal Acción Rápida (Optimizado) */}
      <FastMovementModal
        visible={showFastModal}
        product={scannedProduct || (pendingSku ? { name: 'Cargando...', sku: pendingSku } : null)}
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

const colors = COLORS.dark;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  message: { fontSize: FONT_SIZE.lg, marginBottom: SPACING.md, textAlign: 'center' },
  
  // Header
  header: { paddingTop: SPACING.xxl, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerLogo: { width: 28, height: 28 },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  indicators: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  
  // Camera
  cameraContainer: { flex: 1, overflow: 'hidden', marginHorizontal: SPACING.md, borderRadius: RADIUS.lg },
  scanOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 240, height: 240, position: 'relative' },
  scanLine: { position: 'absolute', top: '50%', left: 20, right: 20, height: 2, backgroundColor: colors.primary, borderRadius: 1, opacity: 0.8 },
  
  // Corner markers
  corner: { position: 'absolute', width: 28, height: 28, borderColor: colors.primary },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },

  // Footer
  footer: { padding: SPACING.md, minHeight: 110, justifyContent: 'center' },
  resultCard: { padding: SPACING.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  resultLabel: { fontSize: FONT_SIZE.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  sessionBadge: { fontSize: FONT_SIZE.xs, color: colors.primary, fontWeight: '700', fontFamily: 'monospace' },
  resultName: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: colors.text, marginBottom: 2 },
  resultCode: { fontSize: FONT_SIZE.xs, fontWeight: '600', fontFamily: 'monospace', color: colors.primary, marginBottom: SPACING.sm, opacity: 0.9 },
  resultMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  typeText: { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 0.5 },
  hint: { textAlign: 'center', fontSize: FONT_SIZE.md, color: colors.textMuted },
  passportOverlay: { flex: 1, backgroundColor: colors.background, paddingTop: SPACING.xxl },
});
