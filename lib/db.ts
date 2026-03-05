import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

export function getDb() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}

// Helper: run a tagged template query and always get rows back as an array
export async function query(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  const sql = getDb();
  const result = await sql(strings, ...values);
  return result as Record<string, unknown>[];
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
  morning_start: number;
  morning_end: number;
  evening_start: number;
  evening_end: number;
  interval_minutes: number;
  last_morning_sent: string | null;
  last_evening_sent: string | null;
  updated_at: string;
}
