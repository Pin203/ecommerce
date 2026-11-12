import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Header from '../../../components/client/headers/header';
import Footer from '../../../components/client/footer/footer';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../pages/client/cart/CartContext';
import './CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  // Map để lưu màu và size theo id_product
  const [colorsMap, setColorsMap] = useState({});
  const [sizesMap, setSizesMap] = useState({});

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
  const { fetchCart } = useCart();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id_user || user?.id || null;
  const navigate = useNavigate();

  const getFullImageUrl = (relativePath) => {
    if (!relativePath) {
      return 'https://placehold.co/60x60';
    }
    const BASE_URL = process.env.REACT_APP_LARAVEL_API_URL;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const cleanedBaseUrl = BASE_URL ? (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL) : '';
    const cleanedRelativePath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    return cleanedBaseUrl ? `${cleanedBaseUrl}/${cleanedRelativePath}` : 'https://placehold.co/60x60';
  };

  useEffect(() => {
    if (userId) fetchCartFromServer();
  }, [userId]);

  const fetchCartFromServer = async () => {
    try {
      const res = await axios.get(`${LARAVEL_API_URL}/api/cart/${userId}`);
      setCartItems(res.data);

      const totalPrice = res.data.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      );
      setTotal(totalPrice);

      // 🔥 Sau khi lấy giỏ hàng, load thêm color + size cho từng sản phẩm
      res.data.forEach(item => {
        fetchColors(item.id_product);
        fetchSizes(item.id_product);
      });

      fetchCart();
    } catch (err) {
      console.error('Lỗi lấy giỏ hàng:', err);
    }
  };

  // Gọi API lấy danh sách màu
  const fetchColors = async (id_product) => {
    try {
      const res = await axios.get(`${LARAVEL_API_URL}/api/products/${id_product}/colors`);
      setColorsMap(prev => ({ ...prev, [id_product]: res.data }));
    } catch (err) {
      console.error(`Lỗi lấy màu cho product ${id_product}:`, err);
    }
  };

  // Gọi API lấy danh sách size
  const fetchSizes = async (id_product) => {
    try {
      const res = await axios.get(`${LARAVEL_API_URL}/api/products/${id_product}/sizes`);
      setSizesMap(prev => ({ ...prev, [id_product]: res.data }));
    } catch (err) {
      console.error(`Lỗi lấy size cho product ${id_product}:`, err);
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
      if (err.response && err.response.data && err.response.data.message) {
        showTempMessage(err.response.data.message); 
      } else {
        showTempMessage('Không thể cập nhật số lượng!');
      }
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
        showTempMessage('Đã xóa toàn bộ giỏ hàng!');
      } else {
        showTempMessage('Xóa giỏ hàng thất bại!');
      }
    } catch (err) {
      console.error('Lỗi xóa rỗng giỏ hàng:', err);
      showTempMessage('Có lỗi xảy ra khi xóa giỏ hàng.');
    }
  };

  const showTempMessage = (msg) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  const formatCurrency = (value) => {
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

      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#333',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '18px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {message}
        </div>
      )}

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
                            src={getFullImageUrl(item.img)}
                            alt={item.name}
                          />
                          <div>
                            <p className="cart-name">{item.name}</p>
                            <p className="cart-desc">
                              {/* Lấy màu và size từ state */}
                              Màu: {colorsMap[item.id_product]?.[0]?.color_name || '...'} / 
                              Size: {sizesMap[item.id_product]?.[0]?.size_name || '...'}
                            </p>
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
                          <button onClick={() => updateQuantity(item.id_cart, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id_cart, item.quantity + 1)}>+</button>
                        </div>
                      </td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-right bold">
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

  {/* Hiển thị danh sách sản phẩm và tạm tính */}
  {cartItems.map((item) => (
    <div key={item.id_cart} className="summary-line">
      <span>{item.name} × {item.quantity}</span>
      <span>{formatCurrency(item.price * item.quantity)}</span>
    </div>
  ))}

  <hr />

  {/* Tổng tiền */}
  <div className="summary-line total">
    <span><b>Tổng tiền</b></span>
    <span><b>{formatCurrency(total)}</b></span>
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
