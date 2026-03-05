import { neon } from "@neondatabase/serverless";

// Lazy singleton - reuse connection across requests in same lambda
let _sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export interface UserConfig {
  id: number;
  user_id: number;
  api_username: string;
  api_password: string;
  webhook_url: string;
  enabled: boolean;
  updated_at: string;
}
