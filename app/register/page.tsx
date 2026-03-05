import { register } from "@/lib/actions";
import { styles } from "@/lib/styles";

export default function RegisterPage() {
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
          Tạo tài khoản mới
        </p>

        <div style={styles.card}>
          <h2 style={{ marginTop: 0, marginBottom: 20 }}>Đăng ký</h2>

          <form action={register}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tên hiển thị</label>
              <input
                name="display_name"
                type="text"
                required
                placeholder="Nguyễn Văn A"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email đăng nhập web</label>
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
              Tạo tài khoản
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 14, color: "#666" }}>
            Đã có tài khoản?{" "}
            <a href="/login" style={{ color: "#1677ff" }}>
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
