import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link ,useNavigate } from 'react-router-dom'; // Import Link từ react-router-dom

const Productnew = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${LARAVEL_API_URL}/api/home/products`);

                if (response.data && response.data.status === "success" && response.data.sanphammoi) {
                    setProducts(response.data.sanphammoi);
                } else {
                    setError('Dữ liệu sản phẩm mới không hợp lệ.');
                }
                setLoading(false);
            } catch (err) {
                setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
                setLoading(false);
                console.error("Lỗi khi tải sản phẩm mới:", err);
            }
        };

        fetchProducts();
    }, [LARAVEL_API_URL]);

    const handleBuyNowClick = (productId) => {
        // Điều hướng đến trang thanh toán với ID sản phẩm
        navigate(`/checkout/${productId}`);
    };

    if (loading) {
        return (
            <section className="new-products-section py-5 text-center">
                <div className="container">
                    <p>Đang tải sản phẩm mới...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="new-products-section py-5 text-center">
                <div className="container">
                    <p className="text-danger">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <section class="features-section py-4">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-3 col-md-6 mb-3">
                            <div class="feature-card d-flex align-items-center justify-content-center p-3">
                                <i class="fa-solid fa-truck-fast feature-icon me-3"></i>
                                <div>
                                    <h5 class="mb-1">Vận chuyển TOÀN QUỐC</h5>
                                    <p class="mb-0">Thanh toán khi nhận hàng</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-3">
                            <div class="feature-card d-flex align-items-center justify-content-center p-3">
                                <i class="fa-solid fa-thumbs-up feature-icon me-3"></i>
                                <div>
                                    <h5>Bảo đảm chất lượng</h5>
                                    <p class="mb-0">Sản phẩm bảo đảm chất lượng</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-3">
                            <div class="feature-card d-flex align-items-center justify-content-center p-3">
                                <i class="fa-solid fa-wallet feature-icon me-3"></i>
                                <div>
                                    <h5 class="mb-1">Tiện hành THANH TOÁN</h5>
                                    <p class="mb-0">Với nhiều PHƯƠNG THỨC</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6 mb-3">
                            <div class="feature-card d-flex align-items-center justify-content-center p-3">
                                <i class="fa-solid fa-arrow-right-arrow-left feature-icon me-3"></i>
                                <div>
                                    <h5 class="mb-1">Đổi sản phẩm mới</h5>
                                    <p class="mb-0">nếu sản phẩm lỗi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="new-products-section py-4">
                <div className="container">
                    <div className="section-header text-center mb-4 p-3">
                        <h2 className="text-white mb-0">SẢN PHẨM MỚI</h2>
                    </div>

                    <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3 justify-content-center">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div className="col" key={product.id_product_detail || product.id_product}>
                                    <Link to={`/product/${product.id_product}`} className="text-decoration-none text-dark">
                                        <div className="product-card position-relative">
                                            <span 
                                                className="new-badge position-absolute bg-danger text-white px-2 py-1 rounded-pill" 
                                                style={{ top: '10px', right: '10px', fontSize: '0.75em', zIndex: 10 }}
                                            >
                                                NEW
                                            </span>                                        
                                            {product.gia && product.price && parseFloat(product.gia) < parseFloat(product.price) && (
                                                <span className="discount-badge">
                                                    -{((1 - (parseFloat(product.gia) / parseFloat(product.price))) * 100).toFixed(0)}%
                                                </span>
                                            )}
                                            <div className="product-image-wrapper">
                                                <img src={`${product.img}`} className="img-fluid"/>
                                            </div>
                                            <div className="product-info p-2">
                                                <p className="product-name mb-1">{product.name}</p>
                                                <div className="rating mb-1">
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-solid fa-star"></i>
                                                    <i className="fa-regular fa-star"></i>
                                                    <i className="fa-regular fa-star"></i>
                                                </div>
                                                <p className="product-price mb-0">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.gia) || parseFloat(product.price))}
                                                </p>
                                                {product.gia && product.price && parseFloat(product.gia) < parseFloat(product.price) && (
                                                    <p className="original-price" style={{ textDecoration: 'line-through', fontSize: '0.8em', color: '#888' }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
                                                    </p>
                                                )}

                                                {/* 👉 Nút Mua ngay */}
                                                <button 
                                                    className="btn btn-sm btn-warning w-100 mt-2"
                                                    onClick={(e) => {
                                                        e.preventDefault(); // tránh Link bị click
                                                        handleBuyNowClick(product.id_product);
                                                    }}
                                                >
                                                    Mua ngay
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center">
                                <p>Không tìm thấy sản phẩm mới nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Productnew;
