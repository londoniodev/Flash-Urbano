import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { supabase } from './SupabaseClient';
import { getPendingEntries, markAsSynced, incrementSyncAttempts } from './KardexService';
import { SYNC_BATCH_SIZE, SYNC_RETRY_MAX, SYNC_BACKOFF_BASE_MS } from '../constants/config';
import { SyncResult, KardexEntry } from '../types';

type SyncListener = (result: SyncResult) => void;

class SyncService {
  private subscription: NetInfoSubscription | null = null;
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();

  start(): void {
    if (this.subscription) return;
    this.subscription = NetInfo.addEventListener(this.handleNetworkChange);
  }

  stop(): void {
    this.subscription?.();
    this.subscription = null;
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(result: SyncResult): void {
    this.listeners.forEach((fn) => fn(result));
  }

  private handleNetworkChange = (state: NetInfoState): void => {
    if (state.isConnected && state.isInternetReachable !== false) {
      this.syncPending();
    }
  };

  async syncPending(): Promise<SyncResult> {
    if (this.isSyncing) return { synced: 0, failed: 0, skipped: 0 };

    this.isSyncing = true;
    const totals: SyncResult = { synced: 0, failed: 0, skipped: 0 };

    try {
      let batch = getPendingEntries(SYNC_BATCH_SIZE);

      while (batch.length > 0) {
        const batchResult = await this.sendBatch(batch);
        totals.synced += batchResult.synced;
        totals.failed += batchResult.failed;
        totals.skipped += batchResult.skipped;

        if (batchResult.failed > 0) break;

        batch = getPendingEntries(SYNC_BATCH_SIZE);
      }

      this.notify(totals);
    } finally {
      this.isSyncing = false;
    }

    return totals;
  }

  private async sendBatch(entries: KardexEntry[]): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, failed: 0, skipped: 0 };
    const successIds: string[] = [];
    const failedIds: string[] = [];

    const payload = entries
      .filter((e) => e.sync_attempts < SYNC_RETRY_MAX)
      .map((e) => ({
        movement_id: e.movement_id,
        operator_id: e.operator_id,
        qr_code: e.qr_code,
        movement_type: e.movement_type,
        device_timestamp: e.device_timestamp,
        created_at: e.created_at,
      }));

    const skippedEntries = entries.filter((e) => e.sync_attempts >= SYNC_RETRY_MAX);
    result.skipped = skippedEntries.length;

    if (skippedEntries.length > 0) {
      markAsSynced(skippedEntries.map((e) => e.movement_id));
    }

    if (payload.length === 0) return result;

    try {
      const { error } = await supabase
        .from('kardex_entries')
        .upsert(payload, { onConflict: 'movement_id', ignoreDuplicates: true });

      if (error) {
        failedIds.push(...entries.map((e) => e.movement_id));
        result.failed = failedIds.length;
        incrementSyncAttempts(failedIds);
        return result;
      }

      successIds.push(...payload.map((e) => e.movement_id));
      markAsSynced(successIds);
      result.synced = successIds.length;
    } catch {
      const retryableIds = entries
        .filter((e) => e.sync_attempts < SYNC_RETRY_MAX)
        .map((e) => e.movement_id);
      incrementSyncAttempts(retryableIds);
      result.failed = retryableIds.length;

      await this.backoff(entries[0]?.sync_attempts ?? 0);
    }

    return result;
  }

  private backoff(attempt: number): Promise<void> {
    const delay = Math.min(2000 * Math.pow(2, attempt), 8000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  get syncing(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();
