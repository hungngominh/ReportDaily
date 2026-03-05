// Authenticate with username/password and get access token
export async function login(username: string, password: string): Promise<string> {
  const body = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    app_name: "App Alliance",
  });

  const res = await fetch("https://apicore.allianceitsc.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error("No access_token in response");
  return data.access_token;
}

// Fetch diligence data from API
export async function fetchDiligenceData(token: string) {
  const res = await fetch(
    "https://apicore.allianceitsc.com/api/v1/RP_UserDiligence_Monthly/Pivot/List",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Get today's date key in DDMM format (e.g. "0503" for 5 March), Vietnam timezone
export function getTodayKey(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}`;
}

export interface DayStatus {
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  hasStartReport: boolean;
  hasEndReport: boolean;
  info: string;
  color: string;
}

export function parseDayStatus(
  row: Record<string, unknown>,
  dayKey: string
): DayStatus {
  const info = (row[`IM_MoreInfo_${dayKey}`] as string) || "";
  const color = (row[`IM_BGColor_${dayKey}`] as string) || "";

  // #38f785 = full bonus (completed)
  // #ec4939 = red (missing something on a past workday)
  // #B2CDFC = blue (today, in progress)
  // #f2f7ff = future/weekend (not applicable)

  const noCheckout = info.includes("Check out: No");
  const noReport = info.includes("Report cuối ngày: No");
  const noCheckin = info.includes("Check in: No");
  const isFuture = color === "#f2f7ff" || color === "";

  return {
    hasCheckIn: !isFuture && !noCheckin,
    hasCheckOut: !isFuture && !noCheckout,
    hasStartReport: !isFuture && !noCheckin,
    hasEndReport: !isFuture && !noReport,
    info,
    color,
  };
}

// Send Card V2 message to Google Chat webhook with @all mention
export async function sendWebhookNotification(
  webhookUrl: string,
  text: string
) {
  const payload = {
    text: "<users/all>",
    cardsV2: [
      {
        cardId: "dailyReminder",
        card: {
          header: {
            title: "Daily Report Reminder",
            subtitle: text.split("\n")[0].replace(/\*/g, ""),
            imageUrl:
              "https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/notifications_active/default/48px.svg",
            imageType: "CIRCLE",
          },
          sections: [
            {
              widgets: [
                {
                  textParagraph: {
                    text: text.replace(/\n/g, "<br>"),
                  },
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
  return res.json();
}
