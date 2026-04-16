import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/SyncService';
import { getPendingCount } from '../services/KardexService';
import { SyncResult } from '../types';

interface UseSyncReturn {
  pendingCount: number;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  triggerSync: () => Promise<void>;
  refreshPending: () => void;
}

export function useSync(): UseSyncReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refreshPending = useCallback(() => {
    setPendingCount(getPendingCount());
  }, []);

  useEffect(() => {
    refreshPending();

    const unsubscribe = syncService.subscribe((result) => {
      setLastSyncResult(result);
      setIsSyncing(false);
      refreshPending();
    });

    syncService.start();

    return () => {
      unsubscribe();
    };
  }, [refreshPending]);

  const triggerSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncPending();
      setLastSyncResult(result);
    } finally {
      setIsSyncing(false);
      refreshPending();
    }
  }, [refreshPending]);

  return { pendingCount, isSyncing, lastSyncResult, triggerSync, refreshPending };
}
