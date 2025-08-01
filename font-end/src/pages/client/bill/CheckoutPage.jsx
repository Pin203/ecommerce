import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import axios from 'axios';
import './CheckoutPage.css';

axios.defaults.withCredentials = true;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems = [], cartTotal = 0, fetchCart } = useCart();
  const SHIPPING_FEE = 30000;
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
    voucher: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user?.id_user && !user?.id) {
      alert('Bạn cần đăng nhập để thanh toán');
      navigate('/dangnhap');
      return;
    }
    fetchUserInfo();
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserInfo = async () => {
    if (!token) return;
    try {
      await axios.get(`${API_URL}/sanctum/csrf-cookie`);
      const res = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setShippingInfo((prev) => ({
        ...prev,
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
      }));
    } catch (err) {
      console.error('Lỗi lấy thông tin user:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return false;
    }
    if (cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axios.get(`${API_URL}/sanctum/csrf-cookie`);

      const validCartItems = cartItems.map(item => ({
        product_id: item.id_productdetail || item.product_id || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const payload = {
        products: validCartItems,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        payment_id: paymentMethod,
        total_price: cartTotal + SHIPPING_FEE,
        voucher: shippingInfo.voucher || '',
      };

      const res = await axios.post(`${API_URL}/api/bill/checkout`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        const result = res.data;

        if (paymentMethod === 'ZaloPay' && result.redirect_url) {
          window.location.href = result.redirect_url;
        } else {
          alert('✅ Đặt hàng thành công!');
          navigate(`/bill/${result.id_bill}`); // 👉 Chuyển về trang chi tiết đơn hàng
        }
      } else {
        alert('❌ Đặt hàng thất bại: ' + (res.data.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('❌ Lỗi khi đặt hàng:', error);
      alert('❌ Đã xảy ra lỗi khi xử lý đơn hàng: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `${Number(value).toLocaleString('vi-VN')}₫`;

  return (
    <div className="checkout-wrapper">
      <h2 style={{ textAlign: 'center' }}>Thông Tin Thanh Toán</h2>

      <div className="checkout-grid">
        <div className="checkout-left">
          <h3>Thông tin giao hàng</h3>
          <input name="name" placeholder="Họ và tên *" value={shippingInfo.name} onChange={handleChange} />
          <input name="phone" placeholder="Số điện thoại *" value={shippingInfo.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={shippingInfo.email} onChange={handleChange} />
          <input name="address" placeholder="Địa chỉ *" value={shippingInfo.address} onChange={handleChange} />
          <textarea name="note" placeholder="Ghi chú" value={shippingInfo.note} onChange={handleChange} />

          <h3>Phương thức thanh toán</h3>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={() => setPaymentMethod('COD')}
            />
            Thanh toán khi nhận hàng (COD)
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="ZaloPay"
              checked={paymentMethod === 'ZaloPay'}
              onChange={() => setPaymentMethod('ZaloPay')}
            />
            Thanh toán qua ZaloPay
          </label>

          <button className="btn-checkout" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
          </button>
        </div>

        <div className="checkout-right">
          <h3>Thông Tin Đơn Hàng</h3>
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div key={item.id_cart || item.id} className="checkout-item">
                  <span>{item.name} - SL: {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="checkout-summary">
                <div>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div>
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(SHIPPING_FEE)}</span>
                </div>
                <div className="checkout-total">
                  <strong>Tổng tiền:</strong>
                  <strong>{formatCurrency(cartTotal + SHIPPING_FEE)}</strong>
                </div>
              </div>
            </>
          ) : (
            <p>Giỏ hàng của bạn đang trống.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
