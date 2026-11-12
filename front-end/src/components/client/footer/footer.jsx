import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; 

const Footer = () =>{

    return(
        <>
        <footer class="footer">
     <div class="container">

    <div class="footer-content">
      <div class="footer-column">
        <h3 class="logo">Shos</h3>
        <p> 
          Chúng tôi có những bộ quần áo phù hợp với phong cách của bạn<br />
          có thể tự hào khi mặc.
        </p>
        <div class="social-icons">
          <a href="#"><img src="img/Facebook-200x200.jpg" alt="Facebook" /></a>
          <a href="#"><img src="img/Twitter-logo.jpg" alt="Twitter" /></a>
          <a href="#"><img src="img/Instagram-200x200.jpg" alt="Instagram" /></a>
        </div>
      </div>

      <div class="footer-column">
        <h4>THÔNG TIN LIÊN HỆ</h4>
        <p>Hotline: <a href="tel:0333573303">0333573303</a></p>
        <p>Email: <a href="mailto:Shoso@gmail.com">Shos@gmail.com</a></p>
        <p>Hợp tác kinh doanh: <a href="#">0333573303</a></p>
        <p>Nhượng quyền thương hiệu: <a href="#">0333573303</a></p>
        <p>Phản ánh dịch vụ: <a href="#">0333573303</a></p>
      </div>

      <div class="footer-column">
        <h4>CHÍNH SÁCH</h4>
        <ul>
          <li><a href="#">Vận chuyển và giao nhận</a></li>
          <li><a href="#">Chính sách đổi trả</a></li>
          <li><a href="#">Chính sách bảo hành</a></li>
          <li><a href="#">Xử lý khiếu nại</a></li>
          <li><a href="#">Chính sách vận chuyển</a></li>
          <li><a href="#">Điều khoản sử dụng</a></li>
          <li><a href="#">Bảo mật thông tin</a></li>
          <li><a href="#">Nhượng quyền</a></li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>HƯỚNG DẪN</h4>
        <ul>
          <li><a href="#">Chọn Giày </a></li>
          <li><a href="#">Hướng dẫn thanh toán</a></li>
          <li><a href="#">Kiểm tra bảo hành</a></li>
          <li><a href="#">Kiểm tra đơn hàng</a></li>
          <li><a href="#">HƯỚNG DẪN MUA HÀNG</a></li>
        </ul>
      </div>
    </div>

   
    <div class="footer-bottom">
      <p>Shos © 2025, All Rights Reserved</p>
      <div class="payment-icons">
        <img src="img/images.png" alt="Apple Pay" />
        <img src="img/gg (1).png" alt="Google Pay" />
        <img src="img/MoMo_Logo.png" alt="MoMo" />
        <img src="img/visa.png" alt="Visa" />
        <img src="img/PayPal.svg.png" alt="PayPal" />
      </div>
    </div>
  </div>
</footer>
        </>
    )
}
export default Footer;