# KHO BÁU TRIẾT HỌC (2D Multiplayer Online Game)

Một tựa game online 2D nơi người chơi hóa thân thành những nhà thám hiểm phiêu lưu trong thế giới triết học rộng lớn, tìm kiếm các **rương kho báu** chứa đựng những đại nghịch lý nhân sinh, trả lời câu hỏi và rút **4 Lá Bài Định Mệnh** để thay đổi điểm số.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Bản Đồ 2D Top-down Đa Địa Hình (2400 × 1800 px)
- **Đồng Cỏ Tri Thức:** Vùng đất khởi nguồn với thảm cỏ mềm mại và những bậc thang đá.
- **Rừng Sâu Đạo Đức:** Tán rừng cổ thụ bí ẩn nơi đặt ra các câu hỏi về chuẩn mực hành vi nhân loại.
- **Đền Cổ Bản Ngã:** Các thức cột cẩm thạch Hy Lạp cổ đại với những triết lý về danh tính cá nhân.
- **Hồ Nước Ý Thức:** Mặt nước lung linh gợn sóng với những câu hỏi về bản chất trí tuệ.
- **Hang Động Tự Do:** Khu vực thạch nhũ và tinh thể tím huyền bí về tự do ý chí và tiền định luận.
- **Tàn Tích Chân Lý:** Phế tích cổ xưa với các biểu tượng triết học cổ đại.

### 2. Nhân Vật & Điều Khiển Mượt Mà
- Hỗ trợ di chuyển 4 hướng tự do (Lên, Xuống, Trái, Phải):
  - Phím bàn phím: **W - A - S - D** hoặc **Các phím Mũi Tên**.
  - Phím tương tác: **E** hoặc **Space** khi đứng gần rương kho báu.
  - Phím điều khiển ảo D-Pad trên màn hình cảm ứng điện thoại / tablet.
- Tùy chọn màu áo choàng (Xanh dương, Lục bảo, Hổ phách, Đỏ ruby, Tím thạch anh, Hồng, Cyan).
- Animation bước chân, hiệu ứng bóng mờ động, nhịp nhún và bảng tên + điểm số lơ lửng trên đầu.

### 3. Hệ Thống Câu Hỏi Triết Học Sâu Sắc
- Các câu hỏi xoay quanh các chủ đề: **Đạo đức, Tự do ý chí, Bản ngã, Ý thức, Sự thật & Thực tại, Hạnh phúc, Công lý**.
- Bao gồm các thí nghiệm tư duy kinh điển:
  - *Chiếc xe goòng (Trolley Problem)*
  - *Nghĩa vụ luận Kant & Lòng tốt*
  - *Con tàu của Theseus (Ship of Theseus)*
  - *Ẩn dụ Hang động của Plato*
  - *Tự do ý chí vs Tiền định luận*
  - *Bản sao ký ức hoàn hảo (Teletransporter Paradox)*
  - *Cỗ máy trải nghiệm của Robert Nozick*
  - *Tấm màn vô tri của John Rawls (Veil of Ignorance)*
  - *Phòng tiếng Trung của John Searle (Chinese Room)*
  - *Thảm kịch của những tài sản chung (Tragedy of the Commons)*
- Hỗ trợ cả 2 phương thức: Chọn đáp án A, B, C, D hoặc gõ trực tiếp câu trả lời / từ khóa.

### 4. Cơ Chế Rút 4 Lá Bài Định Mệnh (Random 4 Cards)
- **Mỗi lần trả lời đúng ngay lập tức kích hoạt rút 4 lá bài!**
- Giao diện 4 lá bài bí ẩn lật 3D với hiệu ứng phát sáng và âm thanh chúc mừng.
- **Card Pool Đa Dạng (Tỷ lệ xuất hiện có trọng số):**
  - 🟢 `+1`: Cộng 1 điểm
  - 🟢 `+5`: Cộng 5 điểm
  - 🟢 `+10`: Cộng 10 điểm
  - 🔵 `×2`: Nhân đôi điểm hiện tại
  - 🟣 `×3`: Nhân ba điểm hiện tại (Siêu hiếm)
  - 🟡 `÷2`: Chia đôi điểm hiện tại
  - 🔴 `-1`: Trừ 1 điểm
  - 🔴 `-5`: Trừ 5 điểm
  - 🔴 `-10`: Trừ 10 điểm
- Server tính toán điểm số độc lập chống gian lận (Anti-cheat). Điểm số nhảy hiệu ứng số nổi trên đầu nhân vật ngay tại canvas!

### 5. Multiplayer Đồng Bộ Thời Gian Thực (Realtime Socket.IO)
- Nhiều người chơi cùng di chuyển, khám phá và tương tác trong cùng một thế giới.
- Vị trí được nội suy (interpolate) mượt mà 60 FPS.
- Thanh thông báo hoạt động (Ticker) phát tin tức khi có người mở rương hoặc bốc bài may mắn.

### 6. Admin Mode & Dashboard Radar Toàn Năng (`/admin`)
- **Radar Map thời gian thực:**
  - Hiển thị toàn cảnh thế giới 2400×1800 px.
  - Mỗi người chơi là **một chấm tròn nhỏ** (`● Player 01`, `● Player 02`, `● Player 03`) với vòng xung lan tỏa khi di chuyển.
  - Các rương kho báu được đánh dấu biểu tượng vàng.
  - Nhấp chuột trực tiếp vào chấm tròn trên radar để kiểm tra chi tiết người chơi.
- **Dashboard Thống Kê & Bảng Người Chơi:**
  - Thống kê: Số người online, Tổng số người chơi, Kho báu thế giới, Số câu hỏi.
  - Bảng danh sách: Player, Score, Questions (Đúng/Sai), Treasures, Region, Status Online/Offline.
- **Inspector Chi Tiết:**
  - Xem tọa độ (X, Y), Khu vực, Tỷ lệ đúng/sai, Số kho báu đã mở, Lá bài vừa chọn gần nhất.
  - Phím can thiệp: Dịch chuyển về Spawn (Teleport Spawn), Dịch chuyển đến Kho báu kế tiếp.
- **Live Event Stream:**
  - Dòng nhật ký trực tiếp từng giây:
    - `[16:17:17] (JOIN): Socrates_01 đã tham gia thế giới khám phá.`
    - `[16:17:17] (TREASURE_INTERACT): Socrates_01 đang mở kho báu "Rương Khởi Nguyên"`
    - `[16:17:18] (ANSWER_CORRECT): Socrates_01 trả lời đúng câu hỏi "Thí nghiệm Chiếc Xe Goòng". Đang rút 4 lá bài!`
    - `[16:17:18] (CARD_CHOSEN): Socrates_01 chọn lá [+5]. Điểm số thay đổi: 0 ➔ 5`
- **Công Cụ Quản Trị Hệ Thống:**
  - Phát loa thông báo toàn máy chủ (Broadcast Announcement Banner).
  - Đặt lại điểm số toàn bộ người chơi (Reset Scores).

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY NHANH

Tất cả mã nguồn và dữ liệu đã được xử lý hoàn toàn tại thư mục **`D:\1`**.

### Cách 1: Chạy bằng file Batch (Khuyên Dùng)
Nhấp đúp chuột vào file:
👉 **`D:\1\CHAY_GAME_KHO_BAU_TRIET_HOC.bat`**

File batch sẽ tự động khởi động máy chủ và mở 2 tab trình duyệt:
1. Giao diện Game Người Chơi: `http://localhost:3000`
2. Giao diện Admin Radar & Dashboard: `http://localhost:3000/admin`

### Cách 2: Chạy bằng lệnh Terminal
```bash
cd D:\1\kho-bau-triet-hoc
npm start
```

---

## 📁 CẤU TRÚC DỰ ÁN

```text
D:\1\
├── CHAY_GAME_KHO_BAU_TRIET_HOC.bat    # Phím tắt khởi động 1-click
└── kho-bau-triet-hoc\
    ├── package.json                   # Cấu hình dependency Node.js
    ├── server.js                      # Backend Express & Socket.IO realtime
    ├── database.js                    # Quản lý lưu trữ người chơi & lịch sử sự kiện
    ├── test_simulation.js             # Script tự động kiểm thử mô phỏng 100%
    ├── data\
    │   ├── questions.json             # Ngân hàng 10 câu hỏi triết học đa chủ đề
    │   ├── cardPool.json              # Danh sách lá bài điểm số (+1, x2, /2, -1, v.v.)
    │   └── store.json                 # Dữ liệu người chơi, điểm số & audit log
    └── public\
        ├── index.html                 # Giao diện người chơi (HTML5 Canvas)
        ├── style.css                  # Giao diện retro-modern, hiệu ứng thẻ bài 3D
        ├── game.js                    # Engine canvas 2D, âm thanh Web Audio, điều khiển
        ├── admin.html                 # Giao diện Admin Radar & Dashboard
        ├── admin.css                  # Giao diện Command Center cho Admin
        └── admin.js                   # Logic Radar canvas, inspector & socket stream
```
