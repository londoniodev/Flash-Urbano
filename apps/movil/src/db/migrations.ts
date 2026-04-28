import { initDatabase } from './connection';
import { DROP_KARDEX_TABLE, CREATE_KARDEX_TABLE, CREATE_KARDEX_INDEX, CREATE_KARDEX_SKU_INDEX } from './schema';

export async function runMigrations(): Promise<void> {
  try {
    const db = await initDatabase();
    // Ya no borramos la tabla en cada inicio para evitar bloqueos y pérdida de datos
    await db.execAsync(CREATE_KARDEX_TABLE);
    await db.execAsync(CREATE_KARDEX_INDEX);
    await db.execAsync(CREATE_KARDEX_SKU_INDEX);
    console.log('Migraciones completadas con éxito');
  } catch (error) {
    console.error('Error crítico en migraciones:', error);
    // No lanzamos el error para que la app pueda intentar arrancar
  }
}
