import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Cấu hình Axios toàn cục
axios.defaults.withCredentials = true;

const AdminBillDetailPage = () => {
    const { id_bill } = useParams(); // Lấy ID hóa đơn từ URL
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const token = localStorage.getItem('token');

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Hàm hiển thị hộp thoại cảnh báo tùy chỉnh
    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    // Đóng hộp thoại cảnh báo
    const closeCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    // Lấy chi tiết đơn hàng từ API
    const fetchBillDetails = async () => {
        if (!token) {
            showCustomAlert('Bạn cần đăng nhập để xem chi tiết đơn hàng.');
            navigate('/admin/login');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await axios.get(`${API_URL}/sanctum/csrf-cookie`); // Đảm bảo CSRF cookie được đặt
            const response = await axios.get(`${API_URL}/api/admin/bills/${id_bill}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200) {
                // Xử lý đường dẫn hình ảnh ở đây nếu backend không trả về URL đầy đủ
                const processedBill = { ...response.data.bill };
                if (processedBill.details) {
                    processedBill.details = processedBill.details.map(detail => {
                        if (detail.product_detail && detail.product_detail.product && detail.product_detail.product.img) {
                            // Chỉ thêm API_URL nếu đường dẫn chưa phải là URL đầy đủ
                            if (!detail.product_detail.product.img.startsWith('http')) {
                                // Đảm bảo URL cơ sở không có dấu gạch chéo cuối cùng và đường dẫn hình ảnh không có dấu gạch chéo đầu tiên
                                const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
                                const imgPath = detail.product_detail.product.img.startsWith('/') ? detail.product_detail.product.img.slice(1) : detail.product_detail.product.img;
                                detail.product_detail.product.img = `${baseUrl}/${imgPath}`;
                            }
                        }
                        return detail;
                    });
                }
                setBill(processedBill);
            } else {
                setError(response.data.message || 'Không thể tải chi tiết đơn hàng.');
            }
        } catch (err) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng.');
            if (err.response && [401, 403].includes(err.response.status)) {
                showCustomAlert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Hook useEffect để lấy chi tiết đơn hàng khi component mount hoặc ID hóa đơn thay đổi
    useEffect(() => {
        fetchBillDetails();
    }, [id_bill, API_URL, navigate, token]); // Các dependency

    // Hàm tiện ích để định dạng tiền tệ
    const formatCurrency = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;

    // Hàm tiện ích để định dạng ngày
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Hàm tiện ích để lấy đường dẫn ảnh đầy đủ
    const getImagePath = (imagePath) => {
        // Điều chỉnh URL cơ sở của ảnh nếu cần thiết
        // Ví dụ: nếu ảnh được lưu trong thư mục 'public/storage' của Laravel
        return `${API_URL.replace('/api', '')}/storage/${imagePath}`;
    };

    // Ánh xạ trạng thái tiếng Anh sang tiếng Việt
    const mapOrderStatusToVietnamese = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'processing': return 'Đang xử lý';
            case 'shipped': return 'Đã gửi hàng';
            case 'delivered': return 'Đã giao hàng';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    // Trạng thái tải và lỗi
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải chi tiết đơn hàng...</span>
                </div>
                <p className="ms-3 text-secondary">Đang tải chi tiết đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="alert alert-danger" role="alert">
                    Lỗi: {error}
                </div>
                {showAlert && (
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <div className="modal-header border-0 pb-0">
                                    <div className="d-flex w-100">
                                        <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={closeCustomAlert}></button>
                                    </div>
                                </div>
                                <div className="modal-body text-center pt-0">
                                    <p className="mb-0 fw-normal fs-6">{alertMessage}</p>
                                </div>
                                <div className="modal-footer justify-content-center border-0 pt-0">
                                    <button type="button" className="btn btn-primary btn-sm" onClick={closeCustomAlert}>OK</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="alert alert-warning" role="alert">
                    Không tìm thấy chi tiết đơn hàng.
                </div>
            </div>
        );
    }

    // Render Component chính
    return (
        <div className="container mt-4 mb-4">
            <div className="card shadow-lg border-0 rounded-3">
                <div className="card-body p-4">
                    <h2 className="card-title text-center text-primary mb-4 pb-2 border-bottom">
                        Chi Tiết Đơn Hàng #{bill.id_bill}
                    </h2>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h5 className="text-secondary mb-3">Thông tin đơn hàng</h5>
                            <p><strong>Ngày đặt:</strong> {formatDate(bill.ngaydat)}</p>
                            <p><strong>Tổng tiền:</strong> <span className="text-primary fw-bold">{formatCurrency(bill.total)}</span></p>
                            <p><strong>Phương thức thanh toán:</strong> {bill.pttt}</p>
                            <p><strong>Voucher:</strong> {bill.voucher || 'Không có'}</p>
                            <p>
                                <strong>Trạng thái:</strong>
                                <span className={`badge ms-2 ${bill.order_status === 'pending' ? 'bg-warning text-dark' :
                                        bill.order_status === 'processing' ? 'bg-info text-dark' :
                                            bill.order_status === 'shipped' ? 'bg-primary' :
                                                bill.order_status === 'delivered' ? 'bg-success' :
                                                    bill.order_status === 'cancelled' ? 'bg-danger' :
                                                        'bg-secondary'
                                    }`}>
                                    {mapOrderStatusToVietnamese(bill.order_status)}
                                </span>
                            </p>
                        </div>
                        <div className="col-md-6">
                            <h5 className="text-secondary mb-3">Thông tin người nhận</h5>
                            <p><strong>Họ tên:</strong> {bill.hoten_nguoinhan}</p>
                            <p><strong>Địa chỉ:</strong> {bill.diachi_nguoinhan}</p>
                            <p><strong>Điện thoại:</strong> {bill.dienthoai_nguoinhan}</p>
                            {bill.user && (
                                <>
                                    <h5 className="text-secondary mt-4 mb-3">Thông tin người đặt hàng</h5>
                                    <p><strong>Tên người dùng:</strong> {bill.user.name}</p>
                                    <p><strong>Email:</strong> {bill.user.email}</p>
                                </>
                            )}
                        </div>
                    </div>

                    <h4 className="text-secondary mb-3 pb-2 border-bottom">Sản phẩm trong đơn hàng</h4>
                    {bill.details.length === 0 ? (
                        <p className="text-center text-muted">Không có sản phẩm nào trong đơn hàng này.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col" className="text-center">Ảnh</th>
                                        <th scope="col" className="text-start">Tên sản phẩm</th>
                                        <th scope="col" className="text-start">Màu sắc</th>
                                        <th scope="col" className="text-start">Kích thước</th>
                                        <th scope="col" className="text-end">Giá</th>
                                        <th scope="col" className="text-end">Số lượng</th>
                                        <th scope="col" className="text-end">Tổng phụ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.details.map((detail) => (
                                        <tr key={detail.id_billdetail}>
                                            <td className="text-center">
                                                {detail.product_detail?.product?.img ? (
                                                    <img
                                                        src={
                                                            detail.product_detail?.product?.img?.startsWith('http')
                                                                ? detail.product_detail.product.img
                                                                : `${API_URL}/${detail.product_detail?.product?.img}`
                                                        }
                                                        alt={detail.product_detail?.product?.name || 'Product Image'}
                                                        className="img-thumbnail me-3"
                                                        style={{ width: '80px', height: 'auto', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = `https://placehold.co/80x80/aabbcc/ffffff?text=No+Image`;
                                                        }}
                                                    />
                                                ) : (
                                                    <img
                                                        src="https://placehold.co/80x80/cccccc/333333?text=No+Image"
                                                        alt="Không có ảnh"
                                                        className="img-fluid rounded-3 shadow-sm"
                                                        style={{ maxWidth: '80px', height: 'auto' }}
                                                    />
                                                )}
                                            </td>
                                            <td className="text-start">{detail.product_detail?.product?.name || 'N/A'}</td>
                                            <td className="text-start">{detail.product_detail?.color?.name || 'N/A'}</td>
                                            <td className="text-start">{detail.product_detail?.size?.name || 'N/A'}</td>
                                            <td className="text-end">{formatCurrency(detail.price)}</td>
                                            <td className="text-end">{detail.quantity}</td>
                                            <td className="text-end fw-bold">{formatCurrency(detail.quantity * detail.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="d-flex justify-content-center mt-4">
                        <button
                            onClick={() => navigate('/admin/bills')}
                            className="btn btn-secondary btn-lg"
                        >
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal cảnh báo */}
            {showAlert && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <div className="d-flex w-100">
                                    <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={closeCustomAlert}></button>
                                </div>
                            </div>
                            <div className="modal-body text-center pt-0">
                                <p className="mb-0 fw-normal fs-6">{alertMessage}</p>
                            </div>
                            <div className="modal-footer justify-content-center border-0 pt-0">
                                <button type="button" className="btn btn-primary btn-sm" onClick={closeCustomAlert}>OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBillDetailPage;
