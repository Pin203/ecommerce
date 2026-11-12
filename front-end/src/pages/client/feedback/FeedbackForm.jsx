import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const StarRating = ({ rating, setRating }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          fill={(hover || rating) >= star ? '#ffc107' : '#e4e5e9'}
          viewBox="0 0 24 24"
          className="star-icon"
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.175L12 18.897l-7.335 3.852 1.401-8.175L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
};

const FeedbackForm = ({ productDetailId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // popup message

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    const checkIfSubmitted = async () => {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setHasSubmitted(false);
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      try {
        const res = await axios.get(`${LARAVEL_API_URL}/api/feedback/check`, {
          params: {
            id_user: user.id_user,
            id_productdetail: productDetailId,
          },
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (res.data.exists) {
          setHasSubmitted(true);
        } else {
          setHasSubmitted(false);
        }
      } catch (err) {
        console.error('Lỗi kiểm tra đánh giá:', err);
        setHasSubmitted(false);
      } finally {
        setLoading(false);
      }
    };

    checkIfSubmitted();
  }, [productDetailId, LARAVEL_API_URL]);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      setMessage('⚠️ Bạn cần đăng nhập để đánh giá.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const user = JSON.parse(userStr);

    if (!user?.id_user || !user?.token) {
      setMessage('⚠️ Thiếu thông tin người dùng. Vui lòng đăng nhập lại.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const reviewRes = await axios.post(
        `${LARAVEL_API_URL}/api/feedback`,
        {
          id_user: user.id_user,
          id_productdetail: productDetailId,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((file) => formData.append('media[]', file));

        await axios.post(
          `${LARAVEL_API_URL}/api/feedback/${reviewRes.data.id}/media`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      setMessage('🎉 Đánh giá thành công!');
      setTimeout(() => setMessage(null), 3000);

      setRating(5);
      setComment('');
      setMediaFiles([]);
      setHasSubmitted(true);

      localStorage.setItem(`feedback_${productDetailId}_${user.id_user}`, 'done');
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      console.error('❌ Gửi đánh giá lỗi:', err);
      if (err.response) {
        if (err.response.status === 403) {
          setMessage('⚠️ Bạn đã đánh giá sản phẩm này rồi!');
          setHasSubmitted(true);
        } else {
          setMessage(`❌ Lỗi: ${err.response.status}`);
        }
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  if (loading) return <p className="loading">⏳ Đang kiểm tra trạng thái đánh giá...</p>;

  if (hasSubmitted) {
    return (
      <div className="feedback-submitted-message">
        <p className="success-message">✅ Bạn đã đánh giá sản phẩm này rồi!</p>
        {message && <div className="custom-alert">{message}</div>}
      </div>
    );
  }

  const uniqueInputId = `media-upload-${productDetailId}`;

  return (
    <>
      {message && <div className="custom-alert">{message}</div>}
      <form onSubmit={handleSubmit} className="feedback-form">
        <h4>📝 Viết đánh giá</h4>

        <label>Đánh giá sao:</label>
        <StarRating rating={rating} setRating={setRating} />

        <label>
          Bình luận:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Cảm nhận của bạn về sản phẩm..."
            rows={4}
            required
          />
        </label>

        <input
          type="file"
          id={uniqueInputId}
          accept="image/*,video/mp4"
          multiple
          onChange={handleMediaChange}
          style={{ display: 'none' }}
        />
        <label htmlFor={uniqueInputId} className="upload-media-label">
          📷 Thêm ảnh / video
        </label>

        {mediaFiles.length > 0 && (
          <div className="media-preview-container">
            {mediaFiles.map((file, index) => {
              const url = URL.createObjectURL(file);
              const isVideo = file.type.startsWith('video');

              return (
                <div key={index} className="media-preview-item">
                  {isVideo ? (
                    <video src={url} controls width={150} />
                  ) : (
                    <img src={url} alt={`media-${index}`} width={100} />
                  )}
                  <button type="button" onClick={() => removeMedia(index)}>❌</button>
                </div>
              );
            })}
          </div>
        )}

        <button type="submit" className="submit-btn">
          Gửi đánh giá
        </button>
      </form>
    </>
  );
};

export default FeedbackForm;
