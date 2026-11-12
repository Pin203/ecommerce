import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

axios.defaults.withCredentials = true;

export default function Dashboard() {
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const [counts, setCounts] = useState({
        total_revenue: 0,
        temporary_revenue: 0,
        confirmed_revenue: 0,
        total_products: 0,
        total_brands: 0,
        total_categories: 0,
        total_orders: 0,
        total_vouchers: 0,
        total_news: 0,
        total_users: 0,
        order_status_counts: {},
    });
    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
    const [pendingBills, setPendingBills] = useState([]); // State cho đơn hàng chờ xử lý
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState(null);
    const [countsLoading, setCountsLoading] = useState(true);
    const [countsError, setCountsError] = useState(null);
    const [pendingBillsLoading, setPendingBillsLoading] = useState(true); // State loading cho đơn hàng chờ xử lý
    const [pendingBillsError, setPendingBillsError] = useState(null); // State lỗi cho đơn hàng chờ xử lý
    const [showOtherStats, setShowOtherStats] = useState(false);
    const [showAlert, setShowAlert] = useState(false); // Cho thông báo tùy chỉnh
    const [alertMessage, setAlertMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false); // Cho hộp thoại xác nhận
    const [confirmMessage, setConfirmMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState(null);

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Hàm hiển thị thông báo tùy chỉnh
    const showCustomAlert = (message) => {
        setAlertMessage(message);
        setShowAlert(true);
    };

    // Hàm hiển thị hộp thoại xác nhận tùy chỉnh
    const showCustomConfirm = (message, actionCallback) => {
        setConfirmMessage(message);
        setShowConfirm(true);
        setConfirmAction(() => actionCallback);
    };

    // Đóng thông báo
    const closeCustomAlert = () => {
        setShowAlert(false);
        setAlertMessage('');
    };

    // Xử lý xác nhận 'Đồng ý' từ hộp thoại
    const handleConfirmYes = () => {
        setShowConfirm(false);
        if (confirmAction) confirmAction();
        setConfirmAction(null);
    };

    // Xử lý 'Hủy' từ hộp thoại xác nhận
    const handleConfirmNo = () => {
        setShowConfirm(false);
        setConfirmAction(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const translateStatus = (status) => {
        switch (status.toLowerCase()) {
            case 'payment_pending':
                return 'Chờ thanh toán';
            case 'pending':
                return 'Chờ xác nhận';
            case 'processing':
                return 'Đang xử lý';
            case 'shipped':
                return 'Đã gửi hàng';
            case 'delivered':
                return 'Đã giao hàng';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const desiredStatuses = ['pending', 'processing', 'shipped', 'delivered'];

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                setCountsLoading(true);
                setCountsError(null);
                const response = await axios.get(`${LARAVEL_API_URL}/api/admin/dashboard/counts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const filteredOrderStatusCounts = Object.fromEntries(
                    Object.entries(response.data.order_status_counts || {}).filter(([status]) =>
                        desiredStatuses.includes(status.toLowerCase())
                    )
                );
                setCounts({
                    ...response.data,
                    order_status_counts: filteredOrderStatusCounts,
                });
                setCountsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu thống kê tổng quan:", error);
                setCountsError("Không thể tải dữ liệu thống kê tổng quan.");
                setCountsLoading(false);
            }
        };

        fetchCounts();
    }, [LARAVEL_API_URL, token]);

    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            try {
                setRevenueLoading(true);
                setRevenueError(null);
                const response = await axios.get(`${LARAVEL_API_URL}/api/admin/thongke/doanhthu`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMonthlyRevenueData(response.data);
                setRevenueLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy doanh thu theo tháng:", error);
                setRevenueError("Không thể tải dữ liệu doanh thu theo tháng.");
                setRevenueLoading(false);
            }
        };

        fetchMonthlyRevenue();
    }, [LARAVEL_API_URL, token]);

    useEffect(() => {
        const fetchPendingBills = async () => {
            try {
                setPendingBillsLoading(true);
                setPendingBillsError(null);
                const response = await axios.get(`${LARAVEL_API_URL}/api/admin/bills`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { status: 'pending', per_page: 5 }, // Chỉ lấy đơn hàng chờ xử lý, giới hạn 5 đơn
                });
                setPendingBills(response.data.bills.data);
                setPendingBillsLoading(false);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đơn hàng chờ xác nhận:", error);
                setPendingBillsError("Không thể tải danh sách đơn hàng chờ xác nhận.");
                setPendingBillsLoading(false);
            }
        };

        fetchPendingBills();
    }, [LARAVEL_API_URL, token]);

    // Xử lý hành động đơn hàng (xác nhận/hủy)
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
            case 'cancel':
                confirmMsg = 'Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.';
                successMsg = 'Đơn hàng đã được hủy thành công!';
                errorMsg = 'Không thể hủy đơn hàng.';
                break;
            default:
                return;
        }

        showCustomConfirm(confirmMsg, async () => {
            try {
                setPendingBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: true } : b));
                const endpoint = `${LARAVEL_API_URL}/api/admin/bills/${billId}/${actionType}`;
                const response = await axios.post(endpoint, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    showCustomAlert(successMsg);
                    // Làm mới danh sách đơn hàng chờ xử lý
                    const refreshResponse = await axios.get(`${LARAVEL_API_URL}/api/admin/bills`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { status: 'pending', per_page: 5 },
                    });
                    setPendingBills(refreshResponse.data.bills.data);
                } else {
                    showCustomAlert(response.data.message || errorMsg);
                    setPendingBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: false } : b));
                }
            } catch (err) {
                console.error(`Lỗi khi ${actionType}:`, err);
                showCustomAlert(err.response?.data?.message || `Đã xảy ra lỗi khi ${errorMsg.toLowerCase()}.`);
                setPendingBills(prev => prev.map(b => b.id_bill === billId ? { ...b, status_updating: false } : b));
            }
        });
    };

  const chartLabels = monthlyRevenueData.map(item => {
    const thang = item.thang || 'N/A'; // Giá trị dự phòng nếu thang là null hoặc undefined
    const [year, month] = thang.includes('-') ? thang.split('-') : ['N/A', 'N/A'];
    return `Tháng ${month}/${year}`;
});
    const chartDataValues = monthlyRevenueData.map(item => item.doanh_thu);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: chartDataValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Doanh thu theo tháng' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
                        return label;
                    }
                }
            }
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Doanh thu (VND)' }, ticks: { callback: value => formatCurrency(value) } },
            x: { title: { display: true, text: 'Tháng' } }
        },
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'blue';
            case 'processing':
                return 'purple';
            case 'shipped':
                return 'green';
            default:
                return 'blue';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'fa-hourglass-half';
            case 'processing':
                return 'fa-cogs';
            case 'shipped':
                return 'fa-truck';
            default:
                return 'fa-shopping-cart';
        }
    };

    return (
  <div id="content">
    <h2 className="mb-4">Thống kê tổng quan</h2>

    {countsLoading ? (
      <p>Đang tải dữ liệu thống kê...</p>
    ) : countsError ? (
      <p className="text-danger">{countsError}</p>
    ) : (
      <div className="row">
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Doanh thu tạm tính</div>
              <div className="value">{formatCurrency(counts.temporary_revenue)}</div>
            </div>
            <div className="icon-circle blue">
              <i className="fas fa-money-bill-wave"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Doanh thu đã xác nhận</div>
              <div className="value">{formatCurrency(counts.confirmed_revenue)}</div>
            </div>
            <div className="icon-circle green">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div
            className="statistic-card"
            style={{ cursor: "pointer" }}
            onClick={() => setShowOtherStats(!showOtherStats)}
          >
            <div>
              <div className="title">Tổng quan khác</div>
              <div className="value">{showOtherStats ? "Ẩn" : "Xem Thêm"}</div>
            </div>
            <div className="icon-circle purple">
              <i className="fas fa-chart-pie"></i>
            </div>
          </div>
        </div>
      </div>
    )}

    {showOtherStats && (
      <div className="row mt-3">
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng đơn hàng</div>
              <div className="value">{counts.total_orders}</div>
            </div>
            <div className="icon-circle blue">
              <i className="fas fa-shopping-cart"></i>
            </div>
          </div>
        </div>
        {counts.order_status_counts && Object.keys(counts.order_status_counts).length > 0 ? (
          Object.keys(counts.order_status_counts).map((status) => (
            <div className="col-md-3" key={status}>
              <div className="statistic-card">
                <div>
                  <div className="title">Đơn hàng {translateStatus(status)}</div>
                  <div className="value">{counts.order_status_counts[status]}</div>
                </div>
                <div className={`icon-circle ${getStatusColor(status)}`}>
                  <i className={`fas ${getStatusIcon(status)}`}></i>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-md-3">
            <div className="statistic-card">
              <div>
                <div className="title">Đơn hàng theo trạng thái</div>
                <div className="value">Không có dữ liệu</div>
              </div>
              <div className="icon-circle gray">
                <i className="fas fa-info-circle"></i>
              </div>
            </div>
          </div>
        )}
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng sản phẩm</div>
              <div className="value">{counts.total_products}</div>
            </div>
            <div className="icon-circle purple">
              <i className="fas fa-cube"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng thương hiệu</div>
              <div className="value">{counts.total_brands}</div>
            </div>
            <div className="icon-circle green">
              <i className="fas fa-building"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng danh mục</div>
              <div className="value">{counts.total_categories}</div>
            </div>
            <div className="icon-circle red">
              <i className="fas fa-list-alt"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng mã giảm giá</div>
              <div className="value">{counts.total_vouchers}</div>
            </div>
            <div className="icon-circle purple">
              <i className="fas fa-percent"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng bài viết</div>
              <div className="value">{counts.total_news}</div>
            </div>
            <div className="icon-circle green">
              <i className="fas fa-pen-nib"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="statistic-card">
            <div>
              <div className="title">Tổng người dùng</div>
              <div className="value">{counts.total_users}</div>
            </div>
            <div className="icon-circle red">
              <i className="fas fa-users-cog"></i>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Phần còn lại của JSX (Đơn hàng chờ xác nhận, biểu đồ doanh thu, modal) giữ nguyên */}
    <div className="row mt-4">
      <div className="col-md-12">
        <div className="section-card p-3">
          <h5 className="mb-3">Đơn hàng chờ xác nhận</h5>
          {pendingBillsLoading ? (
            <p>Đang tải dữ liệu đơn hàng...</p>
          ) : pendingBillsError ? (
            <p className="text-danger">{pendingBillsError}</p>
          ) : pendingBills.length === 0 ? (
            <p className="text-center text-muted fs-5 mt-5">Không có đơn hàng chờ xác nhận nào.</p>
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
                  {pendingBills.map((bill) => (
                    <tr key={bill.id_bill}>
                      <td className="text-start fw-bold">#{bill.id_bill}</td>
                      <td className="text-start">{bill.hoten_nguoinhan} <br />({bill.dienthoai_nguoinhan})</td>
                      <td className="text-start">{formatDate(bill.ngaydat)}</td>
                      <td className="text-start text-primary fw-bold">{formatCurrency(bill.total)}</td>
                      <td className="text-start">
                        <span className="badge bg-warning text-dark">{translateStatus(bill.order_status)}</span>
                      </td>
                      <td className="text-center">
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/bills/${bill.id_bill}`)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => handleOrderAction(bill.id_bill, "confirm")}
                            className={`btn btn-success btn-sm ${bill.status_updating ? "disabled" : ""}`}
                            disabled={bill.status_updating}
                          >
                            {bill.status_updating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Đang XN...
                              </>
                            ) : (
                              "Xác nhận"
                            )}
                          </button>
                          <button
                            onClick={() => handleOrderAction(bill.id_bill, "cancel")}
                            className={`btn btn-danger btn-sm ${bill.status_updating ? "disabled" : ""}`}
                            disabled={bill.status_updating}
                          >
                            {bill.status_updating ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Đang hủy...
                              </>
                            ) : (
                              "Hủy"
                            )}
                          </button>
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
    </div>

    <div className="row mt-4">
      <div className="col-md-12">
        <div className="section-card p-3">
          <h5 className="mb-3">Thống kê doanh thu theo tháng</h5>
          {revenueLoading ? (
            <p>Đang tải dữ liệu biểu đồ...</p>
          ) : revenueError ? (
            <p className="text-danger">{revenueError}</p>
          ) : (
            <div className="chart-container" style={{ height: "400px", width: "100%" }}>
              <Bar data={data} options={options} />
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modal thông báo */}
    {showAlert && (
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={closeCustomAlert}></button>
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
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <button type="button" className="btn-close ms-auto" aria-label="Close" onClick={handleConfirmNo}></button>
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
}