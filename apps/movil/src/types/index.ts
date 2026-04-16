export enum MovementType {
  INGRESO = 'INGRESO',
  SALIDA = 'SALIDA',
}

export interface KardexEntry {
  movement_id: string;
  qr_code: string;
  movement_type: MovementType;
  operator_id: string;
  device_timestamp: number;
  synced: 0 | 1;
  sync_attempts: number;
  created_at: string;
}

export interface SyncResult {
  synced: number;
  failed: number;
  skipped: number;
}

export interface NetworkState {
  isConnected: boolean;
  type: string | null;
}
