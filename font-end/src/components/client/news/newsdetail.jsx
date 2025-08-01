import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Chúng ta cần useParams để lấy ID từ URL


const NewsDetail = () => {
    const { id } = useParams(); // Lấy 'id' từ các tham số URL
    const [newsArticle, setNewsArticle] = useState(null);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Đảm bảo biến này khớp với biến môi trường trong .env của bạn cho URL API
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    useEffect(() => {
        const fetchNewsDetail = async () => {
            try {
                setLoading(true); // Đặt loading thành true cho mỗi lần fetch mới
                setError(null); // Xóa các lỗi trước đó

                const response = await axios.get(`${LARAVEL_API_URL}/api/news/${id}`);
                setNewsArticle(response.data.news);
                setRelatedNews(response.data.related);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải chi tiết tin tức. Vui lòng thử lại sau.');
                setLoading(false);
                console.error("Lỗi khi lấy chi tiết tin tức:", err);
            }
        };

        if (id) {
            fetchNewsDetail();
        }
    }, [id, LARAVEL_API_URL]); // Chạy lại hiệu ứng nếu ID hoặc URL API thay đổi

    if (loading) {
        return <div className="container">Đang tải bài viết tin tức...</div>;
    }

    if (error) {
        return <div className="container error-message">{error}</div>;
    }

    if (!newsArticle) {
        return <div className="container">Không tìm thấy bài viết tin tức.</div>;
    }

    return (
        <div className="container news-detail-page">
            <article className="main-news-article">
                <h1 className="article-title">{newsArticle.title}</h1>
                <div className="article-meta">
                    <span>
                        <img src="https://via.placeholder.com/16/000000?text=T" className="icon" alt="Biểu tượng thời gian" />
                        {' '}{new Date(newsArticle.created_at).toLocaleDateString()}
                    </span>
                    {/* Giả định mối quan hệ 'creator' tồn tại và có trường 'name' */}
                    {newsArticle.creator && (
                        <span style={{ marginLeft: '15px' }}>
                            <img src="https://via.placeholder.com/16/000000?text=U" className="icon" alt="Biểu tượng người dùng" />
                            {' '}{newsArticle.creator.name}
                        </span>
                    )}
                    <span style={{ marginLeft: '15px' }}>
                        <img src="https://via.placeholder.com/16/000000?text=V" className="icon" alt="Biểu tượng lượt xem" />
                        {' '}{newsArticle.views || 0} lượt xem
                    </span>
                </div>
                {newsArticle.image && (
                    <div className="article-image">
                        <img
                            src={`${LARAVEL_API_URL}${newsArticle.image}`}
                            alt={newsArticle.title}
                        />
                    </div>
                )}
                <div className="article-content" dangerouslySetInnerHTML={{ __html: newsArticle.content }}>
                    {/* Sử dụng dangerouslySetInnerHTML nếu nội dung của bạn bao gồm HTML */}
                </div>
                {/* Bạn có thể thêm các chi tiết khác như thẻ, thông tin tác giả, v.v. */}
            </article>

            {relatedNews.length > 0 && (
                <aside className="related-news">
                    <h2>Tin Tức Liên Quan</h2>
                    <div className="related-news-grid">
                        {relatedNews.map((article) => (
                            <div className="related-post" key={article.id}>
                                <Link to={`/news/${article.id}`}>
                                    <div className="related-post-image">
                                        <img
                                            src={`${LARAVEL_API_URL}${article.image}` || 'https://via.placeholder.com/150x100/E6E6FA/000000?text=No+Image'}
                                            alt={article.title}
                                        />
                                    </div>
                                    <h4 className="related-post-title">{article.title}</h4>
                                </Link>
                            </div>
                        ))}
                    </div>
                </aside>
            )}
        </div>
    );
};

export default NewsDetail;