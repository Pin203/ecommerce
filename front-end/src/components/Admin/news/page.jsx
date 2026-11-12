// src/components/Admin/news/AdminNewsList.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminNewsList = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;
    const navigate = useNavigate();
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL || 'http://127.0.0.1:8000';

    // Fetch news articles
    const fetchNews = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/news`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                params: {
                    title: searchTerm,
                    page: currentPage,
                    per_page: itemsPerPage,
                },
            });
            setNews(response.data.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
            setTotalItems(response.data.total);
        } catch (err) {
            setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            console.error('Lỗi khi lấy bài viết:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete news article
    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
            try {
                await axios.delete(`${LARAVEL_API_URL}/api/admin/news/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setNews(news.filter(item => item.id !== id));
                alert('Xóa bài viết thành công!');
            } catch (err) {
                console.error('Xóa thất bại:', err);
                alert('Xóa bài viết thất bại.');
            }
        }
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= lastPage) {
            setCurrentPage(pageNumber);
        }
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page on new search
        fetchNews();
    };

    // Reset search
    const handleResetSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Fetch data on mount and when search or page changes
    useEffect(() => {
        fetchNews();
    }, [searchTerm, currentPage]);

    return (
        <div className="main-content flex-grow-1 p-4">
            <div className="header-bar d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-gray-800">Quản lý bài viết</h4>
                <div className="d-flex align-items-center">
                    <button className="btn btn-outline-secondary btn-sm rounded-md shadow-sm">
                        <i className="bi bi-bell"></i>
                    </button>
                </div>
            </div>

            {/* Search Card */}
            <div className="card shadow-sm rounded-lg mb-4">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 text-gray-700">Tìm kiếm bài viết</h5>
                </div>
                <div className="card-body p-4">
                    <form className="row g-3 align-items-center" onSubmit={handleSearchSubmit}>
                        <div className="col-md-3">
                            <label htmlFor="searchTerm" className="form-label visually-hidden">Tìm kiếm</label>
                            <input
                                type="text"
                                id="searchTerm"
                                className="form-control rounded-md shadow-sm"
                                placeholder="Nhập tiêu đề bài viết"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-primary w-100 rounded-md shadow-sm">
                                Tìm
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button
                                type="button"
                                className="btn btn-warning w-100 rounded-md shadow-sm"
                                onClick={handleResetSearch}
                            >
                                Đặt lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* News List Card */}
            <div className="card shadow-sm rounded-lg">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-gray-700">Danh sách bài viết</h5>
                    <button
                        className="btn btn-danger rounded-md shadow-sm"
                        onClick={() => navigate('/admin/addnew')}
                    >
                        Thêm bài viết mới
                    </button>
                </div>
                <div className="card-body p-4">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="ms-2">Đang tải bài viết...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" className="py-3 px-4">STT</th>
                                        <th scope="col" className="py-3 px-4">Tiêu đề</th>
                                        <th scope="col" className="py-3 px-4">Hình Ảnh</th>
                                        <th scope="col" className="py-3 px-4">Lượt xem</th>
                                        <th scope="col" className="py-3 px-4">Ngày tạo</th>
                                        <th scope="col" className="py-3 px-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {news.length > 0 ? (
                                        news.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4 fw-medium">
                                                    <Link
                                                        to={`/admin/news/edit/${item.id}`}
                                                        className="text-primary hover:text-primary-600"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        style={{ width: '100px', height: 'auto', borderRadius: '5px' }}
                                                    />
                                                </td>
                                                <td className="py-3 px-4">{item.views || 0}</td>
                                                <td className="py-3 px-4">
                                                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Link
                                                        to={`/admin/news/edit/${item.id}`}
                                                        className="btn btn-sm btn-info me-2"
                                                    >
                                                        Sửa
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">
                                                Không tìm thấy bài viết nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {news.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                    <nav aria-label="Điều hướng trang">
                        <ul className="pagination mb-0 rounded-md">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <a
                                    className="page-link"
                                    href="#"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                >
                                    &laquo;
                                </a>
                            </li>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                                <li
                                    key={page}
                                    className={`page-item ${page === currentPage ? 'active' : ''}`}
                                >
                                    <a
                                        className="page-link"
                                        href="#"
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </a>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                                <a
                                    className="page-link"
                                    href="#"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                >
                                    &raquo;
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <p className="mb-0 text-gray-600">
                        Hiển thị {news.length} trên tổng số {totalItems} bài viết
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminNewsList;