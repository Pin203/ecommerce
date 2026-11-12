import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyOrdersPage.css';

// Đảm bảo axios gửi cookie với các yêu cầu cross-origin
axios.defaults.withCredentials = true;

// Component chính MyOrdersPage
const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const token = localStorage.getItem('token');

    // State cho CustomAlert và CustomConfirm
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // Lưu trữ callback khi confirm

    // State mới để lọc đơn hàng theo order_status
    const [filterOrderStatus, setFilterOrderStatus] = useState('all');

    // Component Modal tùy chỉnh để thay thế alert()
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

    // Component Modal tùy chỉnh để thay thế window.confirm()
    const CustomConfirm = ({ message, onConfirm, onCancel }) => (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-body text-center">
                        <p className="lead">{message}</p>
                    </div>
                    <div className="modal-footer justify-content-center">
                        <button type="button" className="btn btn-danger me-2" onClick={onConfirm}>
                            Xác nhận
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Hàm hiển thị CustomAlert
    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    // Hàm đóng CustomAlert
    const closeCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    // Hàm hiển thị CustomConfirm
    const showCustomConfirm = (message, actionCallback) => {
        setConfirmMessage(message);
        setConfirmAction(() => actionCallback); // Lưu trữ callback
        setShowConfirm(true);
    };

    // Hàm xử lý khi nhấn Xác nhận trong CustomConfirm
    const handleConfirmYes = () => {
        setShowConfirm(false);
        if (confirmAction) {
            confirmAction(); // Gọi callback đã lưu
        }
        setConfirmAction(null); // Reset action
    };

    // Hàm xử lý khi nhấn Hủy trong CustomConfirm
    const handleConfirmNo = () => {
        setShowConfirm(false);
        setConfirmAction(null); // Reset action
    };

    const fetchOrders = async () => {
        if (!token) {
            showCustomAlert('Bạn cần đăng nhập để xem đơn hàng.');
            navigate('/dangnhap');
            return;
        }

        try {
            setLoading(true);
            await axios.get(`${API_URL}/sanctum/csrf-cookie`);
            const response = await axios.get(`${API_URL}/api/bill/my-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.status === 200) {
                setOrders(response.data.bills);
            } else {
                setError(response.data.message || 'Không thể tải đơn hàng.');
            }
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải đơn hàng.');
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                showCustomAlert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                navigate('/dangnhap');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [API_URL, navigate, token]);

    const formatCurrency = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const mapOrderStatusToVietnamese = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'processing': return 'Đã xử lý';
            case 'shipped': return 'Đã gửi hàng';
            case 'delivered': return 'Giao hàng Thành Công';
            case 'payment_pending': return 'Thất Bại';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'processing': return 'bg-info text-dark';
            case 'shipped': return 'bg-primary text-white';
            case 'delivered': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const mapPaymentStatusToVietnamese = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Chưa thanh ';
            case 'unpaid': return 'Chưa thanh toán';
            case 'paid': return 'Đã thanh toán';
            // case 'failed': return 'Thanh Toán thất bại';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const getPaymentStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-success';
            case 'unpaid':
            return 'bg-warning text-dark';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const handleCancelOrder = async (billId, event) => {
        event.stopPropagation();
        showCustomConfirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.', async () => {
            try {
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id_bill === billId ? { ...order, status_updating: true } : order
                ));
                const endpoint = `${API_URL}/api/bill/${billId}/cancel`;
                const response = await axios.post(endpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.status === 200) {
                    showCustomAlert('Đơn hàng đã được hủy thành công!');
                    fetchOrders();
                } else {
                    showCustomAlert(response.data.message || 'Không thể hủy đơn hàng.');
                    setOrders(prevOrders => prevOrders.map(order =>
                        order.id_bill === billId ? { ...order, status_updating: false } : order
                    ));
                }
            } catch (err) {
                console.error('Lỗi khi hủy đơn hàng:', err);
                showCustomAlert(err.response?.data?.message || 'Đã xảy ra lỗi khi hủy đơn hàng.');
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id_bill === billId ? { ...order, status_updating: false } : order
                ));
            }
        });
    };

    // Hàm này sẽ xử lý việc điều hướng đến trang chi tiết đơn hàng
    const handleOrderRowClick = (billId) => {
        navigate(`/my-orders/${billId}`);
    };

    const filteredOrders = orders.filter(bill => {
        if (filterOrderStatus === 'all') {
            return true;
        }
        return bill.order_status?.toLowerCase() === filterOrderStatus;
    });

    if (loading) {
        return <div className="container text-center py-5">Đang tải đơn hàng...</div>;
    }

    if (error) {
        return <div className="container text-center py-5 text-danger">Lỗi: {error}</div>;
    }

    return (
        <div className="container my-5">
            <div className="card shadow-lg p-4">
                <h2 className="text-center mb-4">Đơn Hàng Của Tôi</h2>

                <div className="filter-buttons mb-3">
                    <button
                        className={`btn ${filterOrderStatus === 'all' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                        onClick={() => setFilterOrderStatus('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`btn ${filterOrderStatus === 'pending' ? 'btn-warning' : 'btn-outline-warning'} text-dark me-2`}
                        onClick={() => setFilterOrderStatus('pending')}
                    >
                        Chờ xác nhận
                    </button>
                    <button
                        className={`btn ${filterOrderStatus === 'processing' ? 'btn-info' : 'btn-outline-info'} text-dark me-2`}
                        onClick={() => setFilterOrderStatus('processing')}
                    >
                        Đã xử lý
                    </button>
                    <button
                        className={`btn ${filterOrderStatus === 'shipped' ? 'btn-primary' : 'btn-outline-primary'} me-2`}

                        onClick={() => setFilterOrderStatus('shipped')}
                    >
                        Đã gửi hàng
                    </button>
                    <button
                        className={`btn ${filterOrderStatus === 'delivered' ? 'btn-success' : 'btn-outline-success'} me-2`}
                        onClick={() => setFilterOrderStatus('delivered')}
                    >
                        Giao hàng Thành Công
                    </button>
                    <button
                        className={`btn ${filterOrderStatus === 'cancelled' ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setFilterOrderStatus('cancelled')}
                    >
                        Đã hủy
                    </button>
                </div>

                {filteredOrders.length === 0 ? (
                    <p className="text-center text-muted">Không có đơn hàng nào với trạng thái này.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Mã đơn hàng</th>
                                    <th scope="col">Ngày đặt</th>
                                    <th scope="col">Ngày nhận hàng</th>
                                    <th scope="col">Tổng tiền</th>
                                    <th scope="col">PTTT</th>
                                    <th scope="col">Địa chỉ giao hàng</th>
                                    <th scope="col">Trạng thái</th>
                                    <th scope="col">Trạng thái thanh toán</th>
                                    <th scope="col" className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((bill) => (
                                    // Bỏ onClick ở đây để chỉ nút bấm mới có thể click
                                    <tr key={bill.id_bill} className="order-row-custom">
                                        <td data-label="Mã đơn hàng">#{bill.id_bill}</td>
                                        <td data-label="Ngày đặt">{formatDate(bill.ngaydat)}</td>
                                        <td className="text-start">{bill.ngaynhan ? formatDate(bill.ngaynhan) : 'Chưa có'}</td>
                                        <td data-label="Tổng tiền"><span className="text-success font-weight-bold">{formatCurrency(bill.total)}</span></td>
                                        <td data-label="PTTT">{bill.pttt === 'COD' ? 'COD' : 'ZaloPay'}</td>
                                        <td data-label="Địa chỉ giao hàng">{bill.diachi_nguoinhan}</td>
                                        <td data-label="Trạng thái">
                                            <span className={`badge ${getStatusBadgeClass(bill.order_status)}`}>
                                                {mapOrderStatusToVietnamese(bill.order_status) || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td data-label="TT Thanh toán">
                                            <span className={`badge ${getPaymentStatusBadgeClass(bill.payment_status)}`}>
                                                {mapPaymentStatusToVietnamese(bill.payment_status) || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td data-label="Hành động" className="text-center">
                                            {/* Thêm nút "Xem chi tiết" với icon mắt */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên hàng (<tr>)
                                                    handleOrderRowClick(bill.id_bill);
                                                }}
                                                className="btn btn-primary btn-sm me-2"
                                                title="Xem chi tiết"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-fill" viewBox="0 0 16 16">
                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                                </svg>
                                            </button>
                                            {/* Nút hủy đơn hàng chỉ hiển thị khi trạng thái là 'pending' */}
                                            {bill.order_status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={(e) => handleCancelOrder(bill.id_bill, e)}
                                                    className={`btn btn-danger btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                    disabled={bill.status_updating}
                                                    title="Hủy đơn hàng"
                                                >
                                                    {bill.status_updating ? 'Đang hủy...' : 'Hủy'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAlert && <CustomAlert message={alertMessage} onClose={closeCustomAlert} />}
            {showConfirm && (
                <CustomConfirm
                    message={confirmMessage}
                    onConfirm={handleConfirmYes}
                    onCancel={handleConfirmNo}
                />
            )}
        </div>
    );
};

export default MyOrdersPage;
