// src/components/client/productdetail/AddToCartButton.jsx
import React from 'react';
import axios from 'axios';

const AddToCartButton = ({ productDetailId, quantity = 1 }) => {
  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
  const user = JSON.parse(localStorage.getItem('user'));

  const handleAddToCart = async () => {
    if (!user) {
      alert('⚠️ Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    try {
      const response = await axios.post(`${LARAVEL_API_URL}/api/cart`, {
        id_user: user.id,
        id_productdetail: productDetailId,
        quantity: quantity,
      });

      if (response.data.message) {
        alert('✅ ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      alert('❌ Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại hoặc kiểm tra đăng nhập.');
    }
  };

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      onClick={handleAddToCart}
    >
      🛒 Thêm vào giỏ hàng
    </button>
  );
};

export default AddToCartButton;
