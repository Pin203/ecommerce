import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

const MiniCart = ({ isOpen, onClose }) => {
    const { cartItems, cartQuantity, cartTotal } = useCart();

    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    const userLoggedIn = localStorage.getItem("user") !== null;

    // Để hiển thị một hoặc hai sản phẩm trong popup
    const displayItems = cartItems.slice(0, 2);

    // Hàm tiện ích để có được URL ảnh đầy đủ
    const getFullImageUrl = (relativePath) => {
        if (!relativePath) {
            return 'https://placehold.co/60x60'; // Fallback nếu không có đường dẫn
        }

        const BASE_URL = process.env.REACT_APP_LARAVEL_API_URL;

        // Nếu đường dẫn đã là URL đầy đủ (có http/https), trả về luôn
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }

        // Xử lý để nối đường dẫn một cách an toàn, tránh trùng dấu '/'
        const cleanedBaseUrl = BASE_URL ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';
        const cleanedRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

        // Trả về URL đầy đủ. Nếu BASE_URL không có, vẫn dùng fallback.
        return cleanedBaseUrl ? `${cleanedBaseUrl}/${cleanedRelativePath}` : 'https://placehold.co/60x60';
    };

    // Điều kiện render để khi không mở và giỏ hàng trống thì không render gì cả
    if (!isOpen && cartQuantity === 0) {
        return null;
    }

    return (
        <div
            className={`mini-cart-popup-hover ${isOpen ? 'open' : ''}`}
            onMouseLeave={onClose}
        >
            <div className="mini-cart-header">
                <h3>Giỏ Hàng của bạn ({cartQuantity > 0 ? cartQuantity : 0})</h3>
            </div>

            <div className="mini-cart-body">
                {displayItems.length > 0 ? (
                    <>
                        {displayItems.map(item => (
                            <div key={item.id_productdetail} className="mini-cart-item">
                               {/* Đảm bảo không có ký tự thừa hoặc comment sai cú pháp ở đây */}
                               <img
                                src={getFullImageUrl(item.img)} // Dòng 54 có thể là dòng này trong môi trường của bạn
                                alt={item.name}
                                className="mini-cart-item-img"
                              />
                                <div className="mini-cart-item-info">
                                    <p className="item-name">{item.name || item.product?.name}</p>
                                    <p className="item-qty-price">
                                        {item.quantity} × {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                            Number(item.price || item.product_detail?.gia || item.product?.final_price || 0)
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p>Giỏ hàng của bạn đang trống.</p>
                )}
            </div>

            <div className="mini-cart-footer">
                {userLoggedIn ? (
                    cartQuantity > 0 ? (
                        <>
                            <div className="total-price-row">
                                <p>Tổng phụ:</p>
                                <p className="total-price">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(cartTotal || 0))}</p>
                            </div>
                            <Link to="/giohang" className="btn view-cart-btn" onClick={onClose}>XEM GIỎ HÀNG</Link>
                            <Link to="/thanhtoan" className="btn checkout-btn" onClick={onClose}>THANH TOÁN</Link>
                        </>
                    ) : (
                        null
                    )
                ) : (
                    <Link to="/dangnhap" className="btn view-cart-btn" onClick={onClose}>ĐĂNG NHẬP</Link>
                )}
            </div>
        </div>
    );
};

export default MiniCart;