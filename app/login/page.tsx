import { loginWeb } from "@/lib/actions";
import { styles } from "@/lib/styles";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div
      style={{
        ...styles.page,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 360 }}>
        <h1 style={{ textAlign: "center", marginBottom: 8 }}>📋 Daily Reminder</h1>
        <p style={{ textAlign: "center", color: "#888", marginBottom: 24, fontSize: 14 }}>
          Đăng nhập để quản lý nhắc nhở của bạn
        </p>

        <div style={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>Đăng nhập</h2>

          {searchParams.error && (
            <div style={styles.error}>{searchParams.error}</div>
          )}

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

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" }}>
            Chưa có tài khoản?{" "}
            <a href="/register" style={{ color: "#1677ff" }}>
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
