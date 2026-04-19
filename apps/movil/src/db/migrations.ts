import { getDatabase } from './connection';
import { DROP_KARDEX_TABLE, CREATE_KARDEX_TABLE, CREATE_KARDEX_INDEX, CREATE_KARDEX_SKU_INDEX } from './schema';

export function runMigrations(): void {
  const db = getDatabase();
  db.execSync(DROP_KARDEX_TABLE);
  db.execSync(CREATE_KARDEX_TABLE);
  db.execSync(CREATE_KARDEX_INDEX);
  db.execSync(CREATE_KARDEX_SKU_INDEX);
}

