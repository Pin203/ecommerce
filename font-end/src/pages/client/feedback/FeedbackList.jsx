import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedbackList = ({ productDetailId, refreshFlag }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [filterStar, setFilterStar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  const fetchReviews = async (stars) => {
    setLoading(true);
    setError(null);
    try {
      const url = stars
        ? `${LARAVEL_API_URL}/api/feedback/filter/${productDetailId}?stars=${stars}`
        : `${LARAVEL_API_URL}/api/feedback/${productDetailId}`;

      const res = await axios.get(url);
      const reviewsData = Array.isArray(res.data) ? res.data : res.data.data || [];

      setReviews(reviewsData);
    } catch (err) {
      setError('Không tải được đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAverage = async () => {
    try {
      const res = await axios.get(`${LARAVEL_API_URL}/api/feedback/average/${productDetailId}`);
      setAvgRating(res.data.average_rating ?? null);
    } catch {
      setAvgRating(null);
    }
  };

  useEffect(() => {
    if (!productDetailId) return;

    fetchReviews(filterStar);
    fetchAverage();
  }, [productDetailId, filterStar, refreshFlag]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterStar(val ? Number(val) : null);
  };

  // Hàm render 5 sao với sao trung bình màu vàng, kích thước to hơn
  const renderStars = () => {
    if (avgRating === null) return 'Chưa có đánh giá';

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      // Nếu avgRating >= i thì sao vàng
      // Nếu avgRating >= i - 0.5 (nửa sao) thì vẫn màu vàng (đơn giản không dùng nửa sao icon)
      const color = avgRating >= i - 0.5 ? '#f5c518' : '#ccc';

      stars.push(
        <span
          key={i}
          style={{
            color,
            fontSize: '28px', // sao to hơn
            marginRight: '4px',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <p>Đang tải đánh giá...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="feedback-list">
      <p>
        Sao trung bình: {avgRating !== null ? renderStars() : 'Chưa có đánh giá'}
      </p>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="filterStar">Lọc theo sao: </label>
        <select
          id="filterStar"
          onChange={handleFilterChange}
          value={filterStar || ''}
        >
          <option value="">Tất cả</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} sao
            </option>
          ))}
        </select>
      </div>

      {reviews.length === 0 ? (
        <p>Chưa có đánh giá nào phù hợp.</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '12px',
              borderRadius: '5px',
              backgroundColor: review.status === 'pending' ? '#fff8e1' : '#fff',
            }}
          >
            <strong>{review.user?.name || 'Người dùng ẩn danh'}</strong>{' '}
            - <span>{review.rating} ⭐</span>{' '}
            {review.status === 'pending' && (
              <em style={{ color: 'orange' }}> (Chờ duyệt)</em>
            )}
            <p>{review.comment || '(Không có bình luận)'}</p>

            {/* Hiển thị media */}
            {review.media && review.media.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {review.media.map((item) =>
                  item.type === 'image' ? (
                    <img
                      key={item.id}
                      src={item.media_url}
                      alt="Ảnh đánh giá"
                      style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : item.type === 'video' ? (
                    <video
                      key={item.id}
                      src={item.media_url}
                      controls
                      style={{ maxWidth: '200px', maxHeight: '120px', borderRadius: '4px' }}
                    />
                  ) : null
                )}
              </div>
            )}

            {review.store_reply && (
              <div
                style={{
                  marginTop: '8px',
                  borderLeft: '3px solid green',
                  paddingLeft: '10px',
                  fontStyle: 'italic',
                  color: 'green',
                }}
              >
                Phản hồi từ shop: {review.store_reply}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FeedbackList;
