import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditCategory = () => {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  console.log("ID:", id); 

  axios.get(`${process.env.REACT_APP_LARAVEL_API_URL}/api/admin/category/${id}`)
    .then(res => {
      console.log("Dữ liệu danh mục:", res.data);
      setName(res.data.name);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Lỗi API:", err); 
      setError('Không tìm thấy danh mục');
      setLoading(false);
    });
}, [id]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_LARAVEL_API_URL}/api/admin/category/${id}`, { name });
      navigate('/admin/category'); // Quay lại trang danh sách
    } catch (err) {
      setError('Lỗi khi cập nhật danh mục');
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h3>Sửa danh mục</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tên danh mục</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Cập nhật</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate('/admin/category')}>
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default EditCategory;
