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
    otp: ''
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const translateError = (field, msg) => {
    if (msg.includes('tồn tại')) return msg;
    if (msg.includes('required')) return 'Vui lòng nhập thông tin này';
    return msg;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        dienthoai: form.phone,
        diachi: form.diachi || ''
      };

      await api.post('/send-register-otp', payload);
      setStep(2);
      showToast('✅ OTP đã được gửi tới email của bạn!');
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.errors) {
          const translatedErrors = {};
          for (const key in data.errors) {
            translatedErrors[key] = translateError(key, data.errors[key][0]);
          }
          setErrors(translatedErrors);
        } else if (data.message) {
          showToast('❌ ' + data.message);
        }
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await api.post('/verify-register-otp', { otp: form.otp });
      showToast('🎉 Đăng ký thành công!', true);
    } catch (err) {
      if (err.response && err.response.data) {
        showToast('❌ ' + err.response.data.message);
      }
    }
  };

  const showToast = (message, redirect = false) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
      if (redirect) navigate('/dangNhap');
    }, 2000);
  };

  return (
    <>
      <Header />
      {toast && (
        <div className="toast-message">{toast}</div>
      )}

      <div className="auth-container">
        {step === 1 && (
          <form className="auth-form" onSubmit={handleSendOtp}>
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

            <button type="submit">Gửi OTP</button>
          </form>
        )}

        {step === 2 && (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <h2>Xác nhận OTP</h2>
            <input type="text" name="otp" placeholder="Nhập mã OTP" onChange={handleChange} required />
            <button type="submit">Xác nhận</button>
            <p className="note">OTP đã gửi về email {form.email}, vui lòng kiểm tra hộp thư (hoặc mục spam).</p>
          </form>
        )}
      </div>

      <style>{`
        .toast-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: orange;
          color: white;
          font-size: 22px;
          font-weight: bold;
          padding: 20px 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 9999;
          animation: fadeInOut 2s ease-in-out;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -60%); }
          10% { opacity: 1; transform: translate(-50%, -50%); }
          90% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -40%); }
        }
      `}</style>
    </>
  );
}
