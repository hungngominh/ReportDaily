import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Report Reminder",
  description: "Tự động nhắc nhở báo cáo đầu ngày và cuối ngày",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              *, *::before, *::after { box-sizing: border-box; margin: 0; }
              body { -webkit-font-smoothing: antialiased; }
              input:focus, select:focus, textarea:focus {
                border-color: #3B82F6 !important;
                box-shadow: 0 0 0 3px rgba(59,130,246,.12);
              }
              button:hover:not(:disabled) { filter: brightness(0.92); }
              button:disabled { opacity: 0.6; cursor: not-allowed; }
              a { text-decoration: none; }
              a:hover { text-decoration: underline; }
              ::selection { background: #BFDBFE; color: #1E293B; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
