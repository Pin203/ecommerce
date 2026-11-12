import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/contacts";

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Fetch danh sách liên hệ từ API
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setContacts(res.data.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách:", err);
      setError("Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Xem chi tiết liên hệ
  const viewContact = async (id_contact) => {
    try {
      const res = await axios.get(`${API_URL}/${id_contact}`);
      setSelectedContact(res.data);
      setReplyMessage(res.data.reply || "");
    } catch (err) {
      console.error("Lỗi khi xem chi tiết:", err);
      alert("Không thể tải chi tiết liên hệ.");
    }
  };

  // Gửi phản hồi
  const sendReply = async () => {
    if (!replyMessage.trim()) {
      alert("Nội dung phản hồi không được để trống.");
      return;
    }

    try {
      // Gửi phản hồi với ID của liên hệ
      const response = await axios.post(`${API_URL}/${selectedContact.id_contact}/reply`, {
        reply: replyMessage,
      });

      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        alert("✅ Phản hồi thành công, email đã được gửi.");
        setSelectedContact(null); // Đóng cửa sổ chi tiết
        fetchContacts(); // Cập nhật lại danh sách liên hệ
        setReplyMessage(""); // Xóa nội dung phản hồi
      }
    } catch (err) {
      // Kiểm tra lỗi server 500 và thông báo lỗi chi tiết
      if (err.response && err.response.status === 500) {
        alert("❌ Lỗi server: Có sự cố xảy ra khi gửi phản hồi. Vui lòng thử lại sau.");
        console.error("Lỗi server chi tiết: ", err.response.data);  // Log chi tiết lỗi server
      } else if (err.response && err.response.data) {
        alert(`❌ Lỗi khi gửi phản hồi: ${err.response.data.message}`);
      } else {
        alert("❌ Lỗi không xác định khi gửi phản hồi.");
        console.error("Lỗi không xác định: ", err);
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📩 Quản lý Liên hệ</h2>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Nội dung</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length > 0 ? (
            contacts.map((item) => (
              <tr key={item.id_contact}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.message}</td>
                <td>
                  {item.reply ? (
                    <span className="badge bg-success">Đã phản hồi</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Chưa phản hồi</span>
                  )}
                </td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => viewContact(item.id_contact)}
                  >
                    Xem / Phản hồi
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Không có liên hệ nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedContact && (
        <div className="card mt-4">
          <div className="card-header">
            <strong>Phản hồi liên hệ từ {selectedContact.name}</strong>
          </div>
          <div className="card-body">
            <p>
              <strong>Email:</strong> {selectedContact.email}
            </p>
            <p>
              <strong>Nội dung khách gửi:</strong> {selectedContact.message}
            </p>

            <div className="mb-3">
              <label className="form-label">Nội dung phản hồi</label>
              <textarea
                className="form-control"
                rows="4"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              ></textarea>
            </div>

            <button className="btn btn-success me-2" onClick={sendReply}>
              Gửi phản hồi
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setSelectedContact(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
