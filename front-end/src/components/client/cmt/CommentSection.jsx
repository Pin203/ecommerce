import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ productId }) => {
  // State quản lý danh sách bình luận
  const [comments, setComments] = useState([]);
  // State quản lý nội dung bình luận mới
  const [noidung, setNoidung] = useState('');
  // State loading khi gửi/đang fetch API
  const [loading, setLoading] = useState(false);
  // State để biết bình luận nào đang được chỉnh sửa
  const [editingCommentId, setEditingCommentId] = useState(null);
  // State chứa nội dung mới khi chỉnh sửa
  const [editedContent, setEditedContent] = useState('');
  // State để hiển thị menu hành động (⋯) cho bình luận nào
  const [visibleActionId, setVisibleActionId] = useState(null);
  // Ref để lắng nghe click ngoài menu dropdown
  const dropdownRef = useRef(null);

  // Lấy thông tin user & token từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  // Fetch comments khi component mount hoặc khi productId thay đổi
  useEffect(() => {
    if (API_URL && productId) {
      fetchComments();
    }
  }, [productId]);

  // Lắng nghe click bên ngoài dropdown để ẩn menu ⋯
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setVisibleActionId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hàm lấy danh sách bình luận
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(res.data); // Cập nhật danh sách bình luận
    } catch (error) {
      console.error('❌ Lỗi khi lấy bình luận:', error.response?.data || error.message);
    }
  };

  // Hàm gửi bình luận mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noidung.trim()) return; // Không cho gửi nếu nội dung trống

    // Kiểm tra đăng nhập
    if (!user || !user.id_user) {
      alert('Bạn cần đăng nhập để bình luận.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/comments`, {
        id_user: user.id_user,
        id_product: productId,
        noidung: noidung.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNoidung(''); // Reset input
      fetchComments(); // Refresh lại danh sách
    } catch (error) {
      alert('Lỗi khi gửi bình luận.');
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa bình luận
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      try {
        await axios.delete(`${API_URL}/api/comments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchComments(); // Refresh lại danh sách
      } catch (error) {
        alert('Lỗi khi xóa bình luận.');
        console.error(error.response?.data || error.message);
      }
    }
  };

  // Bắt đầu chỉnh sửa bình luận
  const handleEdit = (id, content) => {
    setEditingCommentId(id);   // Lưu ID bình luận đang chỉnh sửa
    setEditedContent(content); // Gán nội dung cũ vào input
    setVisibleActionId(null);  // Ẩn menu ⋯
  };

  // Lưu bình luận sau khi chỉnh sửa
  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/api/comments/${id}`, {
        noidung: editedContent.trim(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEditingCommentId(null); // Thoát chế độ chỉnh sửa
      setEditedContent('');
      fetchComments(); // Refresh lại danh sách
    } catch (error) {
      alert('Lỗi khi cập nhật bình luận.');
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="comment-box">
      <h3 className="comment-title">Bình luận sản phẩm</h3>

      {/* Form nhập bình luận */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          className="comment-input"
          placeholder="Nhập bình luận của bạn..."
          value={noidung}
          onChange={(e) => setNoidung(e.target.value)}
          rows={3}
        ></textarea>
        <button type="submit" disabled={loading} className="comment-submit">
          {loading ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </form>

      {/* Danh sách bình luận */}
      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="comment-empty">Chưa có bình luận nào.</p>
        ) : (
          comments.map((cmt) => (
            <div key={cmt.id_comment} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  {cmt.user?.name || 'Người dùng'}
                </div>

                {/* Hiển thị nút ⋯ cho chủ sở hữu bình luận */}
                {user?.id_user === cmt.id_user && editingCommentId !== cmt.id_comment && (
                  <div className="comment-actions" ref={dropdownRef}>
                    <button
                      className="dots-btn"
                      onClick={() =>
                        setVisibleActionId(visibleActionId === cmt.id_comment ? null : cmt.id_comment)
                      }
                    >
                      ⋯
                    </button>

                    {/* Dropdown menu chỉnh sửa/xóa */}
                    {visibleActionId === cmt.id_comment && (
                      <div className="actions-dropdown">
                        <div
                          onClick={() => handleEdit(cmt.id_comment, cmt.noidung)}
                          className="comment-edit-btn"
                        >
                          Chỉnh sửa
                        </div>
                        <div
                          onClick={() => handleDelete(cmt.id_comment)}
                          className="comment-delete-btn"
                        >
                          Xóa
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nếu đang chỉnh sửa thì hiện input, nếu không thì hiện nội dung */}
              {editingCommentId === cmt.id_comment ? (
                <>
                  <textarea
                    className="comment-edit-input"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div>
                    <button
                      onClick={() => handleSaveEdit(cmt.id_comment)}
                      className="comment-save-btn"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="comment-cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="comment-content">{cmt.noidung}</div>
                  <div className="comment-date">
                    {new Date(cmt.date).toLocaleString('vi-VN')}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
