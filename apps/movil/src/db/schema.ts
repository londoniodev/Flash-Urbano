export const DROP_KARDEX_TABLE = `
  DROP TABLE IF EXISTS kardex_entries;
`;

export const CREATE_KARDEX_TABLE = `
  CREATE TABLE IF NOT EXISTS kardex_entries (
    movement_id TEXT PRIMARY KEY NOT NULL,
    product_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    operator_id TEXT NOT NULL,
    from_hub_id TEXT,
    to_hub_id TEXT,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('INGRESO', 'SALIDA', 'AJUSTE', 'TRASLADO')),
    device_timestamp INTEGER NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0 CHECK (synced IN (0, 1)),
    sync_attempts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

export const CREATE_KARDEX_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_kardex_synced ON kardex_entries (synced);
`;

export const CREATE_KARDEX_SKU_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_kardex_sku ON kardex_entries (product_sku);
`;
