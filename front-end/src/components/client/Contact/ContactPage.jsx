import React, { useState } from "react";
import axios from "axios";
import "./contact.css";

/**
 * Ghép endpoint an toàn:
 * - Nếu REACT_APP_LARAVEL_API_URL = http://localhost:8000  -> dùng http://localhost:8000/api/contacts
 * - Nếu REACT_APP_LARAVEL_API_URL = http://localhost:8000/api -> dùng http://localhost:8000/api/contacts
 * - Nếu không set ENV -> mặc định dùng cùng domain: {origin}/api/contacts
 */
const buildApi = (path) => {
  const base =
    (process.env.REACT_APP_LARAVEL_API_URL || window.location.origin)
      .replace(/\/+$/, ""); // bỏ dấu / ở cuối

  const ensuredApiBase = /\/api$/.test(base) ? base : `${base}/api`;
  const ensuredPath = path.startsWith("/") ? path : `/${path}`;
  return `${ensuredApiBase}${ensuredPath}`;
};

const CONTACTS_ENDPOINT = buildApi("/contacts");

const ContactPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // debug: xem endpoint thực tế
  // console.log("CONTACTS_ENDPOINT =", CONTACTS_ENDPOINT);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setLoading(true);

    try {
      const res = await axios.post(CONTACTS_ENDPOINT, form, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Nếu API của bạn bật CORS kèm cookie thì bật dòng dưới:
        // withCredentials: true,
        validateStatus: () => true, // để tự xử lý status
      });

      // Trả về chuẩn từ controller: { status: true|false, message, data|errors }
      if (res.status === 201 && res.data?.status) {
        setSuccessMessage(res.data.message || "✅ Gửi liên hệ thành công!");
        setForm({ name: "", email: "", phone: "", message: "" });
      } else if (res.status === 422) {
        setErrors(res.data?.errors || {});
      } else {
        // Hiển thị lỗi cụ thể để bạn biết đang vướng gì (CORS/404/500/…)
        setErrors({
          general:
            `🚨 Lỗi (${res.status}): ` +
            (res.data?.message ||
              res.statusText ||
              "Có lỗi xảy ra, vui lòng thử lại."),
        });
        // console.error("Response error:", res);
      }
    } catch (err) {
      // Trường hợp lỗi mạng/CORS bị chặn
      setErrors({
        general:
          "🚨 Không thể kết nối API. Kiểm tra URL, CORS và HTTP/HTTPS đồng bộ.",
      });
      // console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Liên Hệ</h1>
      <div className="contact-content">
        {/* Bên trái - Thông tin */}
        <div className="contact-info">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.157859290446!2d106.62008131533453!3d10.800833092302409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752b9241e5cdcd%3A0x58dcf1ff6b97913f!2zU-G7kSAxMCwgxJDhuqFvIEjGsG5nIFRodcOqbiwgUGjGsOG7nW5nIFTDom4gSMawbmcgVGh14bqtbiwgUXXhuq1uIDEyLCBI4buTIENow60gTWluaCBDaMOtbmgsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1679212345678!5m2!1sen!2s"
            title="Google Map"
            loading="lazy"
            allowFullScreen
          ></iframe>

          <p>
            <strong>📍 Văn phòng:</strong> Số Đông Hưng Thuận 31, Phường Tân Hưng
            Thuận, Quận 12
          </p>
          <p>
            <strong>📞 Điện thoại:</strong> 0938 523 115
          </p>
          <p>
            <strong>📧 Email:</strong> H2VPshoestore@gmail.com
          </p>
          <p>
            <strong>🌐 Website:</strong> H2VPshoestore.vn
          </p>
          <p>
            <strong>👍 Fanpage:</strong> facebook.com/H2VPshoestore.vn
          </p>
        </div>

        {/* Bên phải - Form */}
        <div className="contact-form">
          {successMessage && <div className="success-msg">{successMessage}</div>}
          {errors.general && <div className="error-msg">{errors.general}</div>}

          <form onSubmit={handleSubmit}>
            {/* Họ & Tên */}
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Họ & Tên"
                value={form.name}
                onChange={handleChange}
                required
              />
              {errors.name && <p className="error-text">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              {errors.email && <p className="error-text">{errors.email[0]}</p>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="error-text">{errors.phone[0]}</p>}
            </div>

            {/* Message */}
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Nội dung"
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>
              {errors.message && (
                <p className="error-text">{errors.message[0]}</p>
              )}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "⏳ Đang gửi..." : "📨 Gửi thông tin"}
            </button>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
