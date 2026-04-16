/**
 * @flash-urbano/shared
 * Tipos e interfaces TypeScript compartidos entre API, Web y Móvil.
 */

// ─── Roles del Sistema ───────────────────────────────────
export type UserRole = 'ADMIN' | 'OPERATOR' | 'CLIENT';

// ─── Estados de un Paquete ───────────────────────────────
export type PackageStatus =
  | 'RECIBIDO'     // Ingresó a la bodega
  | 'EN_BODEGA'    // Almacenado esperando despacho
  | 'EN_TRANSITO'  // En traslado entre sedes
  | 'DESPACHADO'   // Salió para entrega al cliente final
  | 'ENTREGADO';   // Entregado exitosamente

// ─── Tipos de Movimiento (Kardex) ────────────────────────
export type MovementType = 'INGRESO' | 'TRASLADO' | 'SALIDA';

// ─── Interfaces de Entidades ─────────────────────────────
export interface Company {
  id: string;
  name: string;
  nit: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
}

export interface Hub {
  id: string;
  name: string;       // ej: "Bodega Cali Centro"
  city: string;       // ej: "Cali", "Bogotá", "Medellín"
  address: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Package {
  id: string;
  companyId: string;
  hubId: string;       // Sede actual donde se encuentra
  qrCode: string;      // UUID único para el QR impreso
  description: string;
  status: PackageStatus;
  weight?: number;     // en gramos (opcional)
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageMovement {
  id: string;
  packageId: string;
  movementType: MovementType;
  fromHubId?: string;   // null si es INGRESO
  toHubId: string;
  operatorId: string;   // quién escaneó / registró
  notes?: string;
  createdAt: Date;
}
