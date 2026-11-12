import React, { useState } from 'react';
import api from '../../../services/api'; // Đảm bảo bạn đã cấu hình đúng baseURL

export default function ResetPassword() {
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    password_confirmation: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/verify-password-otp', {
        email: form.email,
        otp: form.otp,
        password: form.password,
        password_confirmation: form.password_confirmation
      });

      setMessage(res.data.message || '✅ Đổi mật khẩu thành công. Vui lòng đăng nhập.');
      setError('');
    } catch (err) {
      const resMsg = err.response?.data?.message || '❌ Có lỗi xảy ra.';
      setError(`❌ ${resMsg}`);
      setMessage('');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Đổi mật khẩu bằng OTP</h2>

        <input
          type="email"
          name="email"
          placeholder="Email đã đăng ký"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="otp"
          placeholder="Mã OTP (6 chữ số)"
          value={form.otp}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu mới"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password_confirmation"
          placeholder="Xác nhận mật khẩu"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <button type="submit">Đổi mật khẩu</button>
      </form>
    </div>
  );
}
