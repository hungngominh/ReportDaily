# Daily Report Reminder — Multi-user

Ứng dụng Next.js tự động nhắc nhở báo cáo đầu ngày / cuối ngày qua Google Chat.
Mỗi người dùng tự đăng ký, cấu hình tài khoản Alliance và webhook riêng.

## Tính năng

- Đăng ký / đăng nhập tài khoản web
- Mỗi user tự cấu hình email/mật khẩu Alliance + Google Chat webhook
- **11:00 – 12:00**: Spam nhắc mỗi phút nếu chưa báo cáo đầu ngày
- **19:00 – 20:00**: Spam nhắc mỗi phút nếu chưa báo cáo cuối ngày
- Tự động dừng khi đã hoàn thành
- Dashboard xem trạng thái hôm nay

## Hướng dẫn deploy

### Bước 1 — Tạo database Neon (miễn phí)

1. Vào [console.neon.tech](https://console.neon.tech) → **New Project**
2. Copy **Connection string** (dạng `postgresql://...`)
3. Chạy migration tạo bảng:
   ```bash
   npm install
   DATABASE_URL="postgresql://..." node scripts/migrate.mjs
   ```

### Bước 2 — Push lên GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/report-daily-reminder.git
git push -u origin master
```

### Bước 3 — Import vào Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → Import từ GitHub
2. Framework: **Next.js** (tự detect) → **Deploy**

### Bước 4 — Environment Variables

Vào **Project Settings → Environment Variables**, thêm:

| Biến | Giá trị |
|------|---------|
| `DATABASE_URL` | Connection string từ Neon |
| `JWT_SECRET` | Chuỗi ngẫu nhiên (32+ ký tự) |
| `CRON_SECRET` | Chuỗi ngẫu nhiên (32+ ký tự) |

Tạo secret ngẫu nhiên:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 5 — Redeploy

Sau khi thêm env vars, vào **Deployments → Redeploy**.

### Bước 6 — Sử dụng

1. Mở web → click **Đăng ký** → tạo tài khoản
2. Vào **Dashboard** → điền email/mật khẩu Alliance + Webhook URL → **Lưu**
3. Done! Cron tự chạy mỗi phút trong khung giờ đã định

---

## Cron schedule

```json
{ "schedule": "* 4,5,12,13 * * 1-5" }
```

| UTC | ICT | Mục đích |
|-----|-----|----------|
| 04:xx – 05:xx | 11:xx – 12:xx | Nhắc báo cáo đầu ngày |
| 12:xx – 13:xx | 19:xx – 20:xx | Nhắc báo cáo cuối ngày |

> **Vercel Hobby (miễn phí)**: tối đa 2 cron jobs, chạy mỗi phút.
> Xem: https://vercel.com/docs/cron-jobs

## Test cron thủ công

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check
```

## Chạy local

```bash
cp .env.example .env.local
# Điền DATABASE_URL, JWT_SECRET, CRON_SECRET
npm install
npm run dev
```
