import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../constants/theme';
import { Card, Button } from '../components/Alvarosky';

interface StockItem {
  hubName: string;
  hubCity: string;
  quantity: number;
}

interface Movement {
  id: string;
  movementType: string;
  quantity: number;
  notes?: string;
  createdAt: string;
}

interface PassportData {
  product: {
    sku: string;
    name: string;
    category?: string;
    brand?: string;
    description?: string;
  };
  totalUnits: number;
  stockBySede: StockItem[];
  movements: Movement[];
}

interface Props {
  data: PassportData | null;
  loading: boolean;
  onRegisterMovement: () => void;
  onClose: () => void;
}

export default function ProductPassport({ data, loading, onRegisterMovement, onClose }: Props) {
  const colors = COLORS.dark;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando producto...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Producto no encontrado</Text>
        <Button title="Cerrar" variant="secondary" onPress={onClose} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  const typeColor = (type: string) => {
    switch (type) {
      case 'INGRESO': return colors.primary;
      case 'SALIDA': return colors.danger;
      case 'TRASLADO': return '#3b82f6';
      default: return colors.textMuted;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Producto Info */}
      <View style={styles.productHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.avatarLetter, { color: colors.primary }]}>
            {data.product.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.sku, { color: colors.primary }]}>{data.product.sku}</Text>
          <Text style={[styles.productName, { color: colors.text }]}>{data.product.name}</Text>
          <View style={styles.tags}>
            {data.product.category && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{data.product.category}</Text>
              </View>
            )}
            {data.product.brand && (
              <View style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.textMuted }]}>{data.product.brand}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.totalBox}>
          <Text style={[styles.totalNumber, { color: colors.primary }]}>{data.totalUnits}</Text>
          <Text style={[styles.totalLabel, { color: colors.textMuted }]}>uds</Text>
        </View>
      </View>

      {data.product.description && (
        <Text style={[styles.description, { color: colors.textMuted }]}>{data.product.description}</Text>
      )}

      {/* Stock por Sede */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Stock por Sede</Text>
      {data.stockBySede.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin stock registrado</Text>
      ) : (
        <View style={styles.stockGrid}>
          {data.stockBySede.map((s, i) => (
            <Card key={i} style={styles.stockCard}>
              <View style={styles.stockRow}>
                <View>
                  <Text style={[styles.hubName, { color: colors.text }]}>{s.hubName}</Text>
                  <Text style={[styles.hubCity, { color: colors.textMuted }]}>{s.hubCity}</Text>
                </View>
                <Text style={[styles.stockQty, { color: colors.primary }]}>{s.quantity}</Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Últimos Movimientos */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Últimos Movimientos</Text>
      {data.movements.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin movimientos</Text>
      ) : (
        data.movements.slice(0, 10).map((m) => (
          <View key={m.id} style={[styles.movementRow, { borderBottomColor: colors.border }]}>
            <View style={styles.movementLeft}>
              <Text style={[styles.movementType, { color: typeColor(m.movementType) }]}>
                {m.movementType}
              </Text>
              {m.notes && (
                <Text style={[styles.movementNotes, { color: colors.textMuted }]} numberOfLines={1}>
                  {m.notes}
                </Text>
              )}
            </View>
            <View style={styles.movementRight}>
              <Text style={[styles.movementQty, { color: m.movementType === 'SALIDA' ? colors.danger : colors.primary }]}>
                {m.movementType === 'SALIDA' ? '-' : '+'}{m.quantity}
              </Text>
              <Text style={[styles.movementDate, { color: colors.textMuted }]}>
                {new Date(m.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Registrar Movimiento" variant="primary" onPress={onRegisterMovement} style={{ flex: 1 }} />
        <Button title="Cerrar" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.dark.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.dark.background },
  loadingText: { fontSize: FONT_SIZE.sm, marginTop: SPACING.sm },
  errorText: { fontSize: FONT_SIZE.md },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  avatar: { width: 50, height: 50, borderRadius: RADIUS.lg, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 22, fontWeight: 'bold' },
  productInfo: { flex: 1 },
  sku: { fontSize: FONT_SIZE.xs, fontFamily: 'monospace', fontWeight: 'bold' },
  productName: { fontSize: FONT_SIZE.lg, fontWeight: '700' },
  tags: { flexDirection: 'row', gap: SPACING.xs, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  tagText: { fontSize: FONT_SIZE.xs },
  totalBox: { alignItems: 'center' },
  totalNumber: { fontSize: 28, fontWeight: '800' },
  totalLabel: { fontSize: FONT_SIZE.xs },
  description: { fontSize: FONT_SIZE.sm, marginBottom: SPACING.md, lineHeight: 20 },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: SPACING.sm, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZE.sm, textAlign: 'center', paddingVertical: SPACING.md },
  stockGrid: { gap: SPACING.xs },
  stockCard: { padding: SPACING.sm },
  stockRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hubName: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
  hubCity: { fontSize: FONT_SIZE.xs },
  stockQty: { fontSize: FONT_SIZE.lg, fontWeight: '800', fontFamily: 'monospace' },
  movementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  movementLeft: { flex: 1 },
  movementType: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  movementNotes: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  movementRight: { alignItems: 'flex-end' },
  movementQty: { fontSize: FONT_SIZE.sm, fontWeight: '800', fontFamily: 'monospace' },
  movementDate: { fontSize: FONT_SIZE.xs },
  actions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
});
