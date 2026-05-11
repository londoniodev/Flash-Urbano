export enum MovementType {
  INGRESO = 'INGRESO',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
  TRASLADO = 'TRASLADO',
}

export interface Hub {
  id: string;
  name: string;
  city: string;
}

export interface KardexEntry {
  movement_id: string;
  product_sku: string;
  product_name?: string;
  movement_type: MovementType;
  quantity: number;
  operator_id: string;
  from_hub_id?: string;
  to_hub_id?: string;
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
