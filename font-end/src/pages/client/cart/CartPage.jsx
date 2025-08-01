import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Header from '../../../components/client/headers/header';
import Footer from '../../../components/client/footer/footer';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import './CartPage.css'

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
  const { fetchCart } = useCart();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id_user || user?.id || null;

  const navigate = useNavigate();

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

  useEffect(() => {
    if (userId) fetchCartFromServer();
  }, [userId]);

  const fetchCartFromServer = async () => {
    try {
      const res = await axios.get(`${LARAVEL_API_URL}/api/cart/${userId}`);

      // Debugging: Kiểm tra dữ liệu ảnh nhận được từ API
      console.log("CartPage Items from API:", res.data);
      res.data.forEach(item => {
          console.log("CartPage Item.img:", item.img, "Full URL:", getFullImageUrl(item.img));
      });

      setCartItems(res.data);

      const totalPrice = res.data.reduce(
        // Đảm bảo chuyển đổi sang số để tránh NaN
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      );
      setTotal(totalPrice);

      fetchCart(); // Gọi fetchCart của CartContext để cập nhật giỏ hàng toàn cục
    } catch (err) {
      console.error('Lỗi lấy giỏ hàng:', err);
    }
  };

  const updateQuantity = async (id_cart, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${LARAVEL_API_URL}/api/cart/${id_cart}`, {
        quantity: newQuantity,
      });
      fetchCartFromServer();
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
    }
  };

  const handleRemove = async (id_cart) => {
    try {
      await axios.delete(`${LARAVEL_API_URL}/api/cart/${id_cart}`);
      fetchCartFromServer();
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
    }
  };

  const handleClearCart = async () => {
    if (!userId) return;
    try {
      const res = await axios.delete(`${LARAVEL_API_URL}/api/cart/clear/${userId}`);
      if (res.status === 200 || res.status === 204) {
        setCartItems([]);
        setTotal(0);
        fetchCart();
        alert('Đã xóa toàn bộ giỏ hàng!');
      } else {
        alert('Xóa giỏ hàng thất bại!');
      }
    } catch (err) {
      console.error('Lỗi xóa rỗng giỏ hàng:', err);
      alert('Có lỗi xảy ra khi xóa giỏ hàng.');
    }
  };

  const formatCurrency = (value) => {
    // Đảm bảo giá trị là số hoặc 0 trước khi định dạng
    return Number(value || 0).toLocaleString('vi-VN') + 'đ';
  };

  const handleCheckout = () => {
    navigate('/thanhtoan');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (!userId) {
    return (
      <>
        <Header />
        <div className="cart-message">Bạn cần đăng nhập để xem giỏ hàng.</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="cart-wrapper">
        <h2 className="cart-title">Giỏ Hàng</h2>

        {cartItems.length === 0 ? (
          <p className="cart-empty">Giỏ hàng của bạn đang trống.</p>
        ) : (
          <div className="cart-grid">
            <div className="cart-left">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Tạm tính</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id_cart}>
                      <td>
                        <div className="cart-product">
                          <img
                            // SỬ DỤNG getFullImageUrl TẠI ĐÂY
                            src={getFullImageUrl(item.img)}
                            alt={item.name}
                          />
                          <div>
                            <p className="cart-name">{item.name}</p>
                            <p className="cart-desc">Màu xám / Size: 36</p>
                            <button
                              className="cart-remove"
                              onClick={() => handleRemove(item.id_cart)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="cart-qty">
                          <button
                            onClick={() =>
                              updateQuantity(item.id_cart, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id_cart, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="text-right bold">
                        {/* Đảm bảo chuyển đổi sang số để tránh NaN */}
                        {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-actions">
                <button className="btn-outline" onClick={handleContinueShopping}>
                  ← Tiếp tục xem sản phẩm
                </button>
                <button className="btn-remove-all" onClick={handleClearCart}>
                  Xóa rỗng giỏ hàng
                </button>
              </div>
            </div>

            <div className="cart-summary">
              <h3>Tổng cộng</h3>
              <div className="summary-line">
                <span>Tạm tính</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="summary-line total">
                <span>Tổng tiền</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <button className="btn-checkout" onClick={handleCheckout}>
                Thanh toán
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default CartPage;