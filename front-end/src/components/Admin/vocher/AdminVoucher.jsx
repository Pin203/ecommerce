import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminVoucher.css";

const API_URL = "http://127.0.0.1:8000/api/admin/vouchers";

const AdminVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "percentage",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);

  // Thông báo
  const [message, setMessage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchVouchers = async () => {
    try {
      const res = await axios.get(API_URL);
      setVouchers(res.data);
    } catch (err) {
      console.error("Lỗi khi load voucher:", err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000); // tự tắt sau 2s
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        showMessage("Cập nhật voucher thành công");
      } else {
        await axios.post(API_URL, form);
        showMessage("Thêm voucher thành công");
      }
      setForm({ code: "", discount: "", type: "percentage", active: true });
      setEditingId(null);
      fetchVouchers();
    } catch (err) {
      console.error("Lỗi khi lưu voucher:", err);
      showMessage("Có lỗi xảy ra, xem console để biết chi tiết");
    }
  };

  const handleEdit = (voucher) => {
    setForm({
      code: voucher.code,
      discount: voucher.discount,
      type: voucher.type,
      active: voucher.active === 1,
    });
    setEditingId(voucher.id_voucher);
  };

  const handleDelete = async (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    try {
      await axios.delete(`${API_URL}/${confirmDelete}`);
      fetchVouchers();
      showMessage("Xóa voucher thành công");
    } catch (err) {
      console.error("Lỗi khi xóa voucher:", err);
      showMessage("Có lỗi khi xóa");
    }
    setConfirmDelete(null);
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/toggle`);
      fetchVouchers();
    } catch (err) {
      console.error("Lỗi khi đổi trạng thái voucher:", err);
    }
  };

  return (
    <div className="voucher-container">
      <h2>Quản lý Voucher</h2>

      {/* Form */}
      <form className="voucher-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Mã voucher"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Giá trị giảm"
          value={form.discount}
          onChange={(e) => setForm({ ...form, discount: e.target.value })}
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="percentage">Phần trăm (%)</option>
          <option value="fixed">Giảm tiền cố định</option>
        </select>
        <select
          value={form.active ? "1" : "0"}
          onChange={(e) =>
            setForm({ ...form, active: e.target.value === "1" })
          }
        >
          <option value="1">Kích hoạt</option>
          <option value="0">Vô hiệu hóa</option>
        </select>

        <button type="submit">{editingId ? "Cập nhật" : "Thêm mới"}</button>
      </form>

      {/* Table */}
      <table className="voucher-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Mã</th>
            <th>Giảm</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr key={v.id_voucher}>
              <td>{v.id_voucher}</td>
              <td>{v.code}</td>
              <td>{v.discount}</td>
              <td>{v.type}</td>
              <td>
                <span
                  className={v.active ? "active" : "inactive"}
                  onClick={() => handleToggle(v.id_voucher)}
                  style={{ cursor: "pointer" }}
                >
                  {v.active ? "Đang bật" : "Đang tắt"}
                </span>
              </td>
              <td>
  <button onClick={() => handleEdit(v)}>Sửa</button>
  <button onClick={() => handleDelete(v.id_voucher)}>Xóa</button>
  <button onClick={() => handleToggle(v.id_voucher)}>
    {v.active ? "Ẩn" : "Hiện"}
  </button>
</td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* Thông báo */}
      {message && <div className="popup-message">{message}</div>}

      {/* Xác nhận xóa */}
      {confirmDelete && (
        <div className="popup-confirm">
          <div className="popup-box">
            <p>Bạn có chắc chắn muốn xóa voucher này?</p>
            <div className="popup-actions">
              <button onClick={confirmDeleteAction}>OK</button>
              <button onClick={() => setConfirmDelete(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoucher;
