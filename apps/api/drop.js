const postgres = require('postgres');

async function drop() {
  const sql = postgres('postgres://postgres:postgres@localhost:5432/flash_urbano');
  
  try {
    await sql`DROP TABLE IF EXISTS package_movements CASCADE;`;
    await sql`DROP TABLE IF EXISTS packages CASCADE;`;
    await sql`DROP TYPE IF EXISTS package_status CASCADE;`;
    console.log("Tablas eliminadas con exito");
  } catch (error) {
    console.error("Error al eliminar tablas", error);
  } finally {
    await sql.end();
  }
}

drop();
