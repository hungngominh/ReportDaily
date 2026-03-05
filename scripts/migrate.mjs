// Run: node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("Running migration...");

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS user_configs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_username TEXT NOT NULL DEFAULT '',
    api_password TEXT NOT NULL DEFAULT '',
    webhook_url TEXT NOT NULL DEFAULT '',
    enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

// v2: add schedule columns
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS morning_start INTEGER NOT NULL DEFAULT 11`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS morning_end INTEGER NOT NULL DEFAULT 12`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS evening_start INTEGER NOT NULL DEFAULT 19`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS evening_end INTEGER NOT NULL DEFAULT 20`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS interval_minutes INTEGER NOT NULL DEFAULT 1`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS last_morning_sent TIMESTAMPTZ`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS last_evening_sent TIMESTAMPTZ`;

// v3: add custom message templates
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS morning_message TEXT NOT NULL DEFAULT ''`;
await sql`ALTER TABLE user_configs ADD COLUMN IF NOT EXISTS evening_message TEXT NOT NULL DEFAULT ''`;

console.log("Done. Tables: users, user_configs created/updated.");
