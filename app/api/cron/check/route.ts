import { NextRequest, NextResponse } from "next/server";
import {
  login,
  fetchDiligenceData,
  getTodayKey,
  parseDayStatus,
  sendWebhookNotification,
} from "@/lib/diligence";

// Vercel Cron: chạy mỗi phút trong các khung giờ UTC:
//   04:xx - 05:xx  →  ICT 11:xx - 12:xx  (nhắc báo cáo đầu ngày)
//   12:xx - 13:xx  →  ICT 19:xx - 20:xx  (nhắc báo cáo cuối ngày)
// Thứ 2 - Thứ 6 (1-5)
// vercel.json: "* 4,5,12,13 * * 1-5"

export async function GET(req: NextRequest) {
  // Bảo vệ endpoint bằng CRON_SECRET
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = process.env.API_USERNAME;
  const password = process.env.API_PASSWORD;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!username || !password || !webhookUrl) {
    return NextResponse.json(
      { error: "Missing env: API_USERNAME, API_PASSWORD, or WEBHOOK_URL" },
      { status: 500 }
    );
  }

  // Giờ hiện tại theo múi giờ Việt Nam
  const nowVN = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const hour = nowVN.getHours();
  const minute = nowVN.getMinutes();

  const isMorningWindow = hour === 11; // 11:00 - 11:59 ICT
  const isEveningWindow = hour === 19; // 19:00 - 19:59 ICT

  if (!isMorningWindow && !isEveningWindow) {
    return NextResponse.json({
      skipped: true,
      reason: "Outside notification windows",
      currentHourVN: hour,
    });
  }

  // Login để lấy token mới (token tự gia hạn mỗi lần)
  let token: string;
  try {
    token = await login(username, password);
  } catch (err) {
    return NextResponse.json(
      { error: `Login failed: ${String(err)}` },
      { status: 500 }
    );
  }

  // Lấy dữ liệu chuyên cần
  let data;
  try {
    data = await fetchDiligenceData(token);
  } catch (err) {
    return NextResponse.json(
      { error: `Fetch data failed: ${String(err)}` },
      { status: 500 }
    );
  }

  const rows: Record<string, unknown>[] = data?.Data?.Data ?? [];
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "No data returned from API" },
      { status: 500 }
    );
  }

  const dayKey = getTodayKey();
  const row = rows[0];
  const status = parseDayStatus(row, dayKey);
  const userName = (row["UserDisplayName"] as string) || "Bạn";

  const dateStr = `${String(nowVN.getDate()).padStart(2, "0")}/${String(nowVN.getMonth() + 1).padStart(2, "0")}/${nowVN.getFullYear()}`;
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  let message = "";
  let shouldNotify = false;

  if (isMorningWindow && !status.hasStartReport) {
    message =
      `⏰ *Nhắc nhở báo cáo đầu ngày - ${dateStr}* (${timeStr})\n\n` +
      `❌ *${userName}* chưa báo cáo task đầu ngày!\n\n` +
      `Vui lòng report task đầu ngày ngay nhé 🙏`;
    shouldNotify = true;
  }

  if (isEveningWindow && !status.hasEndReport) {
    message =
      `🌙 *Nhắc nhở báo cáo cuối ngày - ${dateStr}* (${timeStr})\n\n` +
      `❌ *${userName}* chưa báo cáo cuối ngày!\n\n` +
      `Vui lòng check out và report cuối ngày trước khi nghỉ 🙏`;
    shouldNotify = true;
  }

  if (!shouldNotify) {
    return NextResponse.json({
      notified: false,
      message: "All reports completed for today",
      dayKey,
      status,
    });
  }

  try {
    await sendWebhookNotification(webhookUrl, message);
    return NextResponse.json({
      notified: true,
      message,
      dayKey,
      timeVN: timeStr,
      status,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook failed: ${String(err)}` },
      { status: 500 }
    );
  }
}
