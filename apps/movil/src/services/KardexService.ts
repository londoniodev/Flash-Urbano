import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/connection';
import { KardexEntry, MovementType } from '../types';

export function recordMovement(qrCode: string, movementType: MovementType, operatorId: string): KardexEntry {
  const db = getDatabase();
  const entry: KardexEntry = {
    movement_id: uuidv4(),
    qr_code: qrCode,
    movement_type: movementType,
    operator_id: operatorId,
    device_timestamp: Date.now(),
    synced: 0,
    sync_attempts: 0,
    created_at: new Date().toISOString(),
  };

  db.runSync(
    `INSERT INTO kardex_entries (movement_id, qr_code, operator_id, movement_type, device_timestamp, synced, sync_attempts, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.movement_id,
      entry.qr_code,
      entry.operator_id,
      entry.movement_type,
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
  const db = getDatabase();
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM kardex_entries WHERE synced = 0`
  );
  return result?.count ?? 0;
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
