import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../constants/theme';
import { Button } from './Alvarosky';
import { MovementType, Hub } from '../types';

interface Props {
  visible: boolean;
  product: { name: string; sku: string } | null;
  onConfirm: (type: MovementType, quantity: number, toHubId?: string) => void;
  onClose: () => void;
  hubs: Hub[];
  defaultType?: MovementType;
}

export default function FastMovementModal({ visible, product, onConfirm, onClose, hubs, defaultType }: Props) {
  const [type, setType] = useState<MovementType>(defaultType || MovementType.INGRESO);
  const [quantity, setQuantity] = useState(1);
  const [toHubId, setToHubId] = useState<string | undefined>(undefined);
  const colors = COLORS.dark;

  // Reset state when visible changes or product changes
  useEffect(() => {
    if (visible) {
      setType(defaultType || MovementType.INGRESO);
      setQuantity(1);
      setToHubId(undefined);
    }
  }, [visible, defaultType, product]);

  const handleConfirm = () => {
    onConfirm(type, quantity, toHubId);
  };

  const adjustQty = (delta: number) => {
    setQuantity(prev => {
        const next = prev + delta;
        if (type === MovementType.AJUSTE) return next; // Permitir negativos en ajuste
        return Math.max(1, next);
    });
  };

  if (!product) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.handle} />
          
          <Text style={[styles.sku, { color: colors.primary }]}>{product.sku}</Text>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>

          <View style={styles.divider} />

          {/* Selector de Tipo */}
          <Text style={[styles.label, { color: colors.textMuted }]}>TIPO DE MOVIMIENTO</Text>
          <View style={styles.typeGrid}>
            {[
              { id: MovementType.INGRESO, label: 'INGRESO', color: colors.primary },
              { id: MovementType.SALIDA, label: 'SALIDA', color: colors.danger },
              { id: MovementType.TRASLADO, label: 'TRASLADO', color: '#f59e0b' },
              { id: MovementType.AJUSTE, label: 'AJUSTE', color: '#3b82f6' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setType(item.id)}
                style={[
                  styles.typeBtn,
                  { borderColor: type === item.id ? item.color : colors.border },
                  type === item.id && { backgroundColor: item.color + '20' }
                ]}
              >
                <Text style={[
                  styles.typeText,
                  { color: type === item.id ? item.color : colors.textMuted }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selector de Cantidad */}
          <Text style={[styles.label, { color: colors.textMuted, marginTop: SPACING.lg }]}>CANTIDAD</Text>
          <View style={styles.qtyContainer}>
            <TouchableOpacity onPress={() => adjustQty(-1)} style={[styles.qtyBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
            </TouchableOpacity>
            
            <View style={styles.qtyValueContainer}>
                <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
            </View>

            <TouchableOpacity onPress={() => adjustQty(1)} style={[styles.qtyBtn, { backgroundColor: colors.surface }]}>
              <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Hub Destino para Traslado */}
          {type === MovementType.TRASLADO && (
            <View style={{ marginTop: SPACING.md, width: '100%' }}>
              <Text style={[styles.label, { color: colors.textMuted }]}>SEDE DESTINO</Text>
              <View style={styles.hubSelector}>
                {hubs.map(hub => (
                  <TouchableOpacity 
                    key={hub.id} 
                    onPress={() => setToHubId(hub.id)}
                    style={[
                        styles.hubItem, 
                        { borderColor: toHubId === hub.id ? colors.primary : colors.border },
                        toHubId === hub.id && { backgroundColor: colors.primary + '10' }
                    ]}
                  >
                    <Text style={{ color: toHubId === hub.id ? colors.primary : colors.text, fontSize: 12 }}>{hub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.actions}>
            <Button title="Cancelar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button 
                title="Confirmar" 
                variant="primary" 
                onPress={handleConfirm} 
                style={{ flex: 2 }} 
                disabled={type === MovementType.TRASLADO && !toHubId}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  content: { 
    backgroundColor: COLORS.dark.background, 
    borderTopLeftRadius: RADIUS.lg, 
    borderTopRightRadius: RADIUS.lg, 
    padding: SPACING.lg, 
    paddingTop: SPACING.md,
    alignItems: 'center' 
  },
  handle: { width: 40, height: 4, backgroundColor: COLORS.dark.border, borderRadius: 2, marginBottom: SPACING.md },
  sku: { fontSize: 12, fontFamily: 'monospace', fontWeight: 'bold', marginBottom: 2 },
  name: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.md },
  divider: { height: 1, width: '100%', backgroundColor: COLORS.dark.border, marginBottom: SPACING.md },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: SPACING.sm },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center' },
  typeBtn: { width: '47%', paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, alignItems: 'center' },
  typeText: { fontSize: 12, fontWeight: '700' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl, marginTop: SPACING.xs },
  qtyBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 24, fontWeight: 'bold' },
  qtyValueContainer: { minWidth: 80, alignItems: 'center' },
  qtyValue: { fontSize: 42, fontWeight: '800' },
  hubSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  hubItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.sm, borderWidth: 1 },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl, width: '100%', paddingBottom: SPACING.lg },
});
