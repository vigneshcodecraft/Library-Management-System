import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import mysql from 'mysql2/promise';
// Create a function to initialize the database connection and perform migrations
async function initializeDb() {
  // Database URL
  const databaseUrl = 'mysql://user:user_password@localhost:3306/library_db';
  //   Connection for migrations
  const migrationClient = await mysql.createConnection({
    uri: databaseUrl,
    multipleStatements: true, // Required for running migrations
  });
  //   Perform migrations
  await migrate(drizzle(migrationClient), {
    migrationsFolder:
      'c:/Users/vigneshtr/projects/Library-Management-System/drizzle/migrations', // Adjust this path to your migrations folder
  });
  await migrationClient.end();
}
initializeDb();
