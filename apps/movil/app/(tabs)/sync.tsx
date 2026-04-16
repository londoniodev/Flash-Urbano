import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSync } from '../../src/hooks/useSync';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { Button, Card, Alert } from '../../src/components/Alvarosky';
import { COLORS, FONT_SIZE, SPACING } from '../../src/constants/theme';

export default function SyncScreen() {
  const { pendingCount, isSyncing, lastSyncResult, triggerSync } = useSync();
  const network = useNetworkStatus();
  const colors = COLORS.dark;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sincronización</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.statusCard}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Estado de Red</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: network.isConnected ? colors.primary : colors.danger },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {network.isConnected ? 'Conectado' : 'Sin conexión'}
            </Text>
            {network.type && (
              <Text style={[styles.networkType, { color: colors.textMuted }]}>
                ({network.type})
              </Text>
            )}
          </View>
        </Card>

        <Card style={styles.statusCard}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Pendientes</Text>
          <Text style={[styles.pendingNumber, { color: pendingCount > 0 ? colors.warning : colors.primary }]}>
            {pendingCount}
          </Text>
          <Text style={[styles.pendingLabel, { color: colors.textMuted }]}>
            {pendingCount === 1 ? 'registro por sincronizar' : 'registros por sincronizar'}
          </Text>
        </Card>

        {lastSyncResult && (
          <Card style={styles.statusCard}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Última Sincronización</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.primary }]}>
                  {lastSyncResult.synced}
                </Text>
                <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Enviados</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.danger }]}>
                  {lastSyncResult.failed}
                </Text>
                <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Fallidos</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.textMuted }]}>
                  {lastSyncResult.skipped}
                </Text>
                <Text style={[styles.resultLabel, { color: colors.textMuted }]}>Omitidos</Text>
              </View>
            </View>
          </Card>
        )}

        {!network.isConnected && (
          <Alert
            message="Los datos se sincronizarán automáticamente al recuperar la conexión"
            variant="warning"
          />
        )}

        <Button
          title={isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
          onPress={triggerSync}
          loading={isSyncing}
          disabled={!network.isConnected || pendingCount === 0}
          style={styles.syncButton}
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
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statusCard: {
    padding: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  networkType: {
    fontSize: FONT_SIZE.sm,
  },
  pendingNumber: {
    fontSize: FONT_SIZE.display,
    fontWeight: '800',
    lineHeight: FONT_SIZE.display * 1.1,
  },
  pendingLabel: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  resultLabel: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  syncButton: {
    marginTop: SPACING.sm,
  },
});
