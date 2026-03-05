# Daily Report Reminder

Tự động nhắc nhở báo cáo đầu ngày và cuối ngày qua Google Chat.

## Tính năng

- **11:00 – 12:00**: Spam nhắc mỗi phút nếu chưa báo cáo task đầu ngày
- **19:00 – 20:00**: Spam nhắc mỗi phút nếu chưa check out / báo cáo cuối ngày
- Tự động dừng khi đã hoàn thành
- Trang web hiển thị trạng thái hôm nay

## Deploy lên Vercel

### Bước 1: Push lên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/report-daily-reminder.git
git push -u origin main
```

### Bước 2: Import vào Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo từ GitHub
3. Framework: **Next.js** (tự detect)
4. Click **Deploy**

### Bước 3: Cấu hình Environment Variables

Vào **Project Settings → Environment Variables**, thêm:

| Tên biến | Giá trị |
|----------|---------|
| `API_USERNAME` | Email đăng nhập (vd: `hung.ngominh@allianceitsc.com`) |
| `API_PASSWORD` | Mật khẩu đăng nhập |
| `WEBHOOK_URL` | Google Chat webhook URL |
| `CRON_SECRET` | Chuỗi bí mật bất kỳ (tạo bằng `openssl rand -hex 32`) |

### Bước 4: Bật Cron Jobs

Vercel Cron hoạt động tự động theo cấu hình trong `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check",
      "schedule": "* 4,5,12,13 * * 1-5"
    }
  ]
}
```

> Cron chạy mỗi phút trong các giờ UTC 4-5 (ICT 11-12) và 12-13 (ICT 19-20), thứ 2 đến thứ 6.

> **Lưu ý**: Vercel Cron yêu cầu plan **Hobby** (miễn phí) trở lên. Trên Hobby, cron chạy tối thiểu mỗi ngày 1 lần; để chạy mỗi phút cần **Pro plan**. Xem thêm: https://vercel.com/docs/cron-jobs

### Bước 5: Cấu hình CRON_SECRET trên Vercel

Vercel tự động truyền `CRON_SECRET` vào header `Authorization: Bearer <secret>` khi gọi cron endpoint. Đặt cùng giá trị trong Environment Variables.

## Chạy local

```bash
# Cài dependencies
npm install

# Copy env
cp .env.example .env.local
# Điền thông tin vào .env.local

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem trạng thái hôm nay.

## Test cron thủ công

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/check
```
