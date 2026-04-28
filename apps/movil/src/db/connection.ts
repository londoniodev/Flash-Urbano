import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../constants/config';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (!db) {
      db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
    return db;
  } catch (error) {
    console.error('Error fatal al abrir la base de datos:', error);
    throw new Error('No se pudo inicializar el almacenamiento local.');
  }
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('La base de datos no ha sido inicializada. Llama a initDatabase primero.');
  }
  return db;
}
