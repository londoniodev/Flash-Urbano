export const CREATE_KARDEX_TABLE = `
  CREATE TABLE IF NOT EXISTS kardex_entries (
    movement_id TEXT PRIMARY KEY NOT NULL,
    qr_code TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('INGRESO', 'SALIDA')),
    device_timestamp INTEGER NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0, 1)),
    sync_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_KARDEX_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_kardex_synced ON kardex_entries (synced);
`;

export const CREATE_KARDEX_QR_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_kardex_qr ON kardex_entries (qr_code);
`;
