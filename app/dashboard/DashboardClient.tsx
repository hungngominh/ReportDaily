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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function DashboardClient({ displayName, config, status }: Props) {
  const [saving, startSave] = useTransition();
  const [loggingOut, startLogout] = useTransition();

  const selectStyle: React.CSSProperties = {
    ...styles.input,
    width: "auto",
    minWidth: 70,
    padding: "8px 10px",
  };

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

        {/* Config form */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>⚙️ Cấu hình</h3>

          <form
            action={saveConfig}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startSave(() => saveConfig(fd));
            }}
          >
            {/* Account section */}
            <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 12px" }}>
              Tài khoản Alliance
            </p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
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
              <label style={styles.label}>Mật khẩu</label>
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
            </div>

            {/* Schedule section */}
            <div style={{ borderTop: "1px solid #f0f0f0", margin: "20px 0 16px", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 12px" }}>
                ⏰ Lịch nhắc nhở
              </p>

              {/* Morning */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc báo cáo đầu ngày</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13 }}>Từ</span>
                  <select name="morning_start" defaultValue={config?.morning_start ?? 11} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13 }}>đến</span>
                  <select name="morning_end" defaultValue={config?.morning_end ?? 12} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Evening */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc báo cáo cuối ngày</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13 }}>Từ</span>
                  <select name="evening_start" defaultValue={config?.evening_start ?? 19} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13 }}>đến</span>
                  <select name="evening_end" defaultValue={config?.evening_end ?? 20} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interval */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Khoảng cách giữa mỗi lần nhắc</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select name="interval_minutes" defaultValue={config?.interval_minutes ?? 1} style={selectStyle}>
                    {[1, 2, 3, 5, 10, 15, 20, 30, 60].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13 }}>phút / lần</span>
                </div>
              </div>
            </div>

            {/* Message templates section */}
            <div style={{ borderTop: "1px solid #f0f0f0", margin: "20px 0 16px", paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#555", margin: "0 0 4px" }}>
                💬 Nội dung tin nhắn
              </p>
              <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
                Biến hỗ trợ: <code>{"{name}"}</code> = tên, <code>{"{date}"}</code> = ngày, <code>{"{time}"}</code> = giờ. Để trống = dùng mặc định.
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc đầu ngày</label>
                <textarea
                  name="morning_message"
                  rows={3}
                  defaultValue={config?.morning_message ?? ""}
                  placeholder={"⏰ *{name}* ơi! Hôm nay {date} rồi mà chưa report đầu ngày 🙏"}
                  style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc cuối ngày</label>
                <textarea
                  name="evening_message"
                  rows={3}
                  defaultValue={config?.evening_message ?? ""}
                  placeholder={"🌙 *{name}* ơi! {time} rồi, check out và report cuối ngày đi nào 🙏"}
                  style={{ ...styles.input, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>

            {/* Enable toggle */}
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
