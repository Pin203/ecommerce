# 🛒 E-commerce Full-stack Web Application

> Hệ thống thương mại điện tử hoàn chỉnh với giao diện người dùng hiện đại và trang quản trị (Admin Dashboard), hỗ trợ quản lý sản phẩm, giỏ hàng và xử lý đơn hàng.

## ✨ Tính năng chính
- **Người dùng (Client):** Xem danh sách sản phẩm, tìm kiếm & lọc theo danh mục, quản lý giỏ hàng, đặt hàng và theo dõi trạng thái đơn hàng.
- **Quản trị viên (Admin Dashboard):** Quản lý người dùng, thêm/sửa/xóa sản phẩm, quản lý danh mục và duyệt đơn hàng[cite: 1].
- **Giao diện Responsive:** Tương thích mượt mà trên cả máy tính và thiết bị di động[cite: 1].

## 🛠️ Công nghệ sử dụng
- **Frontend:** ReactJS, Bootstrap, RESTful API[cite: 1]
- **Backend:** PHP, Laravel Framework[cite: 1]
- **Database:** MySQL[cite: 1]

## 📁 Cấu trúc thư mục
- `/front-end`: Mã nguồn giao diện người dùng (ReactJS)[cite: 1, 8].
- `/Back-end`: Mã nguồn API và xử lý nghiệp vụ (Laravel)[cite: 1, 8].

## 🚀 Hướng dẫn cài đặt (Local)
1. Clone repository:
   ```bash
   git clone [https://github.com/Pin203/ecommerce.git](https://github.com/Pin203/ecommerce.git)
   ```
2. Cài đặt Backend (`Back-end`):
   - Chạy `composer install`
   - Copy file `.env.example` thành `.env`, cấu hình thông tin Database MySQL[cite: 1]
   - Chạy `php artisan key:generate` và `php artisan migrate`
   - Khởi chạy server: `php artisan serve`
3. Cài đặt Frontend (`front-end`):
   - Di chuyển vào thư mục `cd front-end`[cite: 8]
   - Chạy `npm install` và `npm run dev` (hoặc `npm start`)