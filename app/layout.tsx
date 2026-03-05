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
      <body>{children}</body>
    </html>
  );
}
