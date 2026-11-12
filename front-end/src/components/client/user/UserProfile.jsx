import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './auth.css'

const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    diachi: '',
    dienthoai: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Thêm trạng thái chỉnh sửa

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setUser(res.data);
      setForm({
        username: res.data.username || '',
        name: res.data.name || '',
        email: res.data.email || '',
        diachi: res.data.diachi || '',
        dienthoai: res.data.dienthoai || ''
      });
    })
    .catch(err => {
      console.error(err);
      setError('Không thể tải thông tin người dùng');
    });
  }, [token]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEditing) { // Nếu không ở chế độ chỉnh sửa, không làm gì cả
      return;
    }

    axios.put(`${API_URL}/api/profile`, form, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => {
      setMessage('Cập nhật thành công!');
      setError(null);
      setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi cập nhật thành công
    })
    .catch(err => {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        setError(Object.values(err.response.data.errors).flat().join(' | '));
      } else {
        setError('Lỗi cập nhật!');
      }
    });
  };

  const handleEditClick = () => {
    setIsEditing(true); // Bật chế độ chỉnh sửa
    setMessage(''); // Xóa thông báo cũ
    setError(null); // Xóa lỗi cũ
  };

  const handleCancelClick = () => {
    setIsEditing(false); // Tắt chế độ chỉnh sửa
    setMessage(''); // Xóa thông báo
    setError(null); // Xóa lỗi

    // Khôi phục form về dữ liệu ban đầu từ user state
    if (user) {
      setForm({
        username: user.username || '',
        name: user.name || '',
        email: user.email || '',
        diachi: user.diachi || '',
        dienthoai: user.dienthoai || ''
      });
    }
  };

  if (!user) return <p>Đang tải...</p>;

  return (
    <div className="container mt-4"> {/* Bootstrap container */}
      <h2 className="mb-4">Thông tin hồ sơ</h2> {/* Bootstrap heading */}

      {message && <div className="alert alert-success">{message}</div>} {/* Bootstrap alert success */}
      {error && <div className="alert alert-danger">{error}</div>} {/* Bootstrap alert danger */}

      <form onSubmit={handleSubmit}>
        {/* <div className="mb-3"> 
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            className="form-control" 
            name="username"
            value={form.username}
            onChange={handleChange}
            readOnly={!isEditing} 
          />
        </div> */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Họ tên</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="diachi" className="form-label">Địa chỉ</label>
          <input
            type="text"
            className="form-control"
            id="diachi"
            name="diachi"
            value={form.diachi}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dienthoai" className="form-label">Điện thoại</label>
          <input
            type="text"
            className="form-control"
            id="dienthoai"
            name="dienthoai"
            value={form.dienthoai}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        {isEditing ? (
          <div className="d-flex justify-content-end"> {/* Bootstrap flexbox for buttons */}
            <button type="submit" className="btn btn-primary me-2"> {/* Bootstrap button */}
              Cập nhật
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>
              Hủy
            </button>
          </div>
        ) : (
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-info" onClick={handleEditClick}> {/* Bootstrap button */}
              Sửa
            </button>
          </div>
        )}
      </form>
    </div>
  );
}