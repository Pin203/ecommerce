import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Hàm để đặt lại giỏ hàng về trạng thái trống
  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
    setCartQuantity(0);
    console.log("Giỏ hàng đã được xóa (clearCart).");
  }, []);

  const fetchCart = useCallback(async () => {
    const userStr = localStorage.getItem("user");

    // Nếu không có thông tin user trong localStorage
    if (!userStr) {
      console.log("Không có người dùng đăng nhập trong localStorage. Đặt giỏ hàng trống.");
      clearCart(); // Xóa giỏ hàng ngay lập tức
      return; // Thoát khỏi hàm fetchCart
    }

    let user;
    try {
      user = JSON.parse(userStr);
      // Kiểm tra user.id_user và user.token để đảm bảo thông tin hợp lệ
      if (!user || !user.id_user || !user.token) {
        console.log("Thông tin người dùng không hợp lệ. Đặt giỏ hàng trống.");
        clearCart(); // Xóa giỏ hàng ngay lập tức
        return; // Thoát khỏi hàm fetchCart
      }
    } catch (e) {
      console.error("Lỗi phân tích cú pháp thông tin người dùng từ localStorage:", e);
      clearCart(); // Xóa giỏ hàng nếu có lỗi phân tích cú pháp
      return;
    }

    // Nếu có thông tin người dùng hợp lệ, tiến hành gọi API để lấy giỏ hàng từ database
    try {
      console.log(`Đang tải giỏ hàng từ database cho người dùng ID: ${user.id_user}`);
      const res = await axios.get(
        `${process.env.REACT_APP_LARAVEL_API_URL}/api/cart/${user.id_user}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const items = res.data.cart_items || res.data;

      let totalQty = 0;
      let totalPriceSum = 0;

      items.forEach((item) => {
        const quantity = Number(item.quantity) || 0;
        totalQty += quantity;

        const price = Number(
          item.product_detail?.gia ||
          item.product?.final_price ||
          item.price ||
          0
        );
        totalPriceSum += quantity * price;
      });

      setCartItems(items);
      setCartTotal(totalPriceSum);
      setCartQuantity(totalQty);
      console.log("Giỏ hàng đã được tải thành công từ database.");

    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ API:", error);
      // Xóa giỏ hàng nếu có lỗi xảy ra khi fetch (ví dụ: token hết hạn, lỗi server)
      clearCart();
    }
  }, [clearCart]); // fetchCart phụ thuộc vào clearCart

  useEffect(() => {
    fetchCart(); // Chạy khi component mount

    // Lắng nghe sự kiện 'storage' để cập nhật giỏ hàng khi localStorage thay đổi
    // Điều này hữu ích khi người dùng đăng nhập/đăng xuất trên một tab khác
    window.addEventListener('storage', fetchCart);

    // Dọn dẹp sự kiện lắng nghe khi component unmount
    return () => {
      window.removeEventListener('storage', fetchCart);
    };
  }, [fetchCart]); // Dependency array: fetchCart (do useCallback)

  // Bạn có thể thêm các hàm như addToCart, updateCartItem, removeFromCart ở đây
  // Các hàm này sau khi gọi API (thêm/sửa/xóa trên database) nên gọi lại fetchCart()
  // để cập nhật trạng thái giỏ hàng trong ứng dụng.

  return (
    <CartContext.Provider
      value={{ cartItems, cartTotal, cartQuantity, fetchCart, clearCart }} // Export clearCart
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
