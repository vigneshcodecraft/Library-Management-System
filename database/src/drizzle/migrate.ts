import mysql from 'mysql2/promise';
import { AppEnvs } from '../../../read-env';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
async function main() {
  const migrateClient = mysql.createPool(AppEnvs.DATABASE_URL);
  const db = drizzle(migrateClient);
  await migrate(db, {
    migrationsFolder: './database/src/drizzle/migrations',
  });
  await migrateClient.end();
}

main();
