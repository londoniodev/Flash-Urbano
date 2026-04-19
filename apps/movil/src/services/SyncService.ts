import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPendingEntries, markAsSynced, incrementSyncAttempts } from './KardexService';
import { SYNC_BATCH_SIZE, SYNC_RETRY_MAX, API_BASE_URL } from '../constants/config';
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

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  private async sendBatch(entries: KardexEntry[]): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, failed: 0, skipped: 0 };
    const successIds: string[] = [];

    // Skip entries that exceeded retry limit
    const skippedEntries = entries.filter((e) => e.sync_attempts >= SYNC_RETRY_MAX);
    result.skipped = skippedEntries.length;
    if (skippedEntries.length > 0) {
      markAsSynced(skippedEntries.map((e) => e.movement_id));
    }

    const retryable = entries.filter((e) => e.sync_attempts < SYNC_RETRY_MAX);
    if (retryable.length === 0) return result;

    const token = await this.getAuthToken();

    // Send each entry individually to our NestJS /inventory/move endpoint
    for (const entry of retryable) {
      try {
        const res = await fetch(`${API_BASE_URL}/inventory/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            // The backend expects a productId (UUID). 
            // Since we store the SKU, the backend will need a lookup.
            // For now we pass the SKU in a field and the backend resolves it.
            productSku: entry.product_sku,
            movementType: entry.movement_type,
            quantity: entry.quantity,
            fromHubId: entry.from_hub_id || undefined,
            toHubId: entry.to_hub_id || undefined,
            notes: `Sincronizado desde móvil (${entry.movement_id})`,
          }),
        });

        if (res.ok) {
          successIds.push(entry.movement_id);
          result.synced += 1;
        } else {
          incrementSyncAttempts([entry.movement_id]);
          result.failed += 1;
        }
      } catch {
        incrementSyncAttempts([entry.movement_id]);
        result.failed += 1;
        await this.backoff(entry.sync_attempts);
      }
    }

    if (successIds.length > 0) {
      markAsSynced(successIds);
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
