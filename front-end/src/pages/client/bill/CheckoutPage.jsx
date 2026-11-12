import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../../pages/client/cart/CartContext";
import axios from "axios";
import "./CheckoutPage.css";

axios.defaults.withCredentials = true;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { cartItems = [], cartTotal = 0, fetchCart, clearCart } = useCart();
  const SHIPPING_FEE = 30000;
  const API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    voucher: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [singleProduct, setSingleProduct] = useState(null);

  // Voucher
  const [discount, setDiscount] = useState(0);
  const [voucherError, setVoucherError] = useState("");
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherInfo, setVoucherInfo] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user?.id_user && !user?.id) {
      alert("Bạn cần đăng nhập để thanh toán");
      navigate("/dangnhap");
      return;
    }
    fetchUserInfo();

    if (productId) {
      fetchSingleProduct(productId);
    } else {
      fetchCart();
    }
  }, [productId]);

  const fetchUserInfo = async () => {
    try {
      const id = user?.id_user || user?.id;
      if (!id) return;

      const res = await axios.get(`${API_URL}/api/cart/user-info/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data) {
        setShippingInfo((prev) => ({
          ...prev,
          name: res.data.name || "",
          phone: res.data.dienthoai || "",
          email: res.data.email || "",
          address: res.data.diachi || "",
        }));
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin user:", err);
    }
  };

  const fetchSingleProduct = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/product/${id}`);
      const productData = res.data.product;
      const singleItem = {
        id_productdetail: productData.other_details[0].id_product_detail,
        name: productData.name,
        img: productData.img,
        price: productData.final_price,
        quantity: 1,
      };
      setSingleProduct(singleItem);
    } catch (err) {
      console.error("Lỗi lấy thông tin sản phẩm:", err);
      alert("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return false;
    }
    if (!productId && cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return false;
    }
    if (productId && !singleProduct) {
      alert("Đang tải thông tin sản phẩm, vui lòng đợi.");
      return false;
    }
    return true;
  };

 const applyVoucher = async () => {
  if (!shippingInfo.voucher) {
    setVoucherError("Vui lòng nhập mã giảm giá");
    return;
  }

  try {
    setLoading(true);
    setVoucherError("");

    const subtotal = productId ? singleProduct?.price || 0 : cartTotal;

    const res = await axios.post(
      `${API_URL}/api/vouchers/apply`,   // ✅ Đúng endpoint
      { code: shippingInfo.voucher, total: subtotal },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.success) {
      setDiscount(res.data.discount || 0);
      setVoucherApplied(true);
      setVoucherInfo(res.data);
    } else {
      setDiscount(0);
      setVoucherApplied(false);
      setVoucherError(res.data.message || "Mã giảm giá không hợp lệ");
      setVoucherInfo(null);
    }
  } catch (error) {
    console.error("❌ Lỗi khi áp dụng voucher:", error);
    setDiscount(0);
    setVoucherApplied(false);
    setVoucherInfo(null);
    setVoucherError(
      error.response?.data?.message ||
      "Không thể áp dụng voucher"
    );
  } finally {
    setLoading(false);
  }
};


  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    let productsToOrder = [];
    let totalAmount = 0;

    if (productId && singleProduct) {
      productsToOrder = [
        {
          product_id: singleProduct.id_productdetail,
          quantity: singleProduct.quantity,
          price: singleProduct.price,
        },
      ];
      totalAmount = singleProduct.price * singleProduct.quantity;
    } else if (cartItems.length > 0) {
      productsToOrder = cartItems.map((item) => ({
        product_id: item.id_productdetail || item.product_id || item.id,
        quantity: item.quantity,
        price: item.price,
      }));
      totalAmount = cartTotal;
    } else {
      alert("Không có sản phẩm nào để đặt hàng.");
      return;
    }

    totalAmount = totalAmount - discount + SHIPPING_FEE;

    try {
      setLoading(true);

      const payload = {
        products: productsToOrder,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        payment_id: paymentMethod,
        total_price: totalAmount,
        voucher: shippingInfo.voucher || null,
      };

      const res = await axios.post(`${API_URL}/api/bill/checkout`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        const result = res.data;

        if (paymentMethod === "ZaloPay" && result.redirect_url) {
          window.location.href = result.redirect_url;
          return;
        }

        if (!productId) clearCart();

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/my-orders");
        }, 2000);
      } else {
        alert("❌ Đặt hàng thất bại: " + (res.data.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("❌ Lỗi khi đặt hàng:", error);
      alert(
        "❌ Đã xảy ra lỗi khi xử lý đơn hàng: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    `${Number(value).toLocaleString("vi-VN")}₫`;

  const itemsToDisplay = productId
    ? singleProduct
      ? [singleProduct]
      : []
    : cartItems;
  const subtotal = productId
    ? singleProduct
      ? singleProduct.price
      : 0
    : cartTotal;

  return (
    <div className="checkout-wrapper">
      <h2 style={{ textAlign: "center" }}>Thông Tin Thanh Toán</h2>

      <div className="checkout-grid">
        {/* Left */}
        <div className="checkout-left">
          <h3>Thông tin giao hàng</h3>
          <input name="name" placeholder="Họ và tên *" value={shippingInfo.name} onChange={handleChange} />
          <input name="phone" placeholder="Số điện thoại *" value={shippingInfo.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={shippingInfo.email} onChange={handleChange} />
          <input name="address" placeholder="Địa chỉ *" value={shippingInfo.address} onChange={handleChange} />
          <textarea name="note" placeholder="Ghi chú" value={shippingInfo.note} onChange={handleChange} />

          {/* Voucher */}
          <div className="voucher-box">
            <input
              name="voucher"
              placeholder="Mã giảm giá"
              value={shippingInfo.voucher}
              onChange={handleChange}
            />
            <button type="button" onClick={applyVoucher} disabled={loading}>
              {loading ? "Đang áp dụng..." : "Áp dụng"}
            </button>
          </div>
          {voucherError && <p style={{ color: "red" }}>{voucherError}</p>}
          {voucherApplied && voucherInfo && (
            <p style={{ color: "green" }}>
              ✅ Đã áp dụng voucher {voucherInfo.code} - Giảm {formatCurrency(voucherInfo.discount)}
            </p>
          )}

          <h3>Phương thức thanh toán</h3>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Thanh toán khi nhận hàng (COD)
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="ZaloPay"
              checked={paymentMethod === "ZaloPay"}
              onChange={() => setPaymentMethod("ZaloPay")}
            />
            Thanh toán qua ZaloPay
          </label>

          <button className="btn-checkout" onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
          </button>
        </div>

        {/* Right */}
        <div className="checkout-right">
          <h3>Thông Tin Đơn Hàng</h3>
          {itemsToDisplay.length > 0 ? (
            <>
              {itemsToDisplay.map((item) => (
               <div key={item.id_cart || item.id || item.id_productdetail} 
     className="checkout-item">
  <div className="item-info">
    <span className="item-name">{item.name}</span>
    <span className="item-qty">Số lượng:  {item.quantity}</span>
  </div>
  <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
</div>



              ))}
              <div className="checkout-summary">
                <div>
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div>
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div>
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(SHIPPING_FEE)}</span>
                </div>

                <div className="checkout-total">
                  <strong>Tổng tiền:</strong>
                  <strong>
                    {formatCurrency(subtotal - discount + SHIPPING_FEE)}
                  </strong>
                </div>
              </div>
            </>
          ) : (
            <p>Giỏ hàng của bạn đang trống.</p>
          )}
        </div>
      </div>

      {showSuccess && <div className="success-toast">🎉 Đặt hàng thành công!</div>}
    </div>
  );
};

export default CheckoutPage;
