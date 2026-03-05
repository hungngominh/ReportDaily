import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMyConfig } from "@/lib/actions";
import { login, fetchDiligenceData, getTodayKey, parseDayStatus } from "@/lib/diligence";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const config = await getMyConfig();

  // Try fetching today's status if config is set
  let status = null;
  if (config?.api_username && config?.api_password) {
    try {
      const token = await login(config.api_username, config.api_password);
      const data = await fetchDiligenceData(token);
      const rows = data?.Data?.Data ?? [];
      if (rows.length > 0) {
        const dayKey = getTodayKey();
        const s = parseDayStatus(rows[0], dayKey);
        status = { ...s, dayKey };
      }
    } catch (e) {
      status = {
        hasStartReport: false,
        hasEndReport: false,
        hasCheckOut: false,
        color: "",
        info: "",
        dayKey: getTodayKey(),
        error: String(e),
      };
    }
  }

  return (
    <DashboardClient
      displayName={session.displayName}
      config={config}
      status={status}
    />
  );
}
