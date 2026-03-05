import { login, fetchDiligenceData, getTodayKey, parseDayStatus } from "@/lib/diligence";

export const dynamic = "force-dynamic";

export default async function Home() {
  const nowVN = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );

  let status = null;
  let error = null;
  let userName = "";
  let dayKey = "";

  const username = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;

  if (username && password) {
    try {
      const token = await login(username, password);
      const data = await fetchDiligenceData(token);
      const rows = data?.Data?.Data ?? [];
      if (rows.length > 0) {
        dayKey = getTodayKey();
        status = parseDayStatus(rows[0], dayKey);
        userName = (rows[0]["UserDisplayName"] as string) || "";
      }
    } catch (e) {
      error = String(e);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "40px auto", padding: "0 20px" }}>
      <h1>📋 Daily Report Reminder</h1>

      <p style={{ color: "#666" }}>
        Giờ VN:{" "}
        <strong>
          {nowVN.toLocaleTimeString("vi-VN")} — {nowVN.toLocaleDateString("vi-VN")}
        </strong>
      </p>

      {!username && (
        <div style={{ background: "#fff3cd", padding: 16, borderRadius: 8, marginBottom: 16 }}>
          ⚠️ Chưa cấu hình biến môi trường. Xem hướng dẫn bên dưới.
        </div>
      )}

      {error && (
        <div style={{ background: "#fee", padding: 16, borderRadius: 8, color: "#c00", marginBottom: 16 }}>
          ❌ Lỗi: {error}
        </div>
      )}

      {status && (
        <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 8, marginBottom: 16 }}>
          <h2 style={{ marginTop: 0 }}>👤 {userName}</h2>
          <p style={{ margin: "0 0 12px" }}>
            Ngày kiểm tra:{" "}
            <strong>
              {dayKey.slice(0, 2)}/{dayKey.slice(2)}
            </strong>
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Báo cáo đầu ngày", status.hasStartReport],
                ["Check out", status.hasCheckOut],
                ["Báo cáo cuối ngày", status.hasEndReport],
              ].map(([label, done]) => (
                <tr key={label as string}>
                  <td style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>{label as string}</td>
                  <td style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                    {done ? "✅ Đã hoàn thành" : "❌ Chưa hoàn thành"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {status.info && (
            <pre
              style={{
                marginTop: 12,
                background: "#eee",
                padding: 10,
                borderRadius: 4,
                fontSize: 13,
                whiteSpace: "pre-wrap",
              }}
            >
              {status.info}
            </pre>
          )}
        </div>
      )}

      <div style={{ background: "#e8f4fd", padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
        <h3 style={{ marginTop: 0 }}>⏰ Lịch nhắc nhở tự động</h3>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>11:00 – 12:00</strong>: Nhắc báo cáo task đầu ngày (mỗi phút 1 lần)
          </li>
          <li>
            <strong>19:00 – 20:00</strong>: Nhắc báo cáo cuối ngày + check out (mỗi phút 1 lần)
          </li>
        </ul>
        <p style={{ margin: "8px 0 0", color: "#666" }}>
          Thứ 2 – Thứ 6. Tự động dừng khi đã hoàn thành.
        </p>
      </div>

      <div style={{ background: "#f0fff4", padding: 16, borderRadius: 8, fontSize: 14 }}>
        <h3 style={{ marginTop: 0 }}>⚙️ Cấu hình biến môi trường trên Vercel</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#d4edda" }}>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Tên biến</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["API_USERNAME", "Email đăng nhập (vd: hung.ngominh@allianceitsc.com)"],
              ["API_PASSWORD", "Mật khẩu đăng nhập"],
              ["WEBHOOK_URL", "URL Google Chat webhook"],
              ["CRON_SECRET", "Chuỗi bí mật bất kỳ để bảo vệ endpoint"],
            ].map(([key, desc]) => (
              <tr key={key} style={{ borderBottom: "1px solid #c3e6cb" }}>
                <td style={{ padding: "6px 8px", fontFamily: "monospace", fontWeight: "bold" }}>{key}</td>
                <td style={{ padding: "6px 8px", color: "#555" }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
