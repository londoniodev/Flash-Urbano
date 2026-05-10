import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSync } from '../../src/hooks/useSync';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import { Button, Card, Alert } from '../../src/components/Alvarosky';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '../../src/constants/theme';

export default function SyncScreen() {
  const { pendingCount, isSyncing, lastSyncResult, triggerSync } = useSync();
  const network = useNetworkStatus();
  const colors = COLORS.dark;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Sincronización</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Network Status */}
        <Card style={styles.statusCard}>
          <Text style={styles.label}>Estado de Red</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: network.isConnected ? colors.success + '20' : colors.danger + '20' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: network.isConnected ? colors.success : colors.danger },
                ]}
              />
              <Text style={[styles.statusText, { color: network.isConnected ? colors.success : colors.danger }]}>
                {network.isConnected ? 'Conectado' : 'Sin conexión'}
              </Text>
            </View>
            {network.type && (
              <Text style={styles.networkType}>
                {network.type.toUpperCase()}
              </Text>
            )}
          </View>
        </Card>

        {/* Pending Count */}
        <Card style={styles.pendingCard}>
          <Text style={styles.label}>Pendientes</Text>
          <Text style={[styles.pendingNumber, { color: pendingCount > 0 ? colors.primary : colors.success }]}>
            {pendingCount}
          </Text>
          <Text style={styles.pendingLabel}>
            {pendingCount === 1 ? 'registro por sincronizar' : 'registros por sincronizar'}
          </Text>
        </Card>

        {/* Last Sync Result */}
        {lastSyncResult && (
          <Card style={styles.statusCard}>
            <Text style={styles.label}>Última Sincronización</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.success }]}>
                  {lastSyncResult.synced}
                </Text>
                <Text style={styles.resultLabel}>Enviados</Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.danger }]}>
                  {lastSyncResult.failed}
                </Text>
                <Text style={styles.resultLabel}>Fallidos</Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
              <View style={styles.resultItem}>
                <Text style={[styles.resultNumber, { color: colors.textMuted }]}>
                  {lastSyncResult.skipped}
                </Text>
                <Text style={styles.resultLabel}>Omitidos</Text>
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

const colors = COLORS.dark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerRow: {
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
    color: colors.text,
    letterSpacing: -0.3,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statusCard: {
    padding: SPACING.md,
  },
  pendingCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  networkType: {
    fontSize: FONT_SIZE.xs,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  pendingNumber: {
    fontSize: FONT_SIZE.display,
    fontWeight: '900',
    lineHeight: FONT_SIZE.display * 1.1,
  },
  pendingLabel: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
    color: colors.textMuted,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultDivider: {
    width: 1,
    height: 36,
  },
  resultNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
  },
  resultLabel: {
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    color: colors.textMuted,
  },
  syncButton: {
    marginTop: SPACING.sm,
  },
});
