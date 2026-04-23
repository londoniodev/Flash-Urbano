import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../constants/config';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  try {
    if (!db) {
      db = SQLite.openDatabaseSync(DB_NAME);
      db.execSync('PRAGMA journal_mode = WAL;');
      db.execSync('PRAGMA foreign_keys = ON;');
    }
    return db;
  } catch (error) {
    console.error('Error fatal al abrir la base de datos:', error);
    // En caso de error crítico, intentamos devolver una instancia básica o relanzar con info
    throw new Error('No se pudo inicializar el almacenamiento local.');
  }
}
