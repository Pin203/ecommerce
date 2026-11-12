import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminNewsAdd = () => {
    const navigate = useNavigate();

    // State cho dữ liệu tin tức mới
    const [newsData, setNewsData] = useState({
        title: '',
        content: '',
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL || 'http://127.0.0.1:8000';

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
        setNewsData(prevState => ({
            ...prevState,
            image: file,
        }));

        // Tạo URL tạm thời để xem trước ảnh
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };

    // Xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Tạo đối tượng FormData
        const formData = new FormData();
        formData.append('title', newsData.title);
        formData.append('content', newsData.content);
        if (newsData.image) {
            formData.append('image', newsData.image);
        }

        try {
            const response = await axios.post(`${LARAVEL_API_URL}/api/admin/news`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(response.data.message || 'Tin tức đã được thêm thành công!');
            setSubmitting(false);
            setNewsData({ title: '', content: '', image: null });
            setPreviewImage(null);
            setTimeout(() => navigate('/admin/news'), 3000); // Tăng thời gian hiển thị lên 3 giây
            console.log('Phản hồi từ backend:', response.data); // Debug phản hồi
        } catch (err) {
            console.error('Lỗi khi thêm tin tức:', err.response?.data || err);
            const errorMessage = err.response?.data?.message ||
                (err.response?.data?.errors
                    ? Object.values(err.response.data.errors).flat().join(', ')
                    : 'Thêm tin tức thất bại. Vui lòng kiểm tra lại.');
            setError(errorMessage);
            setSubmitting(false);
        }
    };

    return (
        <div className="main-content flex-grow-1 p-4">
            <div className="header-bar d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-gray-800">Thêm Tin tức Mới</h4>
                <button className="btn btn-outline-secondary btn-sm rounded-md shadow-sm">
                    <i className="bi bi-bell"></i>
                </button>
            </div>

            <div className="card shadow-sm rounded-lg">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 text-gray-700">Thêm bài viết mới</h5>
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
                                Chọn tệp hình ảnh (định dạng: jpeg, png, jpg, gif; tối đa 2MB).
                            </div>
                            {previewImage && (
                                <div className="mt-3">
                                    <img
                                        src={previewImage}
                                        alt="Xem trước hình ảnh"
                                        style={{ maxWidth: '15rem', height: 'auto', borderRadius: '5px' }}
                                    />
                                    <p className="text-muted mt-1">Xem trước ảnh</p>
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
                                        Đang thêm...
                                    </>
                                ) : (
                                    'Thêm Tin tức'
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

export default AdminNewsAdd;