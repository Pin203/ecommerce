import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [noidung, setNoidung] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/comments/${productId}`);
      setComments(res.data); // Không reverse để giữ bình luận mới nhất ở trên
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noidung.trim()) return;

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
      });
      setNoidung('');
      fetchComments();
    } catch (error) {
      alert('Lỗi khi gửi bình luận.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      try {
        await axios.delete(`${API_URL}/api/comments/${id}`);
        fetchComments();
      } catch (error) {
        alert('Lỗi khi xóa bình luận.');
      }
    }
  };

  const handleEdit = (id, content) => {
    setEditingCommentId(id);
    setEditedContent(content);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`${API_URL}/api/comments/${id}`, {
        noidung: editedContent.trim(),
      });
      setEditingCommentId(null);
      setEditedContent('');
      fetchComments();
    } catch (error) {
      alert('Lỗi khi cập nhật bình luận.');
    }
  };

  return (
    <div className="comment-box">
      <h3 className="comment-title">Bình luận sản phẩm</h3>

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

                {user?.id_user === cmt.id_user && editingCommentId !== cmt.id_comment && (
                  <div className="comment-actions">
                    <button
                      onClick={() => handleEdit(cmt.id_comment, cmt.noidung)}
                      className="comment-edit-btn"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cmt.id_comment)}
                      className="comment-delete-btn"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

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
