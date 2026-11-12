import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminCommentList.css';

const AdminCommentList = () => {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Lỗi tải bình luận:', err);
    }
  };

  // const handleEdit = (cmt) => {
  //   setEditingId(cmt.id_comment);
  //   setEditedContent(cmt.noidung);
  // };

  const handleCancel = () => {
    setEditingId(null);
    setEditedContent('');
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/comments/${id}`, {
        noidung: editedContent,
      });
      fetchComments();
      handleCancel();
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xoá bình luận?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/comments/${id}`);
      fetchComments();
    } catch (err) {
      console.error('Lỗi xoá:', err);
    }
  };

  const handleToggleHidden = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/admin/comments/${id}/toggle-hidden`);
      fetchComments();
    } catch (err) {
      console.error('Lỗi ẩn/hiện:', err);
    }
  };

  return (
    <div className="admin-comment-container">
      <h2 className="text-center my-3">Quản lý bình luận</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Sản phẩm</th>
              <th>Ngày</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan="7">Không có bình luận.</td>
              </tr>
            ) : (
              comments.map((cmt) => (
                <tr key={cmt.id_comment}>
                  <td>{cmt.id_comment}</td>
                  <td>{cmt.user?.name}</td>
                  <td>{cmt.product?.name}</td>
                  <td>{cmt.date}</td>
                  <td>
                    {editingId === cmt.id_comment ? (
                      <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="form-control"
                      />
                    ) : (
                      cmt.noidung
                    )}
                  </td>
                  <td>
                    {cmt.is_hidden ? (
                      <span className="badge bg-danger">Đã ẩn</span>
                    ) : (
                      <span className="badge bg-success">Hiển thị</span>
                    )}
                  </td>
                  <td>
                    {editingId === cmt.id_comment ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleSave(cmt.id_comment)}
                        >
                          Lưu
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancel}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        {/* <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEdit(cmt)}
                        >
                          Sửa
                        </button> */}
                        <button
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => handleDelete(cmt.id_comment)}
                        >
                          Xóa
                        </button>
                        <button
                          className={`btn btn-sm ${
                            cmt.is_hidden ? 'btn-success' : 'btn-dark'
                          }`}
                          onClick={() => handleToggleHidden(cmt.id_comment)}
                        >
                          {cmt.is_hidden ? 'Hiển thị' : 'Ẩn'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCommentList;
