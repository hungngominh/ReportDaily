import { loginWeb } from "@/lib/actions";
import { styles, t, icons } from "@/lib/styles";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div
      style={{
        ...styles.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 380, padding: "0 16px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 12,
              background: t.primary,
              color: "#fff",
              marginBottom: 16,
            }}
            dangerouslySetInnerHTML={{ __html: icons.clipboard }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Daily Reminder
          </h1>
          <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>
            Đăng nhập để quản lý nhắc nhở
          </p>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.error}>{error}</div>}

          <form action={loginWeb}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mật khẩu</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
            <button type="submit" style={styles.btn}>
              Đăng nhập
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: t.textMuted }}>
            Chưa có tài khoản?{" "}
            <a href="/register" style={{ color: t.primary, fontWeight: 600 }}>
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
