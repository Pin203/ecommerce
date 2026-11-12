import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminFeedbackManager.css';

const AdminFeedbackManager = () => {
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStar, setFilterStar] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(false);

  const fetchFeedbacks = async () => {
  setLoading(true);
  setError(null);
  try {
    let url = `${API_URL}/api/feedback`;
    const params = {};
    if (filterStar) params.stars = filterStar;
    if (filterStatus) params.status = filterStatus;

    const res = await axios.get(url, { params });

    // ✅ Sort mới nhất trước (giảm dần theo created_at)
    const sorted = res.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    setFeedbacks(sorted);
  } catch (e) {
    setError('Không tải được danh sách đánh giá.');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchFeedbacks();
  }, [filterStar, filterStatus, refreshFlag]);

  const hideFeedback = async (id) => {
    try {
      await axios.post(`${API_URL}/api/feedback/${id}/hide`);
      setRefreshFlag(f => !f);
    } catch {
      alert('Ẩn đánh giá thất bại');
    }
  };

  const unhideFeedback = async (id) => {
    try {
      await axios.post(`${API_URL}/api/feedback/${id}/approve`);
      setRefreshFlag(f => !f);
    } catch {
      alert('Mở lại đánh giá thất bại');
    }
  };

  const replyFeedback = async (id, text) => {
    try {
      await axios.post(`${API_URL}/api/feedback/${id}/reply`, { store_reply: text });
      setRefreshFlag(f => !f);
    } catch {
      alert('Phản hồi thất bại');
    }
  };

  return (
    <div className="admin-feedback-manager" style={{ padding: 20 }}>
      <h2>Quản lý Feedback (Admin)</h2>
      <div className="filter-row">
        <div>
          <label>Sao:</label>
          <select value={filterStar} onChange={e => setFilterStar(e.target.value)}>
            <option value="">Tất cả</option>
            {[5,4,3,2,1].map(s => <option key={s} value={s}>{s} sao</option>)}
          </select>
        </div>
        <div>
          <label>Trạng thái:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {['pending', 'approved', 'hidden'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {feedbacks.map(fb => (
        <div key={fb.id} className="feedback-item">
          <p><b>#{fb.id}</b> • {fb.user?.name || 'Ẩn danh'} • {new Date(fb.created_at).toLocaleString()}</p>
          <p><b>Sao:</b> {fb.rating} ⭐ • <b>Status:</b> {fb.status}</p>
          <p><b>Bình luận:</b> {fb.comment || '(không có)'}</p>

          {fb.media?.length > 0 && (
            <div className="media-list">
              {fb.media.map((m, i) => (
                m.type === 'image'
                  ? <img key={i} src={`${API_URL}/${m.media_url.replace('public/', 'storage/')}`} alt="media" />
                  : <video key={i} src={`${API_URL}/${m.media_url.replace('public/', 'storage/')}`} controls />
              ))}
            </div>
          )}

          {fb.store_reply && <p className="store-reply"><b>Phản hồi:</b> {fb.store_reply}</p>}

          <div className="feedback-actions">
            <ReplyForm id={fb.id} onReply={replyFeedback} />
            {fb.status !== 'hidden'
              ? <button onClick={() => hideFeedback(fb.id)}>Ẩn đánh giá</button>
              : <button className="reopen" onClick={() => unhideFeedback(fb.id)}>Mở đánh giá</button>}
          </div>
        </div>
      ))}

      {(!loading && feedbacks.length === 0) && <p>Không có feedback phù hợp.</p>}
    </div>
  );
};

const ReplyForm = ({ id, onReply }) => {
  const [value, setValue] = useState('');
  return (
    <div className="feedback-reply">
      <textarea 
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Phản hồi..."
        rows={2}
      />
      <button onClick={() => {
        if (value.trim()) {
          onReply(id, value);
          setValue('');
        }
      }}>
        Gửi
      </button>
    </div>
  );
};

export default AdminFeedbackManager;
