import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { AppEnvs } from './read-env';
export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: AppEnvs.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
