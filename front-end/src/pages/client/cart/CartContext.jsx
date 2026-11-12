import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

// Tạo một context để quản lý giỏ hàng
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // State để lưu danh sách sản phẩm trong giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  // State để lưu tổng tiền giỏ hàng
  const [cartTotal, setCartTotal] = useState(0);
  // State để lưu tổng số lượng sản phẩm trong giỏ
  const [cartQuantity, setCartQuantity] = useState(0);

  // Hàm xóa giỏ hàng, reset về rỗng
  const clearCart = useCallback(() => {
    setCartItems([]);       // Xóa danh sách sản phẩm
    setCartTotal(0);        // Tổng tiền = 0
    setCartQuantity(0);     // Tổng số lượng = 0
    console.log("Giỏ hàng đã được xóa (clearCart).");
  }, []);

  // Hàm lấy giỏ hàng từ API theo user đang đăng nhập
  const fetchCart = useCallback(async () => {
    const userStr = localStorage.getItem("user"); // Lấy thông tin user từ localStorage

    // Nếu không có user trong localStorage thì reset giỏ hàng
    if (!userStr) {
      console.log("Không có người dùng đăng nhập trong localStorage. Đặt giỏ hàng trống.");
      clearCart();
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr); // Parse JSON string thành object user
      // Kiểm tra thông tin user có hợp lệ hay không
      if (!user || !user.id_user || !user.token) {
        console.log("Thông tin người dùng không hợp lệ. Đặt giỏ hàng trống.");
        clearCart();
        return; 
      }
    } catch (e) {
      console.error("Lỗi phân tích cú pháp thông tin người dùng từ localStorage:", e);
      clearCart(); // Nếu lỗi JSON thì cũng reset giỏ hàng
      return;
    }

    // Nếu user hợp lệ thì gọi API lấy giỏ hàng từ DB
    try {
      console.log(`Đang tải giỏ hàng từ database cho người dùng ID: ${user.id_user}`);
      const res = await axios.get(
        `${process.env.REACT_APP_LARAVEL_API_URL}/api/cart/${user.id_user}`, // Gọi API lấy giỏ hàng
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // Truyền token xác thực
          },
        }
      );

      // Dữ liệu trả về có thể là res.data.cart_items hoặc res.data
      const items = res.data.cart_items || res.data;

      // Tính tổng số lượng và tổng tiền
      let totalQty = 0;
      let totalPriceSum = 0;

      items.forEach((item) => {
        const quantity = Number(item.quantity) || 0; // Số lượng sản phẩm
        totalQty += quantity;

        // Lấy giá sản phẩm (ưu tiên từ product_detail → product → price)
        const price = Number(
          item.product_detail?.gia ||
          item.product?.final_price ||
          item.price ||
          0
        );
        totalPriceSum += quantity * price; // Cộng dồn tổng tiền
      });

      // Cập nhật state
      setCartItems(items);          // Danh sách sản phẩm
      setCartTotal(totalPriceSum);  // Tổng tiền
      setCartQuantity(totalQty);    // Tổng số lượng
      console.log("Giỏ hàng đã được tải thành công từ database.");

    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng từ API:", error);
      clearCart(); // Nếu API lỗi thì reset giỏ hàng
    }
  }, [clearCart]); 

  // useEffect chạy khi component mount
  useEffect(() => {
    fetchCart(); // Lấy giỏ hàng ngay khi vào trang

    // Lắng nghe sự kiện thay đổi localStorage (ví dụ khi đăng nhập ở tab khác)
    window.addEventListener('storage', fetchCart);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('storage', fetchCart);
    };
  }, [fetchCart]);

  // Truyền các giá trị và hàm ra context
  return (
    <CartContext.Provider
      value={{ cartItems, cartTotal, cartQuantity, fetchCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook tiện lợi để dùng context ở component khác
export const useCart = () => useContext(CartContext);
