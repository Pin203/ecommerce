import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
    Chart as ChartJS, // Import các thành phần cần thiết từ Chart.js
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Import Bar chart component

// Đăng ký các thành phần của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Đảm bảo axios gửi cookie với các yêu cầu cross-origin
axios.defaults.withCredentials = true;

export default function Dashboard() {
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
    const [counts, setCounts] = useState({
        total_revenue: 0,
        total_products: 0,
        total_brands: 0,
        total_categories: 0,
        total_orders: 0,
        total_vouchers: 0,
        total_news: 0,
        total_users: 0,
    });
    const [monthlyRevenueData, setMonthlyRevenueData] = useState([]); // State mới cho dữ liệu doanh thu theo tháng
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState(null);

    // Lấy token xác thực từ localStorage (giả định admin cũng dùng token này)
    const token = localStorage.getItem('token');

    // Hàm định dạng tiền tệ Việt Nam Đồng
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Hàm định dạng ngày tháng (Đã di chuyển lên đây) - hiện tại không dùng cho biểu đồ này nhưng vẫn giữ
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Fetch tổng số liệu thống kê
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get(`${LARAVEL_API_URL}/api/admin/dashboard/counts`, {
                    headers: { Authorization: `Bearer ${token}` }, // Gửi token
                });
                setCounts(response.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu thống kê tổng quan:", error);
                // Có thể đặt một state lỗi riêng cho phần thống kê nếu cần
            }
        };

        fetchCounts();
    }, [LARAVEL_API_URL, token]); // Thêm token vào dependency array

    // Fetch dữ liệu doanh thu theo tháng cho biểu đồ
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
    }, [LARAVEL_API_URL, token]); // Thêm token vào dependency array

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartLabels = monthlyRevenueData.map(item => {
        // Định dạng lại 'YYYY-MM' thành 'Tháng MM/YYYY'
        const [year, month] = item.thang.split('-');
        return `Tháng ${month}/${year}`;
    });
    const chartDataValues = monthlyRevenueData.map(item => item.doanh_thu);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: chartDataValues,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Màu cho cột
                borderColor: 'rgba(75, 192, 192, 1)', // Màu viền cột
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Doanh thu theo tháng',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Doanh thu (VND)'
                },
                ticks: {
                    callback: function(value, index, values) {
                        return formatCurrency(value); // Định dạng giá trị trục Y
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tháng'
                }
            }
        },
    };

    return (
        <div id="content">
            <h2 className="mb-4">Thống kê tổng quan</h2>

            <div className="row">
                <div className="col-md-3">
                    <div className="statistic-card">
                        <div>
                            <div className="title">Tổng doanh thu</div>
                            <div className="value">{formatCurrency(counts.total_revenue)}</div>
                        </div>
                        <div className="icon-circle blue">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                    </div>
                </div>

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
                            <div className="title">Tổng đơn hàng</div>
                            <div className="value">{counts.total_orders}</div>
                        </div>
                        <div className="icon-circle blue">
                            <i className="fas fa-shopping-cart"></i>
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

            {/* Phần biểu đồ doanh thu */}
            <div className="row mt-4">
                <div className="col-md-8">
                    <div className="section-card p-3">
                        <h5 className="mb-3">Thống kê doanh thu theo tháng</h5>
                        {revenueLoading ? (
                            <p>Đang tải dữ liệu biểu đồ...</p>
                        ) : revenueError ? (
                            <p className="text-danger">{revenueError}</p>
                        ) : (
                            <div className="chart-container" style={{ height: '400px', width: '100%' }}>
                                <Bar data={data} options={options} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Phần "Đơn hàng mới nhất" - giữ nguyên hoặc cập nhật bằng dữ liệu thực tế nếu có API */}
                <div className="col-md-4">
                    <div className="section-card p-3">
                        <h5 className="mb-3">Đơn hàng mới nhất</h5>
                        <div className="order-item">
                            <p className="mb-1">
                                <strong>Tên</strong>
                            </p>
                            <p className="status mb-1">Trạng thái: Đã giao hàng</p>
                            <p className="mb-1">Mã đơn hàng: #250505_1746410017</p>
                            <p className="method mb-1">Phương thức: Thanh toán bằng ZaloPay</p>
                            <p className="total mb-0">Tổng tiền:</p>
                        </div>
                        {/* Thêm các đơn hàng khác tương tự */}
                    </div>
                </div>
            </div>
        </div>
    );
}