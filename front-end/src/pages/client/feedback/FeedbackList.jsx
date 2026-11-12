import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedbackList = ({ productDetailId, refreshFlag }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [filterStar, setFilterStar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  // ✅ Lấy danh sách review
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
      setVisibleCount(3);
    } catch (err) {
      setError('Không tải được đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lấy số sao trung bình từ API backend
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

  if (loading) return <p>Đang tải đánh giá...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="feedback-list">
      {/* ⭐ Trung bình từ API */}
      <p>
        Sao trung bình:{" "}
        {avgRating !== null ? (
          <span style={{ fontWeight: "bold", fontSize: "18px" }}>
            {avgRating.toFixed(1)} ⭐
          </span>
        ) : (
          "Chưa có đánh giá"
        )}
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
        <>
          {reviews.slice(0, visibleCount).map((review) => (
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

              {/* Media */}
              {review.media && review.media.length > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* {review.media.map((item) =>
                    item.type === 'image' ? (
                      // <img
                      //   key={item.id}
                      //   src={item.media_url}
                      //   alt="Ảnh đánh giá"
                      //   style={{
                      //     maxWidth: '120px',
                      //     maxHeight: '120px',
                      //     objectFit: 'cover',
                      //     borderRadius: '4px',
                      //   }}
                      // />
                    ) : item.type === 'video' ? (
                      <video
                        key={item.id}
                        src={item.media_url}
                        controls
                        style={{
                          maxWidth: '200px',
                          maxHeight: '120px',
                          borderRadius: '4px',
                        }}
                      />
                    ) : null
                  )} */}
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
          ))}

          {/* Nút xem thêm / thu gọn */}
          {reviews.length > 3 && (
            <button
              onClick={() =>
                setVisibleCount((prev) =>
                  prev < reviews.length ? reviews.length : 3
                )
              }
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '8px 16px',
                background: visibleCount < reviews.length ? '#2196f3' : '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {visibleCount < reviews.length ? 'Xem thêm' : 'Thu gọn'}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default FeedbackList;
