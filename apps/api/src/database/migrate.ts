import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
  }

  const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('🔄 Corriendo migraciones...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('✅ Migraciones aplicadas con éxito!');

  await migrationClient.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error('❌ Error corriendo migraciones:', err);
  process.exit(1);
});
