# Pomodoro Timer - Bài tập Capacitor

Ứng dụng Pomodoro Timer được xây dựng với React, Vite và Capacitor để chạy trên Android, iOS và Web.

## Tính năng

### Yêu cầu tối thiểu 
- ✅ Thiết lập chu kỳ 25/5 phút (có thể tùy chỉnh)
- ✅ Đếm ngược chạy cả khi app ở nền
- ✅ Gửi thông báo + rung khi hết phiên

### Mở rộng 
- ✅ Lưu lịch sử phiên làm việc
- ✅ Tuỳ chọn âm báo
- ✅ Thống kê hôm nay
- ✅ Tùy chỉnh thời gian làm việc/nghỉ
- ✅ Nghỉ dài sau N phiên

### UI & UX 
- ✅ Giao diện gọn gàng, hiện đại
- ✅ Responsive cho mobile và desktop
- ✅ Không crash, xử lý lỗi tốt

### Quyền truy cập 
- ✅ Xử lý quyền thông báo đúng cách
- ✅ Fallback cho web browser
- ✅ Haptic feedback trên thiết bị hỗ trợ

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn
- Android Studio (cho Android)
- Xcode (cho iOS, chỉ trên macOS)

### Bước 1: Cài đặt dependencies
\`\`\`bash
npm install
\`\`\`

### Bước 2: Build web
\`\`\`bash
npm run build
\`\`\`

### Bước 3: Sync với Capacitor
\`\`\`bash
npx cap sync
\`\`\`

### Bước 4: Chạy trên nền tảng

#### Web
\`\`\`bash
npm run dev
\`\`\`

#### Android
\`\`\`bash
npx cap open android
\`\`\`
Sau đó build và run từ Android Studio.

#### iOS
\`\`\`bash
npx cap open ios
\`\`\`
Sau đó build và run từ Xcode.

## Cấu trúc dự án

\`\`\`
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── pomodoro-timer.tsx  # Main timer component
│   ├── settings-panel.tsx  # Settings UI
│   ├── history-panel.tsx   # History UI
│   └── ui/                 # UI components
├── lib/
│   ├── capacitor-utils.ts  # Capacitor plugin wrappers
│   └── storage.ts          # LocalStorage helpers
├── public/
│   └── notification.mp3    # Notification sound
└── capacitor.config.ts     # Capacitor configuration
\`\`\`

## Plugins sử dụng

- `@capacitor/local-notifications` - Thông báo local
- `@capacitor/haptics` - Rung/haptic feedback
- `@capacitor/dialog` - Dialog native
- `@capacitor/app` - App lifecycle

## Ghi chú

- Thông báo chỉ hoạt động trên thiết bị thật hoặc emulator có Google Play Services
- Haptic feedback chỉ hoạt động trên thiết bị thật
- Web fallback sử dụng Web Notifications API và HTML5 Audio

## Chấm điểm

- Hoàn thành yêu cầu tối thiểu
- UI gọn, không crash
- Quyền truy cập xử lý đúng
- Làm mở rộng hoặc cải tiến

### 🎬 Live Preview


https://github.com/user-attachments/assets/e9aa1307-cd43-4224-85b7-24c3b4bb20fa

