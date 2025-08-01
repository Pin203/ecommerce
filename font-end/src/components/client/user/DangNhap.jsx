import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { setAuthToken } from '../../../services/api';
import './auth.css';
import Header from '../headers/header.jsx';
import { useCart } from '../../../context/CartContext.jsx';

export default function DangNhap() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const name = query.get('name');
    const email = query.get('email');
    const role = query.get('role');

    if (token && email) {
      const user = { name, email, token };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
      setAuthToken(token);

      fetchCart().then(() => {
        navigate('/');
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/dangnhap', form);
      const { token, user, role } = res.data;

      const userWithToken = { ...user, token };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('role', role);
      setAuthToken(token);

      await fetchCart();

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage('❌ Sai tài khoản hoặc mật khẩu');
      console.error("Lỗi đăng nhập:", err);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google/redirect';
  };

  const handleForgotPassword = () => {
    navigate('/quen-mat-khau'); // ← chuyển trang "quên mật khẩu"
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng nhập</h2>

          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="forgot-password">
            <a onClick={handleForgotPassword} style={{ cursor: 'pointer', color: '#007bff' }}>
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit">Đăng nhập</button>

          <div className="social-login">
            <span>Hoặc đăng nhập bằng</span>
            <div className="social-icons">
              <i
                className="fab fa-google"
                style={{ cursor: 'pointer', fontSize: '24px', color: '#DB4437' }}
                onClick={handleGoogleLogin}
              ></i>
              <i className="fab fa-facebook" style={{ fontSize: '24px', color: '#1877F2' }}></i>
              <i className="fab fa-twitter" style={{ fontSize: '24px', color: '#1DA1F2' }}></i>
            </div>
          </div>

          <p>
            Bạn chưa có tài khoản? <a href="/dangky">Đăng ký</a>
          </p>
        </form>
      </div>
    </>
  );
}
