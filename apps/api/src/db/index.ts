import "dotenv/config";

import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);

const env = process.env.NODE_ENV!;

export const db =
  env === "production"
    ? drizzleNeon({ client: sql })
    : drizzlePg(process.env.DATABASE_URL!);
