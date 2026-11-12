import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // sửa lại nếu khác

export const getCartByUserId = async (userId) => {
  const response = await axios.get(`${API_URL}/cart/${userId}`);
  return response.data;
};

export const addToCart = async ({ id_user, id_product_detail, quantity }) => {
  const response = await axios.post(`${API_URL}/cart`, {
    id_user,
    id_product_detail,
    quantity,
  });
  return response.data;
};
