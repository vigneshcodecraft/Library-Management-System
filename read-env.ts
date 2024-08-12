//Note: We can give a robust implementation using a validation lib such as zod and then export the parsed object
import { configDotenv } from 'dotenv';
configDotenv();
export interface AppEnv {
  DATABASE_URL: string;
}

export const AppEnvs = process.env as unknown as AppEnv;
