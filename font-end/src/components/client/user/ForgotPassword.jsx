import React, { useState } from 'react';
import api from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validEmail = email.trim().toLowerCase();
    if (!validEmail) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/forgot-password-otp', { email: validEmail });

      if (res.data?.message) {
        setMessage('✅ OTP đã được gửi qua email. Kiểm tra hộp thư đến và cả mục spam.');
        setTimeout(() => {
          navigate('/doi-mat-khau', { state: { email: validEmail } });
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('❌ Email chưa được đăng ký trong hệ thống.');
      } else {
        setError('❌ Lỗi gửi OTP. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Quên mật khẩu</h2>

        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi OTP'}
        </button>
      </form>
    </div>
  );
}
