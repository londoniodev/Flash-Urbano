import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'OPERATOR', 'CLIENT']);
export const movementTypeEnum = pgEnum('movement_type', ['INGRESO', 'SALIDA', 'AJUSTE', 'TRASLADO']);

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

// ─── Tabla: Productos (SKUs del E-commerce) ──────────────
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  sku: varchar('sku', { length: 100 }).notNull(),                  // Código SKU único del cliente
  name: varchar('name', { length: 255 }).notNull(),
  barcode: varchar('barcode', { length: 255 }),                    // Código de barras EAN/UPC opcional
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Stock de Inventario por Sede ─────────────────
export const inventoryStock = pgTable('inventory_stock', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  hubId: uuid('hub_id').notNull().references(() => hubs.id),
  quantity: integer('quantity').notNull().default(0),              // Cantidad física actual
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tabla: Movimientos de Inventario (Kardex) ───────────
export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  quantity: integer('quantity').notNull(),                         // Cantidad que se movió (+/-)
  fromHubId: uuid('from_hub_id').references(() => hubs.id),        // null si es INGRESO nuevo
  toHubId: uuid('to_hub_id').references(() => hubs.id),            // null si es SALIDA/Baja
  operatorId: uuid('operator_id').notNull().references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
