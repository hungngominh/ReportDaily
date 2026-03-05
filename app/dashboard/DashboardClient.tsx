"use client";

import { useTransition } from "react";
import { saveConfig, logout } from "@/lib/actions";
import { styles, t, icons } from "@/lib/styles";
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

function Icon({ html, style }: { html: string; style?: React.CSSProperties }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} style={{ display: "inline-flex", ...style }} />;
}

function StatusBadge({ done }: { done: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: done ? t.success : t.danger,
        background: done ? t.successBg : t.dangerBg,
        padding: "4px 10px",
        borderRadius: 20,
      }}
    >
      <Icon html={done ? icons.check : icons.x} />
      {done ? "Hoàn thành" : "Chưa"}
    </span>
  );
}

export function DashboardClient({ displayName, config, status }: Props) {
  const [saving, startSave] = useTransition();
  const [loggingOut, startLogout] = useTransition();

  const selectStyle: React.CSSProperties = {
    ...styles.input,
    width: "auto",
    minWidth: 80,
    padding: "8px 12px",
    cursor: "pointer",
  };

  const textareaStyle: React.CSSProperties = {
    ...styles.input,
    resize: "vertical",
    fontFamily: t.font,
    lineHeight: 1.5,
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                background: t.primary,
                color: "#fff",
              }}
            >
              <Icon html={icons.clipboard} />
            </div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Daily Reminder
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textMuted }}>
              <Icon html={icons.user} />
              {displayName}
            </span>
            <form
              action={logout}
              onSubmit={(e) => {
                e.preventDefault();
                startLogout(() => logout());
              }}
            >
              <button style={styles.btnDanger} type="submit" disabled={loggingOut}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon html={icons.logOut} />
                  {loggingOut ? "..." : "Đăng xuất"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Today status */}
        <div style={{ ...styles.card, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon html={icons.calendar} style={{ color: t.primary }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Trạng thái hôm nay</h3>
            {status && !status.error && (
              <span style={{ fontSize: 12, color: t.textLight, marginLeft: "auto" }}>
                {status.dayKey.slice(0, 2)}/{status.dayKey.slice(2)}
              </span>
            )}
          </div>
          {status?.error ? (
            <div style={styles.error}>{status.error}</div>
          ) : status ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(
                [
                  ["Báo cáo đầu ngày", status.hasStartReport],
                  ["Check out", status.hasCheckOut],
                  ["Báo cáo cuối ngày", status.hasEndReport],
                ] as [string, boolean][]
              ).map(([label, done]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: t.bg,
                    borderRadius: t.radiusSm,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                  <StatusBadge done={done} />
                </div>
              ))}
              {status.info && (
                <pre
                  style={{
                    margin: 0,
                    background: t.bg,
                    padding: 12,
                    borderRadius: t.radiusSm,
                    fontSize: 12,
                    whiteSpace: "pre-wrap",
                    color: t.textMuted,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  {status.info}
                </pre>
              )}
            </div>
          ) : (
            <p style={{ color: t.textLight, fontSize: 14, margin: 0 }}>
              Cấu hình tài khoản Alliance bên dưới để xem trạng thái.
            </p>
          )}
        </div>

        {/* Config form */}
        <div style={styles.card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <Icon html={icons.settings} style={{ color: t.primary }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Cấu hình</h3>
          </div>

          <form
            action={saveConfig}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startSave(() => saveConfig(fd));
            }}
          >
            {/* Account section */}
            <p style={styles.sectionTitle}>Tài khoản Alliance</p>
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
            <div style={styles.divider}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Icon html={icons.clock} style={{ color: t.primary }} />
                <p style={{ ...styles.sectionTitle, margin: 0 }}>Lịch nhắc nhở</p>
              </div>

              {/* Morning */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc báo cáo đầu ngày</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: t.textMuted }}>Từ</span>
                  <select name="morning_start" defaultValue={config?.morning_start ?? 11} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13, color: t.textMuted }}>đến</span>
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
                  <span style={{ fontSize: 13, color: t.textMuted }}>Từ</span>
                  <select name="evening_start" defaultValue={config?.evening_start ?? 19} style={selectStyle}>
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 13, color: t.textMuted }}>đến</span>
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
                  <span style={{ fontSize: 13, color: t.textMuted }}>phút / lần</span>
                </div>
              </div>
            </div>

            {/* Message templates */}
            <div style={styles.divider}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon html={icons.message} style={{ color: t.primary }} />
                <p style={{ ...styles.sectionTitle, margin: 0 }}>Nội dung tin nhắn</p>
              </div>
              <p style={{ fontSize: 12, color: t.textLight, margin: "0 0 12px" }}>
                Biến hỗ trợ:{" "}
                <code style={{ background: t.bg, padding: "2px 5px", borderRadius: 3, fontSize: 11 }}>{"{name}"}</code>{" "}
                <code style={{ background: t.bg, padding: "2px 5px", borderRadius: 3, fontSize: 11 }}>{"{date}"}</code>{" "}
                <code style={{ background: t.bg, padding: "2px 5px", borderRadius: 3, fontSize: 11 }}>{"{time}"}</code>
                {" "}— Để trống = mặc định
              </p>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc đầu ngày</label>
                <textarea
                  name="morning_message"
                  rows={3}
                  defaultValue={config?.morning_message ?? ""}
                  placeholder={"*{name}* ơi! Hôm nay {date} rồi mà chưa report đầu ngày"}
                  style={textareaStyle}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nhắc cuối ngày</label>
                <textarea
                  name="evening_message"
                  rows={3}
                  defaultValue={config?.evening_message ?? ""}
                  placeholder={"*{name}* ơi! {time} rồi, check out và report cuối ngày đi"}
                  style={textareaStyle}
                />
              </div>
            </div>

            {/* Enable toggle + Save */}
            <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 16, marginTop: 4 }}>
              <div style={{ ...styles.formGroup, display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  name="enabled"
                  type="checkbox"
                  id="enabled"
                  defaultChecked={config?.enabled ?? true}
                  style={{ width: 18, height: 18, accentColor: t.primary, cursor: "pointer" }}
                />
                <label htmlFor="enabled" style={{ ...styles.label, margin: 0, fontWeight: 500, cursor: "pointer" }}>
                  Bật nhắc nhở tự động
                </label>
              </div>
              <button type="submit" style={styles.btn} disabled={saving}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <Icon html={icons.save} />
                  {saving ? "Đang lưu..." : "Lưu cấu hình"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
