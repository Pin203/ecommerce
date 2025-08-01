import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // ✅ đường dẫn tới file bạn có
// Bắt buộc phải import Bootstrap CSS trước
import 'bootstrap/dist/css/bootstrap.min.css';
// Và sau đó là Bootstrap JavaScript (bao gồm Popper.js)
import 'bootstrap/dist/js/bootstrap.bundle.min';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider> {/* ✅ Bọc App trong CartProvider */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
