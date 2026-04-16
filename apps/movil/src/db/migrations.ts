import { getDatabase } from './connection';
import { CREATE_KARDEX_TABLE, CREATE_KARDEX_INDEX, CREATE_KARDEX_QR_INDEX } from './schema';

export function runMigrations(): void {
  const db = getDatabase();
  db.execSync('DROP TABLE IF EXISTS kardex_entries;');
  db.execSync(CREATE_KARDEX_TABLE);
  db.execSync(CREATE_KARDEX_INDEX);
  db.execSync(CREATE_KARDEX_QR_INDEX);
}
