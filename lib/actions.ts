"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, setSessionCookie, getSession } from "@/lib/session";
import type { User, UserConfig } from "@/lib/db";

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const displayName = (formData.get("display_name") as string).trim();

  if (!email || !password || !displayName) {
    redirect("/register?error=" + encodeURIComponent("Vui lòng điền đầy đủ thông tin"));
  }

  const existing = await query`SELECT id FROM users WHERE email = ${email}`;
  if (existing.length > 0) {
    redirect("/register?error=" + encodeURIComponent("Email đã được đăng ký"));
  }

  const hash = await bcrypt.hash(password, 10);
  const rows = await query`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (${email}, ${hash}, ${displayName})
    RETURNING id, email, display_name
  `;
  const user = rows[0] as unknown as User;

  await query`
    INSERT INTO user_configs (user_id) VALUES (${user.id})
    ON CONFLICT (user_id) DO NOTHING
  `;

  const token = await createSession({
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  });
  const cookieStore = await cookies();
  cookieStore.set(setSessionCookie(token));
  redirect("/dashboard");
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginWeb(formData: FormData): Promise<void> {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  const rows = await query`SELECT * FROM users WHERE email = ${email}`;
  if (rows.length === 0) {
    redirect("/login?error=" + encodeURIComponent("Email hoặc mật khẩu không đúng"));
  }

  const user = rows[0] as unknown as User;
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    redirect("/login?error=" + encodeURIComponent("Email hoặc mật khẩu không đúng"));
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    displayName: user.display_name,
  });
  const cookieStore = await cookies();
  cookieStore.set(setSessionCookie(token));
  redirect("/dashboard");
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

// ── Save config ───────────────────────────────────────────────────────────────
export async function saveConfig(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/login");

  const apiUsername = (formData.get("api_username") as string).trim();
  const apiPassword = formData.get("api_password") as string;
  const webhookUrl = (formData.get("webhook_url") as string).trim();
  const enabled = formData.get("enabled") === "on";

  await query`
    INSERT INTO user_configs (user_id, api_username, api_password, webhook_url, enabled, updated_at)
    VALUES (${session.userId}, ${apiUsername}, ${apiPassword}, ${webhookUrl}, ${enabled}, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      api_username = EXCLUDED.api_username,
      api_password = EXCLUDED.api_password,
      webhook_url  = EXCLUDED.webhook_url,
      enabled      = EXCLUDED.enabled,
      updated_at   = NOW()
  `;

  redirect("/dashboard");
}

// ── Get current user config ───────────────────────────────────────────────────
export async function getMyConfig(): Promise<UserConfig | null> {
  const session = await getSession();
  if (!session) return null;

  const rows = await query`
    SELECT * FROM user_configs WHERE user_id = ${session.userId}
  `;
  return (rows[0] as unknown as UserConfig) ?? null;
}
