import { getDatabase } from '../db/connection';
import { KardexEntry, MovementType } from '../types';

// Pure JS UUID generator to avoid native module dependency for OTA updates
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function recordMovement(
  productSku: string, 
  movementType: MovementType, 
  quantity: number,
  operatorId: string,
  fromHubId?: string,
  toHubId?: string
): KardexEntry {
  const db = getDatabase();
  const entry: KardexEntry = {
    movement_id: generateUUID(),
    product_sku: productSku,
    movement_type: movementType,
    quantity,
    operator_id: operatorId,
    from_hub_id: fromHubId,
    to_hub_id: toHubId,
    device_timestamp: Date.now(),
    synced: 0,
    sync_attempts: 0,
    created_at: new Date().toISOString(),
  };

  db.runSync(
    `INSERT INTO kardex_entries (movement_id, product_sku, quantity, operator_id, movement_type, from_hub_id, to_hub_id, device_timestamp, synced, sync_attempts, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.movement_id,
      entry.product_sku,
      entry.quantity,
      entry.operator_id,
      entry.movement_type,
      entry.from_hub_id || null,
      entry.to_hub_id || null,
      entry.device_timestamp,
      entry.synced,
      entry.sync_attempts,
      entry.created_at,
    ]
  );

  return entry;
}

export function getPendingEntries(limit: number): KardexEntry[] {
  const db = getDatabase();
  const rows = db.getAllSync<KardexEntry>(
    `SELECT * FROM kardex_entries WHERE synced = 0 ORDER BY device_timestamp ASC LIMIT ?`,
    [limit]
  );
  return rows;
}

export function markAsSynced(movementIds: string[]): void {
  if (movementIds.length === 0) return;
  const db = getDatabase();
  const placeholders = movementIds.map(() => '?').join(',');
  db.runSync(
    `UPDATE kardex_entries SET synced = 1 WHERE movement_id IN (${placeholders})`,
    movementIds
  );
}

export function incrementSyncAttempts(movementIds: string[]): void {
  if (movementIds.length === 0) return;
  const db = getDatabase();
  const placeholders = movementIds.map(() => '?').join(',');
  db.runSync(
    `UPDATE kardex_entries SET sync_attempts = sync_attempts + 1 WHERE movement_id IN (${placeholders})`,
    movementIds
  );
}

export function getPendingCount(): number {
  try {
    const db = getDatabase();
    const result = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count FROM kardex_entries WHERE synced = 0`
    );
    return result?.count ?? 0;
  } catch {
    // DB not initialized yet, return 0
    return 0;
  }
}

export function getHistory(limit: number, offset: number): KardexEntry[] {
  const db = getDatabase();
  return db.getAllSync<KardexEntry>(
    `SELECT * FROM kardex_entries ORDER BY device_timestamp DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
}

export function getTotalCount(): number {
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM kardex_entries`
  );
  return result?.count ?? 0;
}
