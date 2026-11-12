import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
// import './ProductFilter.module.css'
const ProductFlash = () => {
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const countdownRef = useRef(null);
    const navigate = useNavigate(); // Khởi tạo hook useNavigate

    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    // Hàm tính toán thời gian còn lại (giữ nguyên)
    const calculateTimeLeft = (endTime) => {
        const difference = +new Date(endTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        } else {
            timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        }
        return timeLeft;
    };

    // Hàm định dạng thời gian (giữ nguyên)
    const formatTime = (value) => {
        return value < 10 ? `0${value}` : `${value}`;
    };

    // useEffect để fetch sản phẩm và khởi tạo đồng hồ đếm ngược (giữ nguyên)
    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                const response = await axios.get(`${LARAVEL_API_URL}/api/home/products`);
                if (response.data && response.data.status === "success" && response.data.sanphamsale) {
                    setSaleProducts(response.data.sanphamsale);

                    const saleEndTime = new Date();
                    saleEndTime.setHours(saleEndTime.getHours() + 24);

                    setTimeLeft(calculateTimeLeft(saleEndTime));

                    countdownRef.current = setInterval(() => {
                        setTimeLeft(calculateTimeLeft(saleEndTime));
                    }, 1000);

                } else {
                    setError('Không tìm thấy sản phẩm giảm giá hoặc dữ liệu không hợp lệ.');
                }
                setLoading(false);
            } catch (err) {
                setError('Không thể tải sản phẩm giảm giá. Vui lòng thử lại sau.');
                setLoading(false);
                console.error("Lỗi khi tải sản phẩm giảm giá:", err);
            }
        };

        fetchSaleProducts();

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [LARAVEL_API_URL]);

    // Xử lý khi nhấn nút "Mua ngay"
    const handleBuyNowClick = (productId) => {
        // Điều hướng đến trang thanh toán với ID sản phẩm
        navigate(`/checkout/${productId}`);
    };

    if (loading) {
        return (
            <section className="flash-sale-section py-5 text-center">
                <div className="container">
                    <p>Đang tải ưu đãi hấp dẫn...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flash-sale-section py-5 text-center">
                <div className="container">
                    <p className="text-danger">{error}</p>
                </div>
            </section>
        );
    }

    if (saleProducts.length === 0) {
        return (
            <section className="flash-sale-section py-5 text-center">
                <div className="container">
                    <p>Hiện không có sản phẩm nào đang giảm giá.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="flash-sale-section py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="flash-sale-header d-flex align-items-center">
                        <img src='img/las.png' alt="Flash Sale" className="flash-sale-tag me-3" />
                        <h2 className="section-title-flash mb-0">ƯU ĐÃI HẤP DẪN</h2>
                    </div>
                    <div className="countdown-timer d-flex align-items-center">
                        <span className="countdown-label">Chỉ còn:</span>
                        {timeLeft.days > 0 && (
                            <>
                                <div className="countdown-box">
                                    <span className="countdown-value">{formatTime(timeLeft.days)}</span>
                                </div>
                                <span className="countdown-separator">:</span>
                            </>
                        )}
                        <div className="countdown-box">
                            <span className="countdown-value">{formatTime(timeLeft.hours)}</span>
                        </div>
                        <span className="countdown-separator">:</span>
                        <div className="countdown-box">
                            <span className="countdown-value">{formatTime(timeLeft.minutes)}</span>
                        </div>
                        <span className="countdown-separator">:</span>
                        <div className="countdown-box">
                            <span className="countdown-value">{formatTime(timeLeft.seconds)}</span>
                        </div>
                    </div>
                </div>

                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 justify-content-center">
                    {saleProducts.slice(0, 4).map((product) => {
                        const originalPrice = parseFloat(product.price);
                        const discountPercentage = parseFloat(product.discount) || 0;
                        let discountedPrice = originalPrice;

                        if (discountPercentage > 0 && discountPercentage <= 100) {
                            discountedPrice = originalPrice * (1 - discountPercentage / 100);
                        }

                        return (
                            <div className="col" key={product.id_product_detail || product.id_product}>
                                <div className="flash-product-card">
                                    {discountPercentage > 0 && (
                                        <span className="discount-badge-flash">
                                            -{discountPercentage.toFixed(0)}%
                                        </span>
                                    )}
                                    <Link to={`/product/${product.id_product}`} className="text-decoration-none text-dark">
                                        <div className="flash-product-image-wrapper">
                                            <img src={`${product.img}`} className="img-fluid" alt={product.name} />
                                        </div>
                                    </Link>
                                    <div className="flash-product-info p-2">
                                        <p className="flash-product-name mb-1">{product.name}</p>
                                        <p className="flash-product-price mb-1">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(discountedPrice)}
                                            {discountedPrice < originalPrice && (
                                                <span
                                                    className="original-price"
                                                    style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#999' }}
                                                >
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND'
                                                    }).format(originalPrice)}
                                                </span>
                                            )}
                                        </p>
                                        {/* Thay đổi nút thành button và sử dụng onClick để điều hướng */}
                                       <button
                className="btn btn-mua-ngay"
                onClick={() => handleBuyNowClick(product.id_product)}
            >
                Mua ngay
            </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProductFlash;