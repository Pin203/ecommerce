import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AdminNewsEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State cho dữ liệu tin tức, tải, gửi và thông báo
    const [newsData, setNewsData] = useState({
        title: '',
        content: '',
        image: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL || 'http://127.0.0.1:8000';

    // Lấy dữ liệu tin tức khi component được mount
    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get(`${LARAVEL_API_URL}/api/admin/news/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setNewsData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu tin tức:', err.response?.data || err);
                setError('Không thể tải dữ liệu tin tức. Vui lòng thử lại.');
                setLoading(false);
            }
        };

        fetchNews();
    }, [id, LARAVEL_API_URL]);

    // Xử lý thay đổi input văn bản
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewsData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Xử lý chọn file ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setNewsData(prevState => ({
                ...prevState,
                image: URL.createObjectURL(file), // Xem trước ảnh
            }));
        }
    };

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const formData = new FormData();
            formData.append('title', newsData.title);
            formData.append('content', newsData.content);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            formData.append('_method', 'PUT'); // Laravel yêu cầu cho PUT với FormData

            const response = await axios.post(`${LARAVEL_API_URL}/api/admin/news/${id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Tin tức đã được cập nhật thành công!');
            setSubmitting(false);
            setTimeout(() => navigate('/admin/news'), 3000); // Tăng thời gian hiển thị lên 3 giây
            console.log('Phản hồi từ backend:', response.data); // Debug phản hồi
        } catch (err) {
            console.error('Lỗi khi cập nhật tin tức:', err.response?.data || err);
            const errorMessage = err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(', ')
                    : 'Cập nhật tin tức thất bại. Vui lòng kiểm tra lại.');
            setError(errorMessage);
            setSubmitting(false);
        }
    };

    // Trạng thái đang tải
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="ms-2">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="main-content flex-grow-1 p-4">
            <div className="header-bar d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-gray-800">Sửa Tin tức: {newsData.title}</h4>
                <button className="btn btn-outline-secondary btn-sm rounded-md shadow-sm">
                    <i className="bi bi-bell"></i>
                </button>
            </div>

            <div className="card shadow-sm rounded-lg">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 text-gray-700">Chỉnh sửa bài viết</h5>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {success && <div className="alert alert-success" role="alert">{success}</div>}

                    <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Tiêu đề</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newsData.title}
                                onChange={handleChange}
                                className={`form-control rounded-md shadow-sm ${!newsData.title && submitting ? 'is-invalid' : ''}`}
                                placeholder="Nhập tiêu đề bài viết"
                                required
                            />
                            <div className="invalid-feedback">Vui lòng nhập tiêu đề.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">Nội dung</label>
                            <textarea
                                id="content"
                                name="content"
                                rows={8}
                                value={newsData.content}
                                onChange={handleChange}
                                className={`form-control rounded-md shadow-sm ${!newsData.content && submitting ? 'is-invalid' : ''}`}
                                placeholder="Nhập nội dung bài viết"
                                required
                            />
                            <div className="invalid-feedback">Vui lòng nhập nội dung.</div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Hình ảnh</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="form-control rounded-md shadow-sm"
                            />
                            <div className="form-text text-muted mt-1">
                                Chọn tệp hình ảnh để cập nhật (định dạng: jpeg, png, jpg, gif; tối đa 2MB).
                            </div>
                            {newsData.image && (
                                <div className="mt-3">
                                    <img
                                        src={newsData.image}
                                        alt="Xem trước hình ảnh"
                                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '5px' }}
                                    />
                                    <p className="text-muted mt-1">Ảnh hiện tại: {newsData.image}</p>
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary rounded-md shadow-sm"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu Thay đổi'
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary rounded-md shadow-sm"
                                onClick={() => navigate('/admin/news')}
                            >
                                Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminNewsEdit;