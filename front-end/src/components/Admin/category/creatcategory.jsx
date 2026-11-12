import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CategoryAdd = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_LARAVEL_API_URL}/api/admin/category`,
        { name }
      );
      alert("Thêm danh mục thành công!");
      navigate("/admin/category"); // Quay lại danh sách sau khi thêm
    } catch (err) {
      console.error("Lỗi thêm danh mục:", err);
      alert("Có lỗi xảy ra.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Thêm danh mục mới</h2>
      <form onSubmit={handleSubmit} className="w-50">
        <div className="mb-3">
          <label className="form-label">Tên danh mục</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục..."
          />
        </div>
        <button type="submit" className="btn btn-success me-2">
          Lưu
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/admin/category")}
        >
          Hủy
        </button>
      </form>
    </div>
  );
};

export default CategoryAdd;
