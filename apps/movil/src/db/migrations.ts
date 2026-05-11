import { initDatabase } from './connection';
import { DROP_KARDEX_TABLE, CREATE_KARDEX_TABLE, CREATE_KARDEX_INDEX, CREATE_KARDEX_SKU_INDEX } from './schema';

export async function runMigrations(): Promise<void> {
  const db = await initDatabase();
  try {
    console.log('Iniciando validación de esquema...');
    // Intentamos una operación simple para ver si el esquema está bien
    await db.execAsync(CREATE_KARDEX_TABLE);
    await db.execAsync(CREATE_KARDEX_INDEX);
    await db.execAsync(CREATE_KARDEX_SKU_INDEX);
    
    // Verificación proactiva: validamos TODAS las columnas críticas.
    // Si la tabla es vieja y falta alguna columna, esto fallará y saltará al catch.
    await db.getFirstAsync('SELECT product_sku, product_name, quantity, operator_id, movement_type FROM kardex_entries LIMIT 0');
    
    console.log('Esquema validado correctamente');
  } catch (error) {
    console.warn('Inconsistencia de esquema detectada, recreando tablas:', error);
    try {
      await db.execAsync(DROP_KARDEX_TABLE);
      await db.execAsync(CREATE_KARDEX_TABLE);
      await db.execAsync(CREATE_KARDEX_INDEX);
      await db.execAsync(CREATE_KARDEX_SKU_INDEX);
      console.log('Tablas recreadas exitosamente');
    } catch (criticalError) {
      console.error('Error fatal recreando base de datos:', criticalError);
    }
  }
}
