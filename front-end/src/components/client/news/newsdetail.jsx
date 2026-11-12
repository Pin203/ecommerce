import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsArticle, setNewsArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${LARAVEL_API_URL}/api/news/${id}`);
        setNewsArticle(res.data.news);
        setRelatedNews(res.data.related || []);
      } catch (err) {
        setError('Không thể tải chi tiết tin tức. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNewsDetail();
  }, [id, LARAVEL_API_URL]);

  if (loading) return <div className="container py-5 text-center">⏳ Đang tải...</div>;
  if (error) return <div className="container py-5 text-danger text-center">{error}</div>;
  if (!newsArticle) return <div className="container py-5 text-center">❌ Không tìm thấy bài viết.</div>;

  return (
    <div className="container py-4">
      {/* Bài viết chính */}
      <div className="card mb-4 shadow-sm">
        {newsArticle.image && (
          <img
            src={`${newsArticle.image}`}
            className="card-img-top"
            alt={newsArticle.title}
            style={{ maxHeight: '100%', objectFit: 'cover' }}
          />
        )}
        <div className="card-body">
          <h1 className="card-title">{newsArticle.title}</h1>
          <div className="text-muted mb-3">
            <small className="me-3">🕒 {new Date(newsArticle.created_at).toLocaleDateString()}</small>
            {newsArticle.creator && <small className="me-3">👤 {newsArticle.creator.name}</small>}
            <small>👁 {newsArticle.views || 0} lượt xem</small>
          </div>
          <div dangerouslySetInnerHTML={{ __html: newsArticle.content }} />
        </div>
      </div>

      {/* Tin liên quan */}
      {relatedNews.length > 0 && (
        <div>
          <h2 className="mb-3">Tin Tức Liên Quan</h2>
          <div className="row g-3">
            {relatedNews.map((article) => (
              <div key={article.id} className="col-sm-6 col-md-4">
                <div className="card h-100 shadow-sm">
                  <img
                    src={
                      article.image
                        ? `${article.image}`
                        : 'https://via.placeholder.com/300x200?text=No+Image'
                    }
                    className="card-img-top"
                    alt={article.title}
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title" style={{ fontSize: '1rem' }}>
                      {article.title}
                    </h5>
                    <Link to={`/news/${article.id}`} className="btn btn-outline-primary btn-sm">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsDetail;
