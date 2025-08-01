import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';
import Header from '../headers/header.jsx';
import '../user/auth.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    diachi: '',
  });

  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const translateError = (field, msg) => {
    if (msg.includes('taken')) {
      if (field === 'username') return 'Tên đăng nhập đã tồn tại';
      if (field === 'email') return 'Email đã được sử dụng';
    }
    if (msg.includes('required')) return 'Vui lòng nhập thông tin này';
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: form.username,
      password: form.password,
      name: form.name,
      email: form.email,
      dienthoai: form.phone,
      diachi: form.diachi || '',
    };

    try {
      const res = await api.post('/dangky', payload);
      setErrors({});
      setShowSuccessModal(true); // Hiện thông báo thành công
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.errors) {
          const translatedErrors = {};
          for (const key in data.errors) {
            translatedErrors[key] = translateError(key, data.errors[key]);
          }
          setErrors(translatedErrors);
        } else if (data.message) {
          alert('❌ Lỗi: ' + data.message);
        }
      } else {
        alert('❌ Lỗi không xác định!');
      }
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate('/dangNhap');
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Đăng ký</h2>

          <input type="text" name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
          {errors.username && <p className="error">{errors.username}</p>}

          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="text" name="name" placeholder="Họ và Tên" onChange={handleChange} required />
          {errors.name && <p className="error">{errors.name}</p>}

          <input type="text" name="phone" placeholder="Số điện thoại" onChange={handleChange} />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <input type="text" name="diachi" placeholder="Địa chỉ" onChange={handleChange} />
          {errors.diachi && <p className="error">{errors.diachi}</p>}

          <input type="password" name="password" placeholder="Nhập mật khẩu" onChange={handleChange} required />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit">Đăng ký</button>

          <div className="social-login">
            <span>Hoặc sử dụng tài khoản sẵn có</span>
            <div className="social-icons">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-google"></i>
              <i className="fab fa-twitter"></i>
            </div>
          </div>

          <p>Bạn đã có tài khoản? <a href="/dangNhap">Đăng nhập</a></p>
        </form>
      </div>

      {/* Modal thông báo thành công */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🎉 Đăng ký thành công!</h3>
            <button onClick={handleSuccessOk}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}
