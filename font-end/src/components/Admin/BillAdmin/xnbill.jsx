import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Cấu hình Axios toàn cục
axios.defaults.withCredentials = true;

const AdminBillManagementPage = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null); // Lưu trữ callback cho hành động xác nhận

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const token = localStorage.getItem('token');

    // Hàm hiển thị hộp thoại cảnh báo tùy chỉnh
    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    // Hàm hiển thị hộp thoại xác nhận tùy chỉnh
    const showCustomConfirm = (message, actionCallback) => {
        setConfirmMessage(message);
        setShowConfirm(true);
        setConfirmAction(() => actionCallback); // Lưu trữ hành động sẽ thực hiện khi xác nhận
    };

    // Đóng hộp thoại cảnh báo
    const closeCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    // Xử lý xác nhận 'Đồng ý' từ hộp thoại
    const handleConfirmYes = () => {
        setShowConfirm(false);
        if (confirmAction) confirmAction(); // Thực thi hành động đã lưu
        setConfirmAction(null); // Xóa hành động
    };

    // Xử lý 'Hủy' từ hộp thoại xác nhận
    const handleConfirmNo = () => {
        setShowConfirm(false);
        setConfirmAction(null); // Xóa hành động
    };

    // Lấy danh sách đơn hàng từ API
    const fetchBills = async () => {
        if (!token) {
            showCustomAlert('Bạn cần đăng nhập để xem trang quản lý đơn hàng.');
            navigate('/admin/login');
            return;
        }

        try {
            setLoading(true);
            setError(null); // Reset error state on new fetch
            await axios.get(`${API_URL}/sanctum/csrf-cookie`); // Đảm bảo CSRF cookie được đặt
            const response = await axios.get(`${API_URL}/api/admin/bills`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { status: filterStatus, search: searchTerm },
            });

            if (response.data.status === 200) {
                setBills(response.data.bills.data);
            } else {
                setError(response.data.message || 'Không thể tải đơn hàng.');
            }
        } catch (err) {
            console.error('Lỗi khi tải đơn hàng:', err);
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải đơn hàng.');
            if (err.response && [401, 403].includes(err.response.status)) {
                showCustomAlert('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Hook useEffect để lấy đơn hàng khi component mount hoặc bộ lọc/tìm kiếm thay đổi
    useEffect(() => {
        fetchBills();
    }, [API_URL, navigate, token, filterStatus, searchTerm]); // Các dependency

    // Hàm tiện ích để định dạng tiền tệ
    const formatCurrency = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;
    // Hàm tiện ích để định dạng ngày
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

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

    // Xử lý hành động đơn hàng (xác nhận/hủy/gửi hàng/giao hàng)
    const handleOrderAction = async (billId, actionType) => {
        let confirmMsg = '';
        let successMsg = '';
        let errorMsg = '';

        switch (actionType) {
            case 'confirm':
                confirmMsg = 'Bạn có chắc chắn muốn xác nhận đơn hàng này?';
                successMsg = 'Đơn hàng đã được xác nhận thành công!';
                errorMsg = 'Không thể xác nhận đơn hàng.';
                break;
            case 'ship':
                confirmMsg = 'Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã gửi hàng?';
                successMsg = 'Đơn hàng đã được đánh dấu là đã gửi hàng thành công!';
                errorMsg = 'Không thể đánh dấu đơn hàng là đã gửi hàng.';
                break;
            case 'deliver':
                confirmMsg = 'Bạn có chắc chắn muốn đánh dấu đơn hàng này là đã giao hàng?';
                successMsg = 'Đơn hàng đã được đánh dấu là đã giao hàng thành công!';
                errorMsg = 'Không thể đánh dấu đơn hàng là đã giao hàng.';
                break;
            case 'cancel':
                confirmMsg = 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.';
                successMsg = 'Đơn hàng đã được hủy thành công!';
                errorMsg = 'Không thể hủy đơn hàng.';
                break;
            default:
                return; // Không làm gì nếu actionType không hợp lệ
        }

        showCustomConfirm(confirmMsg, async () => {
            try {
                // Đặt status_updating thành true cho đơn hàng cụ thể để vô hiệu hóa các nút
                setBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: true } : b));

                const endpoint = `${API_URL}/api/admin/bills/${billId}/${actionType}`;
                const response = await axios.post(endpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    showCustomAlert(successMsg);
                    fetchBills(); // Lấy lại danh sách đơn hàng để cập nhật UI
                } else {
                    showCustomAlert(response.data.message || errorMsg);
                    // Kích hoạt lại các nút nếu hành động thất bại
                    setBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: false } : b));
                }
            } catch (err) {
                console.error(`Lỗi khi ${actionType}:`, err);
                showCustomAlert(err.response?.data?.message || `Đã xảy ra lỗi khi ${errorMsg.toLowerCase()}.`);
                // Kích hoạt lại các nút nếu hành động thất bại
                setBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: false } : b));
            }
        });
    };

    // Trạng thái tải và lỗi
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải đơn hàng...</span>
                </div>
                <p className="ms-3 text-secondary">Đang tải đơn hàng...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="alert alert-danger" role="alert">
                    Lỗi: {error}
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
                        Quản Lý Đơn Hàng (Admin)
                    </h2>

                    {/* Phần lọc và tìm kiếm */}
                    <div className="mb-4 d-flex flex-column flex-sm-row align-items-center justify-content-between">
                        <div className="mb-3 mb-sm-0 w-100 w-sm-auto me-sm-3"> {/* Added me-sm-3 for spacing */}
                            <label htmlFor="statusFilter" className="form-label visually-hidden">Lọc theo trạng thái</label>
                            <select
                                id="statusFilter"
                                className="form-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="shipped">Đã gửi hàng</option>
                                <option value="delivered">Đã giao hàng</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>
                        </div>

                        <div className="w-100 w-sm-auto flex-grow-1"> {/* flex-grow-1 to take remaining space */}
                            <label htmlFor="search" className="form-label visually-hidden">Tìm kiếm đơn hàng</label>
                            <input
                                type="text"
                                id="search"
                                className="form-control"
                                placeholder="Tìm kiếm theo ID, tên, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Bảng đơn hàng */}
                    {bills.length === 0 ? (
                        <p className="text-center text-muted fs-5 mt-5">Không tìm thấy đơn hàng nào.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-striped align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th scope="col" className="text-start">ID Đơn hàng</th>
                                        <th scope="col" className="text-start">Người nhận</th>
                                        <th scope="col" className="text-start">Ngày đặt</th>
                                        <th scope="col" className="text-start">Tổng tiền</th>
                                        <th scope="col" className="text-start">Trạng thái</th>
                                        <th scope="col" className="text-center">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((bill) => (
                                        <tr key={bill.id_bill}>
                                            <td className="text-start fw-bold">#{bill.id_bill}</td>
                                            <td className="text-start">{bill.hoten_nguoinhan} <br />({bill.dienthoai_nguoinhan})</td>
                                            <td className="text-start">{formatDate(bill.ngaydat)}</td>
                                            <td className="text-start text-primary fw-bold">{formatCurrency(bill.total)}</td>
                                            <td className="text-start">
                                                <span className={`badge ${
                                                    bill.order_status === 'pending' ? 'bg-warning text-dark' :
                                                    bill.order_status === 'processing' ? 'bg-info text-dark' :
                                                    bill.order_status === 'shipped' ? 'bg-primary' :
                                                    bill.order_status === 'delivered' ? 'bg-success' :
                                                    bill.order_status === 'cancelled' ? 'bg-danger' :
                                                    'bg-secondary'
                                                }`}>
                                                    {mapOrderStatusToVietnamese(bill.order_status)}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex flex-wrap justify-content-center gap-2">
                                                    {/* Nút: Xem chi tiết (Luôn hiển thị) */}
                                                    <button
                                                        onClick={() => navigate(`/admin/bills/${bill.id_bill}`)}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Xem chi tiết
                                                    </button>

                                                    {/* Nút: Xác nhận (Chỉ cho đơn hàng 'pending') */}
                                                    {bill.order_status === 'pending' && (
                                                        <button
                                                            onClick={() => handleOrderAction(bill.id_bill, 'confirm')}
                                                            className={`btn btn-success btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                            disabled={bill.status_updating}
                                                        >
                                                            {bill.status_updating ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Đang XN...
                                                                </>
                                                            ) : 'Xác nhận'}
                                                        </button>
                                                    )}

                                                    {/* Nút: Gửi hàng (Chỉ cho đơn hàng 'processing') */}
                                                    {bill.order_status === 'processing' && (
                                                        <button
                                                            onClick={() => handleOrderAction(bill.id_bill, 'ship')}
                                                            className={`btn btn-primary btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                            disabled={bill.status_updating}
                                                        >
                                                            {bill.status_updating ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Đang gửi...
                                                                </>
                                                            ) : 'Gửi hàng'}
                                                        </button>
                                                    )}

                                                    {/* Nút: Đã giao hàng (Chỉ cho đơn hàng 'shipped') */}
                                                    {bill.order_status === 'shipped' && (
                                                        <button
                                                            onClick={() => handleOrderAction(bill.id_bill, 'deliver')}
                                                            className={`btn btn-success btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                            disabled={bill.status_updating}
                                                        >
                                                            {bill.status_updating ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Đang giao...
                                                                </>
                                                            ) : 'Đã giao'}
                                                        </button>
                                                    )}

                                                    {/* Nút: Hủy (Cho đơn hàng 'pending', 'processing', 'shipped') */}
                                                    {['pending', 'processing', 'shipped'].includes(bill.order_status) && (
                                                        <button
                                                            onClick={() => handleOrderAction(bill.id_bill, 'cancel')}
                                                            className={`btn btn-danger btn-sm ${bill.status_updating ? 'disabled' : ''}`}
                                                            disabled={bill.status_updating}
                                                        >
                                                            {bill.status_updating ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                    Đang hủy...
                                                                </>
                                                            ) : 'Hủy'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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

            {/* Modal xác nhận */}
            {showConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content">
                            <div className="modal-header border-0 pb-0">
                                <div className="d-flex w-100">
                                    <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={handleConfirmNo}></button>
                                </div>
                            </div>
                            <div className="modal-body text-center pt-0">
                                <p className="mb-0 fw-normal fs-6">{confirmMessage}</p>
                            </div>
                            <div className="modal-footer justify-content-center border-0 pt-0">
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-danger btn-sm" onClick={handleConfirmYes}>Xác nhận</button>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleConfirmNo}>Hủy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBillManagementPage;
