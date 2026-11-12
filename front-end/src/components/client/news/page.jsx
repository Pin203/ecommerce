import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${LARAVEL_API_URL}/api/news`);
        setNews(response.data);
      } catch (err) {
        setError('Không thể tải tin tức. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [LARAVEL_API_URL]);

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="container py-5 text-center">⏳ Đang tải...</div>;
  if (error) return <div className="container py-5 text-danger text-center">{error}</div>;

  return (
    <div className="container py-12 ">
      {/* Tiêu đề */}
      <h1 className="mb-4 text-center">Tin Tức</h1>

      <div className="row">
        {/* Cột chính */}
        <div className="col-md-12">
          {/* Ô tìm kiếm */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm tin tức..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Lưới tin tức */}
          <div className="row g-3 ">
            {filteredNews.length > 0 ? (
              filteredNews.map((article) => (
                <div key={article.id} className="col-sm-6 col-lg-6">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={
                        article.image
                          ? `${article.image}`
                          : 'https://via.placeholder.com/400x250?text=No+Image'
                      }
                      className="card-img-top"
                      alt={article.title}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title" style={{ fontSize: '1rem' }}>
                        {article.title}
                      </h5>
                      <small className="text-muted mb-2">
                        🕒 {new Date(article.created_at).toLocaleDateString()}
                      </small>
                      <p className="card-text" style={{ fontSize: '0.9rem', flexGrow: 1 }}>
                        {article.content.substring(0, 100)}...
                      </p>
                      <Link to={`/news/${article.id}`} className="btn btn-outline-primary btn-sm mt-auto">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Không có tin tức nào.</p>
            )}
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default NewsList;
