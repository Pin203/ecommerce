import React, { useState, useEffect } from 'react';
import axios from 'axios'; 


const NewsList = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
     const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${LARAVEL_API_URL}/api/news`);
                setNews(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load news. Please try again later.');
                setLoading(false);
                console.error("Error fetching news:", err);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return <div className="container">Loading news...</div>;
    }

    if (error) {
        return <div className="container error-message">{error}</div>;
    }

    return (
        <div className="container">
            <h1 className='h1tintuc'>Tin Tức</h1>
            <div className="news-grid">
                {news.length > 0 ? (
                    news.map((article) => (
                        <div className="blog-post" key={article.id}>
                            <div className="post-image">
                                {/* If image is nullable, provide a fallback */}
                                <img
                                    src={`${process.env.REACT_APP_LARAVEL_API_URL}${article.image}` || 'https://via.placeholder.com/400x250/E6E6FA/000000?text=No+Image'}
                                    alt={article.title}
                                />
                            </div>
                            <div className="post-content">
                                <h3 className="post-title">{article.title}</h3>
                                <div className="post-meta">
                                    <span>
                                        {/* Assuming 'created_at' is a valid date string from your API */}
                                        <img src="https://via.placeholder.com/16/000000?text=T" className="icon" alt="Time Icon" />
                                        {' '}{new Date(article.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="post-description">
                                    {/* Display a truncated version of the content */}
                                    {article.content.substring(0, 150)}{article.content.length > 150 ? '...' : ''}
                                </p>
                                <div className="post-tags">
                                    {/* You might fetch tags from your API if they exist, or hardcode them */}
                                    <span>#News</span>
                                </div>
                                <a href={`/news/${article.id}`} className="read-more">Read More</a>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No news articles found.</p>
                )}
            </div>
        </div>
    );
};

export default NewsList;