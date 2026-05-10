import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Image } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getHistory, getTotalCount } from '../../src/services/KardexService';
import { KardexEntry, MovementType } from '../../src/types';
import { Card } from '../../src/components/Alvarosky';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';

const PAGE_SIZE = 30;

export default function KardexScreen() {
  const [entries, setEntries] = useState<KardexEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const colors = COLORS.dark;

  const loadData = useCallback((reset = false) => {
    const offset = reset ? 0 : entries.length;
    const data = getHistory(PAGE_SIZE, offset);
    setEntries((prev) => (reset ? data : [...prev, ...data]));
    setTotal(getTotalCount());
  }, [entries.length]);

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
    setRefreshing(false);
  }, [loadData]);

  const typeColor = (type: string) => {
    if (type === MovementType.INGRESO) return colors.primary;
    if (type === MovementType.SALIDA) return colors.danger;
    if (type === MovementType.TRASLADO) return colors.warning;
    return '#8b8b8b'; // AJUSTE
  };

  const renderItem = useCallback(
    ({ item }: { item: KardexEntry }) => (
      <Card style={styles.item}>
        <View style={styles.itemHeader}>
          <Text style={[styles.type, { color: typeColor(item.movement_type) }]}>
            {item.movement_type}
          </Text>
          <View style={styles.itemHeaderRight}>
            <Text style={[styles.quantity, { color: item.movement_type === 'SALIDA' ? colors.danger : colors.primary }]}>
              {item.movement_type === 'SALIDA' ? '-' : '+'}{item.quantity}
            </Text>
            <View
              style={[
                styles.syncDot,
                { backgroundColor: item.synced ? colors.primary : colors.warning },
              ]}
            />
          </View>
        </View>
        <Text
          style={[styles.sku, { color: colors.text }]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          SKU: {item.product_sku}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {new Date(item.device_timestamp).toLocaleString()}
        </Text>
      </Card>
    ),
    [colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.text }]}>Kardex</Text>
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>{total} registros</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.movement_id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={() => loadData(false)}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            Sin movimientos registrados
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerLogo: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  count: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  item: {
    padding: SPACING.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  type: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quantity: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sku: {
    fontSize: FONT_SIZE.sm,
    fontFamily: 'monospace',
    marginBottom: SPACING.xs,
  },
  time: {
    fontSize: FONT_SIZE.xs,
  },
  empty: {
    textAlign: 'center',
    marginTop: SPACING.xxl,
    fontSize: FONT_SIZE.md,
  },
});
