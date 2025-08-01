import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyOrdersPage.css'; // Đảm bảo đã import file CSS này

// Đảm bảo axios gửi cookie với các yêu cầu cross-origin
axios.defaults.withCredentials = true;

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

    // Hàm ánh xạ trạng thái từ backend (tiếng Anh) sang tiếng Việt để hiển thị
    const mapOrderStatusToVietnamese = (status) => {
        switch (status) {
            case 'pending':
                return 'Chờ xác nhận';
            case 'processing':
                return 'Đã xử lý';
            case 'shipped':
                return 'Đã gửi hàng';
            case 'delivered':
                return 'Giao hàng Thành Công';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status; // Trả về nguyên trạng nếu không khớp
        }
    };

    // Hàm để lấy class màu sắc cho badge trạng thái
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-warning text-dark';
            case 'processing':
                return 'bg-info text-dark';
            case 'shipped':
                return 'bg-purple text-white'; // Custom class
            case 'delivered':
                return 'bg-success';
            case 'cancelled':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    // Hàm xử lý hành động hủy đơn hàng
    const handleCancelOrder = async (billId, event) => {
        event.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên thẻ cha (hàng bảng)
        showCustomConfirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.', async () => {
            try {
                // Cập nhật UI một cách lạc quan
                setOrders(prevOrders => prevOrders.map(order =>
                    order.id_bill === billId ? { ...order, status_updating: true } : order
                ));

                const endpoint = `${API_URL}/api/bill/${billId}/cancel`; // Endpoint riêng cho việc hủy
                const response = await axios.post(endpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    showCustomAlert('Đơn hàng đã được hủy thành công!');
                    fetchOrders(); // Tải lại danh sách để cập nhật trạng thái
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

    // Hàm xử lý khi click vào một hàng đơn hàng
    const handleOrderRowClick = (billId) => {
        navigate(`/my-orders/${billId}`);
    };

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

                {orders.length === 0 ? (
                    <p className="text-center text-muted">Bạn chưa có đơn hàng nào.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Mã đơn hàng</th>
                                    <th scope="col">Ngày đặt</th>
                                    <th scope="col">Tổng tiền</th>
                                    <th scope="col">PTTT</th>
                                    <th scope="col">Địa chỉ giao hàng</th>
                                    <th scope="col">Trạng thái</th>
                                    <th scope="col" className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((bill) => (
                                    <tr key={bill.id_bill} className="order-row-custom" onClick={() => handleOrderRowClick(bill.id_bill)}>
                                        <td data-label="Mã đơn hàng">#{bill.id_bill}</td>
                                        <td data-label="Ngày đặt">{formatDate(bill.ngaydat)}</td>
                                        <td data-label="Tổng tiền"><span className="text-success font-weight-bold">{formatCurrency(bill.total)}</span></td>
                                        <td data-label="PTTT">{bill.pttt === 'COD' ? 'COD' : 'ZaloPay'}</td>
                                        <td data-label="Địa chỉ giao hàng">{bill.diachi_nguoinhan}</td>
                                        <td data-label="Trạng thái">
                                            <span className={`badge ${getStatusBadgeClass(bill.order_status)}`}>
                                                {mapOrderStatusToVietnamese(bill.order_status) || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td data-label="Hành động" className="text-center">
                                            {bill.order_status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={(e) => handleCancelOrder(bill.id_bill, e)}
                                                    className={`btn btn-danger btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                    disabled={bill.status_updating}
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

            {/* Render CustomAlert nếu showAlert là true */}
            {showAlert && <CustomAlert message={alertMessage} onClose={closeCustomAlert} />}

            {/* Render CustomConfirm nếu showConfirm là true */}
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