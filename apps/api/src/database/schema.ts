import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'OPERATOR', 'CLIENT']);
export const packageStatusEnum = pgEnum('package_status', [
  'RECIBIDO',
  'EN_BODEGA',
  'EN_TRANSITO',
  'DESPACHADO',
  'ENTREGADO',
]);
export const movementTypeEnum = pgEnum('movement_type', ['INGRESO', 'TRASLADO', 'SALIDA']);

// ─── Tabla: Empresas (Clientes E-commerce B2B) ──────────
export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nit: varchar('nit', { length: 20 }).notNull().unique(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 20 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Sedes (Hubs / Bodegas) ──────────────────────
export const hubs = pgTable('hubs', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),     // ej: "Bodega Cali Centro"
  city: varchar('city', { length: 100 }).notNull(),       // ej: "Cali"
  address: text('address').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Usuarios ─────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull().default('OPERATOR'),
  companyId: uuid('company_id').references(() => companies.id),  // null para ADMIN/OPERATOR
  hubId: uuid('hub_id').references(() => hubs.id),               // Sede asignada (para operarios)
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Paquetes ─────────────────────────────────────
export const packages = pgTable('packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  hubId: uuid('hub_id').notNull().references(() => hubs.id),       // Sede actual
  qrCode: uuid('qr_code').notNull().unique().defaultRandom(),      // UUID para el QR impreso
  description: text('description').notNull(),
  status: packageStatusEnum('status').notNull().default('RECIBIDO'),
  weight: integer('weight'),                                        // en gramos (opcional)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Movimientos de Paquetes (Kardex) ─────────────
export const packageMovements = pgTable('package_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  packageId: uuid('package_id').notNull().references(() => packages.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  fromHubId: uuid('from_hub_id').references(() => hubs.id),  // null si es INGRESO
  toHubId: uuid('to_hub_id').notNull().references(() => hubs.id),
  operatorId: uuid('operator_id').notNull().references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
