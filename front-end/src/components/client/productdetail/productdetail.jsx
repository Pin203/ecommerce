import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../../pages/client/cart/CartContext';
import FeedbackPageprodctdetail from '../../../pages/client/feedback/FeedbackPageprodctdetail';
import CommentSection from '../cmt/CommentSection';
import Swal from 'sweetalert2';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchCart } = useCart();
    const [product, setProduct] = useState(null);
    const [availableDetails, setAvailableDetails] = useState([]);
    const [mainImage, setMainImage] = useState('');
    const [thumbnails, setThumbnails] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [stockQuantity, setStockQuantity] = useState(0); 
    const [showToast, setShowToast] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                // ✅ Gọi đúng endpoint chi tiết sản phẩm đã thiết lập ở backend
                const response = await axios.get(`${LARAVEL_API_URL}/api/product/${id}`);
                
                // ✅ Kiểm tra xem dữ liệu có hợp lệ hay không
                if (response.data && response.data.status === 'success' && response.data.product) {
                    const productData = response.data.product; // ✅ Lấy đối tượng product từ response
                    setProduct(productData);

                    // Cập nhật các state khác
                    setAvailableDetails(productData.other_details || []);
                    if (productData.other_details && productData.other_details.length > 0) {
                        setStockQuantity(productData.other_details[0].sl);
                    }

                    const mainProductImage = productData.img;
                    setMainImage(mainProductImage);

                    let collectedThumbnails = [];
                    if (productData.img_phu && Array.isArray(productData.img_phu)) {
                        collectedThumbnails = productData.img_phu.filter(img => img && img !== mainProductImage);
                    }
                    setThumbnails(collectedThumbnails);

                    // Lấy sản phẩm liên quan
                    if (productData.brand?.id_brand) {
                        const related = await axios.get(`${LARAVEL_API_URL}/api/product/brand/${productData.brand.id_brand}`);
                        const filtered = related.data.filter(p => p.id_product !== productData.id_product);
                        setRelatedProducts(filtered);
                    } else {
                        setRelatedProducts([]);
                    }
                } else {
                    setError('Dữ liệu sản phẩm không hợp lệ hoặc không tìm thấy.');
                }
            } catch (err) {
                setError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.');
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
            }
        };

        const checkWishlistStatus = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.token) {
                try {
                    const response = await axios.get(`${LARAVEL_API_URL}/api/wishlist/status/${id}`, {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    });
                    setIsWishlisted(response.data.isWishlisted);
                } catch (err) {
                    console.error("Lỗi khi kiểm tra wishlist:", err);
                }
            }
        };

        if (id) {
            fetchProductDetail();
            checkWishlistStatus();
        }
    }, [id, LARAVEL_API_URL]);

    // ✅ Thêm hàm xử lý "Mua ngay"
    const handleBuyNow = () => {
        if (!product) {
            Swal.fire('Lỗi!', 'Không tìm thấy thông tin sản phẩm.', 'error');
            return;
        }
        // ✅ Điều hướng đến trang thanh toán với ID sản phẩm
        navigate(`/checkout/${product.id_product}`);
    };

    // Hàm xử lý thêm vào giỏ hàng (giữ nguyên code của bạn)
    const handleAddToCart = async () => {
        let user = null;
        try {
            const userStr = localStorage.getItem('user');
            user = JSON.parse(userStr);
        } catch (e) {
            user = null;
        }

        if (!user || !user.token || !user.id_user) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Bạn cần đăng nhập để thêm vào giỏ hàng.',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dangnhap');
                }
            });
            return;
        }

        const firstDetail = availableDetails.length > 0 ? availableDetails[0] : null;

        if (!firstDetail || !firstDetail.id_product_detail) {
            console.error("Không tìm thấy chi tiết sản phẩm để thêm vào giỏ hàng.");
            Swal.fire('Lỗi!', 'Sản phẩm này hiện không thể thêm vào giỏ hàng.', 'error');
            return;
        }

        const cartItem = {
            id_user: user.id_user,
            id_productdetail: firstDetail.id_product_detail,
            quantity: quantity,
        };

        try {
            const res = await axios.post(`${LARAVEL_API_URL}/api/cart`, cartItem, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (res.data.success || res.data.message?.includes("Thêm vào giỏ hàng")) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
                await fetchCart();
                setQuantity(1);
            } else {
                console.error("Không thể thêm vào giỏ hàng: " + (res.data.message || "Lỗi không xác định"));
                Swal.fire('Lỗi!', 'Không thể thêm sản phẩm vào giỏ hàng.', 'error');
            }
        } catch (err) {
            console.error("❌ Lỗi khi gửi yêu cầu:", err);
            const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.';
            Swal.fire('Lỗi!', errorMessage, 'error');
        }
    };
    
    // Hàm xử lý thêm/xóa khỏi wishlist (giữ nguyên code của bạn)
    const handleToggleWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('user'));

        if (!user || !user.token) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập!',
                text: 'Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dangnhap');
                }
            });
            return;
        }

        try {
            if (isWishlisted) {
                await axios.delete(`${LARAVEL_API_URL}/api/wishlist/${id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                Swal.fire('Thành công!', 'Đã xóa sản phẩm khỏi danh sách yêu thích.', 'success');
            } else {
                await axios.post(`${LARAVEL_API_URL}/api/wishlist`, { product_id: id }, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                Swal.fire('Thành công!', 'Đã thêm sản phẩm vào danh sách yêu thích.', 'success');
            }

            setIsWishlisted(!isWishlisted);

        } catch (err) {
            console.error("Lỗi khi cập nhật wishlist:", err.response || err);
            Swal.fire('Lỗi!', 'Có lỗi xảy ra, vui lòng thử lại.', 'error');
        }
    };
    
    if (error) return <p className="text-danger">{error}</p>;
    if (!product) return <p>Đang tải chi tiết sản phẩm...</p>;

    const originalPrice = product.discount && product.discount > 0
        ? product.price / (1 - product.discount / 100)
        : product.price;

    return (
        <div className="product-detail-container">
            {showToast && (
                <div style={{
                    position: 'fixed',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#38a169',
                    color: 'white',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 9999,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    transition: 'opacity 0.3s ease-in-out'
                }}>
                    ✅ Đã thêm vào giỏ hàng!
                </div>
            )}

            <div className="product-main-content">
                <div className="product-images">
                    <div className="main-image">
                        <img src={mainImage || 'https://via.placeholder.com/400'} alt={product.name || 'Sản phẩm'} />
                    </div>
                    <div className="thumbnails">
                        {thumbnails.length > 0 ? (
                            thumbnails.map((thumbPath, index) => (
                                <img
                                    key={index}
                                    src={thumbPath}
                                    alt={`${product.name} - ảnh ${index + 1}`}
                                    onClick={() => setMainImage(thumbPath)}
                                    className={mainImage === thumbPath ? 'active' : ''}
                                />
                            ))
                        ) : (
                            <img
                                src={mainImage || 'https://via.placeholder.com/100'}
                                alt={`${product.name} - ảnh chính`}
                                className="active"
                                style={{ cursor: 'default' }}
                            />
                        )}
                    </div>
                </div>

                <div className="product-info-wrapper">
                    <div className="product-info">
                        <div className="product-header">
                            <h2>{product.name}</h2>
                            <span
                                className={`wishlist-icon ${isWishlisted ? 'active' : ''}`}
                                onClick={handleToggleWishlist}
                            >
                                <i className={isWishlisted ? 'fas fa-heart' : 'far fa-heart'}></i>
                            </span>
                        </div>
                        <p className="product-meta">
                            Mã: <span className="product-code">{product.id_product}</span> |
                            Thương hiệu: <span className="product-brand">{product.brand?.name || 'N/A'}</span> |
                            Số lượng: <span className="status-available">{stockQuantity}</span><br />
                            Màu: {product.color || 'N/A'}
                        </p>
                        <p className="price">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.final_price)}
                            {product.discount > 0 && (
                                <span className="old-price">
                                    Giá niêm yết: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                                </span>
                            )}
                        </p>

                        <div className="quantity-selector">
                            <button
                                className="quantity-btn minus"
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            >-</button>
                            <input
                                type="text"
                                value={quantity}
                                className="quantity-input"
                                readOnly
                            />
                            <button
                                className="quantity-btn plus"
                                onClick={() => {
                                    if (quantity < stockQuantity) {
                                        setQuantity(prev => prev + 1);
                                    } else {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Số lượng tối đa',
                                            text: `Chỉ còn ${stockQuantity} sản phẩm trong kho.`,
                                            timer: 2000,
                                            showConfirmButton: false
                                        });
                                    }
                                }}
                                disabled={quantity >= stockQuantity}
                            >+</button>
                        </div>
                        
                        {quantity >= stockQuantity && (
                            <p className="max-quantity-message" style={{ color: 'red', marginTop: '10px' }}>
                                Bạn đã đạt số lượng tối đa cho sản phẩm này.
                            </p>
                        )}

                        <div className="add-to-cart-section">
                            <button className="add-to-cart-btn buy-now" onClick={handleBuyNow}>Mua ngay</button>
                            <button className="add-to-cart-btn add-to-cart" onClick={handleAddToCart}>Thêm Giỏ Hàng</button>
                        </div>

                        <div className="product-features benefit-section">
                            <h3><span className="icon-gift">🎁</span> Ưu Đãi</h3>
                            <ul>
                                <li><span className="icon-check">✔</span> Cam kết chính hãng</li>
                                <li><span className="icon-check">✔</span> Tặng bao đơn</li>
                                <li><span className="icon-check">✔</span> Kiểm hàng rồi mới thanh toán</li>
                                <li><span className="icon-check">✔</span> Bảo hành chính hãng</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="related-products-sidebar">
                <h3>Sản Phẩm Liên Quan</h3>
                {relatedProducts.length > 0 ? (
                    relatedProducts.map(p => (
                        <Link to={`/product/${p.id_product}`} key={p.id_product} className="related-item">
                            <img src={p.img || 'https://placehold.co/100x100'} alt={p.name} />
                            <div className="related-c">
                                <p>{p.name}</p>
                                <p className="related-item-price">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.final_price)}
                                </p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>Không có sản phẩm liên quan.</p>
                )}
            </div>
            
             <div className="product-feedback-section" style={{ marginTop: '40px' }}>
                {availableDetails.length > 0 ? (
                    <FeedbackPageprodctdetail productDetailId={availableDetails[0]?.id_product_detail} />
                ) : (
                    <p>Chưa có đánh giá.</p>
                )}
            </div>

            <div className="product-description-section">
                <h3>Mô Tả Sản Phẩm</h3>
                <div dangerouslySetInnerHTML={{ __html: product.mota || 'Chưa có mô tả chi tiết.' }} />
            </div>

            <div className="product-care-section">
                <h3>Hướng dẫn bảo quản Giày</h3>
                <ul>
                    <li>- Không giặt bằng máy giặt</li>
                    <li>- Tránh ánh nắng trực tiếp</li>
                    <li>- Lau khô sau khi sử dụng</li>
                </ul>
            </div>

            <CommentSection productId={product?.id_product} />
        </div>
    );
};

export default ProductDetail;