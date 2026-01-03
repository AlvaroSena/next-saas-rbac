import "dotenv/config";

import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

const env = process.env.NODE_ENV;

export const db =
  env === "production"
    ? drizzleNeon(
        new Pool({
          connectionString: process.env.DATABASE_URL!,
        })
      )
    : drizzlePg(process.env.DATABASE_URL!);
