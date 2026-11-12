// src/utils/cartUtils.js
export const calculateCartTotal = (items) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);
