"use client";

import { useTransition } from "react";
import { saveConfig, logout } from "@/lib/actions";
import { styles } from "@/lib/styles";
import type { UserConfig } from "@/lib/db";

interface Props {
  displayName: string;
  config: UserConfig | null;
  status: StatusResult | null;
}

interface StatusResult {
  hasStartReport: boolean;
  hasEndReport: boolean;
  hasCheckOut: boolean;
  color: string;
  info: string;
  error?: string;
  dayKey: string;
}

export function DashboardClient({ displayName, config, status }: Props) {
  const [saving, startSave] = useTransition();
  const [loggingOut, startLogout] = useTransition();

  return (
    <div style={{ ...styles.page, padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22 }}>📋 Daily Reminder</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#555" }}>👤 {displayName}</span>
            <form
              action={logout}
              onSubmit={(e) => {
                e.preventDefault();
                startLogout(() => logout());
              }}
            >
              <button style={{ ...styles.btnDanger, width: "auto" }} type="submit" disabled={loggingOut}>
                {loggingOut ? "..." : "Đăng xuất"}
              </button>
            </form>
          </div>
        </div>

        {/* Today status */}
        <div style={{ ...styles.card, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>📅 Trạng thái hôm nay</h3>
          {status?.error ? (
            <div style={styles.error}>❌ {status.error}</div>
          ) : status ? (
            <>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#888" }}>
                Ngày: {status.dayKey.slice(0, 2)}/{status.dayKey.slice(2)}
              </p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <tbody>
                  {(
                    [
                      ["Báo cáo đầu ngày", status.hasStartReport],
                      ["Check out", status.hasCheckOut],
                      ["Báo cáo cuối ngày", status.hasEndReport],
                    ] as [string, boolean][]
                  ).map(([label, done]) => (
                    <tr key={label}>
                      <td style={{ padding: "7px 0", borderBottom: "1px solid #f0f0f0" }}>{label}</td>
                      <td style={{ padding: "7px 0", borderBottom: "1px solid #f0f0f0" }}>
                        {done ? "✅ Hoàn thành" : "❌ Chưa"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {status.info && (
                <pre
                  style={{
                    marginTop: 10,
                    background: "#f5f5f5",
                    padding: 10,
                    borderRadius: 6,
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {status.info}
                </pre>
              )}
            </>
          ) : (
            <p style={{ color: "#aaa", fontSize: 14 }}>
              Chưa cấu hình tài khoản Alliance bên dưới.
            </p>
          )}
        </div>

        {/* Schedule info */}
        <div
          style={{
            ...styles.card,
            marginBottom: 16,
            background: "#e8f4fd",
            boxShadow: "none",
            border: "1px solid #bee3f8",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>⏰ Lịch nhắc nhở tự động</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8 }}>
            <li>
              <strong>11:00 – 12:00</strong>: Nhắc báo cáo đầu ngày (mỗi phút)
            </li>
            <li>
              <strong>19:00 – 20:00</strong>: Nhắc báo cáo cuối ngày + check out (mỗi phút)
            </li>
          </ul>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#555" }}>
            Thứ 2 – Thứ 6. Tự động dừng khi đã hoàn thành.
          </p>
        </div>

        {/* Config form */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>⚙️ Cấu hình tài khoản</h3>

          <form
            action={saveConfig}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startSave(() => saveConfig(fd));
            }}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Email tài khoản Alliance</label>
              <input
                name="api_username"
                type="email"
                required
                defaultValue={config?.api_username ?? ""}
                placeholder="hung.ngominh@allianceitsc.com"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu Alliance</label>
              <input
                name="api_password"
                type="password"
                required
                defaultValue={config?.api_password ?? ""}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Google Chat Webhook URL</label>
              <input
                name="webhook_url"
                type="url"
                required
                defaultValue={config?.webhook_url ?? ""}
                placeholder="https://chat.googleapis.com/v1/spaces/..."
                style={styles.input}
              />
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
                Vào Google Chat → Tên space → Manage webhooks → Add webhook
              </p>
            </div>
            <div style={{ ...styles.formGroup, display: "flex", alignItems: "center", gap: 8 }}>
              <input
                name="enabled"
                type="checkbox"
                id="enabled"
                defaultChecked={config?.enabled ?? true}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="enabled" style={{ ...styles.label, margin: 0, fontWeight: 400 }}>
                Bật nhắc nhở tự động
              </label>
            </div>
            <button type="submit" style={styles.btn} disabled={saving}>
              {saving ? "Đang lưu..." : "💾 Lưu cấu hình"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
