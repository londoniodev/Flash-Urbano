import { getDatabase } from './connection';
import { DROP_KARDEX_TABLE, CREATE_KARDEX_TABLE, CREATE_KARDEX_INDEX, CREATE_KARDEX_SKU_INDEX } from './schema';

export function runMigrations(): void {
  try {
    const db = getDatabase();
    // Ya no borramos la tabla en cada inicio para evitar bloqueos y pérdida de datos
    db.execSync(CREATE_KARDEX_TABLE);
    db.execSync(CREATE_KARDEX_INDEX);
    db.execSync(CREATE_KARDEX_SKU_INDEX);
    console.log('Migraciones completadas con éxito');
  } catch (error) {
    console.error('Error crítico en migraciones:', error);
    // No lanzamos el error para que la app pueda intentar arrancar
  }
}

