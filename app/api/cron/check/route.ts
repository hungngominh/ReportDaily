import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  login,
  fetchDiligenceData,
  getTodayKey,
  parseDayStatus,
  sendWebhookNotification,
} from "@/lib/diligence";
import type { UserConfig } from "@/lib/db";

// Vercel Cron schedule (vercel.json): "* 4,5,12,13 * * 1-5"
// UTC 04-05 = ICT 11-12 (nhắc đầu ngày)
// UTC 12-13 = ICT 19-20 (nhắc cuối ngày)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nowVN = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const hour = nowVN.getHours();
  const minute = nowVN.getMinutes();

  const isMorningWindow = hour === 11;
  const isEveningWindow = hour === 19;

  if (!isMorningWindow && !isEveningWindow) {
    return NextResponse.json({
      skipped: true,
      reason: "Outside notification windows",
      currentHourVN: hour,
    });
  }

  // Lấy tất cả users đã bật nhắc nhở và có đủ cấu hình
  const sql = getDb();
  const configs = (await sql`
    SELECT uc.*, u.display_name
    FROM user_configs uc
    JOIN users u ON u.id = uc.user_id
    WHERE uc.enabled = true
      AND uc.api_username <> ''
      AND uc.api_password <> ''
      AND uc.webhook_url <> ''
  `) as (UserConfig & { display_name: string })[];

  if (configs.length === 0) {
    return NextResponse.json({ skipped: true, reason: "No enabled configs" });
  }

  const dayKey = getTodayKey();
  const dateStr = `${dayKey.slice(0, 2)}/${dayKey.slice(2)}/${nowVN.getFullYear()}`;
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const results = await Promise.allSettled(
    configs.map(async (cfg) => {
      // Login để lấy token mới
      const token = await login(cfg.api_username, cfg.api_password);
      const data = await fetchDiligenceData(token);
      const rows: Record<string, unknown>[] = data?.Data?.Data ?? [];
      if (rows.length === 0) throw new Error("No data");

      const status = parseDayStatus(rows[0], dayKey);
      const userName = (rows[0]["UserDisplayName"] as string) || cfg.display_name;

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
        return { user: userName, notified: false, reason: "Already completed" };
      }

      await sendWebhookNotification(cfg.webhook_url, message);
      return { user: userName, notified: true, message };
    })
  );

  const summary = results.map((r, i) => {
    const name = configs[i].display_name;
    if (r.status === "fulfilled") return { name, ...r.value };
    return { name, error: String(r.reason) };
  });

  return NextResponse.json({ ok: true, timeVN: timeStr, dayKey, summary });
}
