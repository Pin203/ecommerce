import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './MyOrdersPage.css';
import FeedbackPagebilldetaipage from '../../../pages/client/feedback/FeedbackPagebilldetaipage';

axios.defaults.withCredentials = true;

const CustomAlert = ({ message, onClose }) => (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-body text-center">
                    <p className="lead">{message}</p>
                </div>
                <div className="modal-footer justify-content-center">
                    <button type="button" className="btn btn-primary" onClick={onClose}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const BillDetailPage = () => {
    const { id_bill } = useParams();
    const navigate = useNavigate();

    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const token = localStorage.getItem('token');

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // State điều khiển hiện feedback cho từng sản phẩm
    const [feedbackVisible, setFeedbackVisible] = useState({});

    const toggleFeedbackForm = (id, visible) => {
        setFeedbackVisible((prev) => ({
            ...prev,
            [id]: visible,
        }));
    };

    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    const closeCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    const fetchBillDetails = async () => {
        if (!token) {
            showCustomAlert('Bạn cần đăng nhập để xem chi tiết đơn hàng.');
            navigate('/dangnhap');
            return;
        }

        try {
            setLoading(true);
            await axios.get(`${API_URL}/sanctum/csrf-cookie`);
            const response = await axios.get(`${API_URL}/api/bill/my-orders/${id_bill}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200) {
                const processedBill = { ...response.data.bill };
                if (processedBill.details) {
                    processedBill.details = processedBill.details.map(detail => {
                        if (detail.product_detail?.product?.img && !detail.product_detail.product.img.startsWith('http')) {
                            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
                            const imgPath = detail.product_detail.product.img.startsWith('/') ? detail.product_detail.product.img.slice(1) : detail.product_detail.product.img;
                            detail.product_detail.product.img = `${baseUrl}/${imgPath}`;
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
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                showCustomAlert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                navigate('/dangnhap');
            } else if (err.response && err.response.status === 404) {
                showCustomAlert('Không tìm thấy đơn hàng này.');
                navigate('/my-orders');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillDetails();
    }, [id_bill, API_URL, navigate, token]);

    const formatCurrency = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const mapOrderStatusToVietnamese = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xác nhận';
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đã gửi hàng';
            case 'delivered':
                return 'Đã giao hàng';
            case 'payment_pending':
                return 'Chưa thanh toán';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    if (loading) {
        return <div className="container text-center py-5">Đang tải chi tiết đơn hàng...</div>;
    }

    if (error) {
        return <div className="container text-center py-5 text-danger">Lỗi: {error}</div>;
    }

    if (!bill) {
        return <div className="container text-center py-5 text-muted">Không tìm thấy chi tiết đơn hàng.</div>;
    }

    return (
        <div className="container my-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Chi Tiết Đơn Hàng #{bill.id_bill}</h2>

                {/* Thông tin chung */}
                <div className="row g-4 mb-4">
                    <div className="col-md-6">
                        <div className="card h-100 p-3 bg-light border">
                            <h3 className="card-title h5 text-primary mb-3">Thông tin chung</h3>
                            <p className="card-text mb-1"><strong>Ngày đặt:</strong> {formatDate(bill.ngaydat)}</p>
                            <p className="card-text mb-1">
                                <strong>Ngày nhận:</strong>{" "}
                                {bill.order_status?.toLowerCase() === "delivered" && bill.ngaynhan
                                    ? formatDate(bill.ngaynhan)
                                    : "Chưa nhận hàng"}
                            </p>
                            <p className="card-text mb-1"><strong>Tổng tiền:</strong> <span className="text-success fw-bold">{formatCurrency(bill.total)}</span></p>
                            <p className="card-text mb-1"><strong>Phương thức thanh toán:</strong> {bill.pttt === 'COD' ? 'Thanh toán khi nhận hàng(COD)' : 'ZaloPay'}</p>
                            <p className="card-text mb-1"><strong>Trạng thái:</strong>
                                <span className={`badge ms-2 ${bill.order_status?.toLowerCase() === 'pending' ? 'bg-warning text-dark' :
                                    bill.order_status?.toLowerCase() === 'processing' ? 'bg-info text-dark' :
                                        bill.order_status?.toLowerCase() === 'shipped' ? 'bg-purple text-white' :
                                            bill.order_status?.toLowerCase() === 'delivered' ? 'bg-success' :
                                                bill.order_status?.toLowerCase() === 'cancelled' ? 'bg-danger' :
                                                    'bg-secondary'
                                }`}>
                                    {mapOrderStatusToVietnamese(bill.order_status) || 'Không xác định'}
                                </span>
                            </p>
                            {bill.voucher && <p className="card-text mb-1"><strong>Voucher:</strong> {bill.voucher}</p>}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="card h-100 p-3 bg-light border">
                            <h3 className="card-title h5 text-primary mb-3">Thông tin người nhận</h3>
                            <p className="card-text mb-1"><strong>Họ tên:</strong> {bill.hoten_nguoinhan}</p>
                            <p className="card-text mb-1"><strong>Điện thoại:</strong> {bill.dienthoai_nguoinhan}</p>
                            <p className="card-text mb-1"><strong>Địa chỉ:</strong> {bill.diachi_nguoinhan}</p>
                        </div>
                    </div>
                </div>

                {/* Chi tiết sản phẩm */}
                <h4 className="h6 text-dark mb-3 pb-2 border-bottom">Chi tiết sản phẩm:</h4>
                <ul className="list-group list-group-flush mb-4">
                    {bill.details.map((detail) => (
                        <li
                            key={detail.id_billdetail}
                            className="list-group-item d-flex justify-content-between align-items-start py-3 flex-wrap"
                        >
                            <div className="d-flex" style={{ flex: '1 1 60%' }}>
                                <img
                                    src={
                                        detail.product_detail?.product?.img?.startsWith('http')
                                            ? detail.product_detail.product.img
                                            : `${API_URL}/${detail.product_detail?.product?.img}`
                                    }
                                    alt={detail.product_detail?.product?.name || 'Product Image'}
                                    className="img-thumbnail me-3"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://placehold.co/80x80/aabbcc/ffffff?text=No+Image`;
                                    }}
                                />
                                <div>
                                    <span className="fw-bold text-dark d-block">
                                        {detail.product_detail?.product?.name || 'Sản phẩm không xác định'}
                                    </span>
                                    {(detail.product_detail?.size?.name || detail.product_detail?.color?.name) && (
                                        <span className="text-muted small">
                                            (
                                            {detail.product_detail.size?.name && `Size: ${detail.product_detail.size.name}`}
                                            {detail.product_detail.size?.name && detail.product_detail.color?.name && ', '}
                                            {detail.product_detail.color?.name && `Màu: ${detail.product_detail.color.name}`}
                                            )
                                        </span>
                                    )}
                                    <span className="text-muted d-block">
                                        SL: {detail.quantity} x {formatCurrency(detail.price)}
                                    </span>
                                    <span className="fw-bold text-dark d-block">
                                        = {formatCurrency(detail.quantity * detail.price)}
                                    </span>
                                </div>
                            </div>

                            <div
                                className="ms-3"
                                style={{ flex: "1 1 35%", minWidth: "250px" }}
                            >
                                {bill.order_status?.toLowerCase() === "delivered" ? (
                                    detail.product_detail?.id_product_detail ? (
                                        (() => {
                                            const now = new Date();
                                            const ngayNhan = bill.ngaynhan ? new Date(bill.ngaynhan) : null;
                                            const hanDanhGia = ngayNhan
                                                ? new Date(ngayNhan.getTime() + 7 * 24 * 60 * 60 * 1000)
                                                : null;
                                            const quaHan = hanDanhGia && now > hanDanhGia;

                                            if (quaHan) {
                                                return <p className="text-danger"> Bạn đã quá hạn ngày đánh giá</p>;
                                            }

                                            return !feedbackVisible[detail.id_billdetail] ? (
                                                <button
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={() => toggleFeedbackForm(detail.id_billdetail, true)}
                                                >
                                                    Đánh giá sản phẩm
                                                </button>
                                            ) : (
                                                <div className="product-feedback-section mt-2 position-relative">
                                                    <button
                                                        onClick={() => toggleFeedbackForm(detail.id_billdetail, false)}
                                                        style={{
                                                            position: "absolute",
                                                            top: "5px",
                                                            right: "5px",
                                                            background: "transparent",
                                                            border: "none",
                                                            fontSize: "18px",
                                                            cursor: "pointer",
                                                            color: "#888",
                                                        }}
                                                    >
                                                        ✖
                                                    </button>
                                                    <FeedbackPagebilldetaipage
                                                        productDetailId={detail.product_detail.id_product_detail}
                                                    />
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-muted">Không thể đánh giá.</p>
                                    )
                                ) : (
                                    <p className="text-muted">
                                        Chỉ có thể đánh giá khi đơn hàng đã giao.
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="d-flex justify-content-center mt-4">
                    <button
                        onClick={() => navigate('/my-orders')}
                        className="btn btn-secondary"
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>

                {showAlert && <CustomAlert message={alertMessage} onClose={closeCustomAlert} />}
            </div>
        </div>
    );
};

export default BillDetailPage;
