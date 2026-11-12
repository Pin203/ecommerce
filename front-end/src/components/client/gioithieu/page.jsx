import React from 'react';
import './H2VPPage.css'; // Assume a CSS file for styling


const H2VPPage = () => {
  return (
    <div className="h2vp-container">
      
      <section className="intro-section">
        <p className="intro-text">
          Giày thời trang H2VP đang dần trở nên nổi bật trong thế giới giày hiện đại nhờ thiết kế trẻ trung, không gian mua sắm thoải mái và chất lượng sản phẩm được đánh giá cao. Đây là một trong những địa điểm mua giày đang được yêu thích của giới trẻ và các tín đồ thời trang. Khi đến với cửa hàng, bạn có thể đáp ứng mọi nhu cầu cá nhân.
        </p>
        <div className="main-image-container">
          <img src='https://giaysecondhand.com/wp-content/uploads/2021/05/air-force-1-co-3-phien-ban-co-thap-trung-va-cao.jpg' alt="H2VP's fashion shoes" className="main-image" />
        </div>
      </section>

      <section className="about-us-section">
        <h2 className="section-title">Giới thiệu</h2>
        <p>
          Cửa hàng giày thời trang H2VP có địa chỉ tại số 50 đường Đông Hưng Thuận 31, Phường Đông Hưng Thuận, Quận 12, TP.HCM. Với vị trí thuận tiện, chúng tôi muốn mang đến trải nghiệm mua sắm dễ dàng cho khách hàng. Không gian cửa hàng được thiết kế thoáng đãng, hiện đại, mang lại cảm giác thoải mái. Chúng tôi còn có khu vực để giày rộng rãi và khu vực ngồi nghỉ tiện lợi, cùng với hệ thống quạt phun sương để giúp khách hàng luôn cảm thấy dễ chịu.
        </p>
        <div className="product-showcase">
          <div className="product-info-image">
            <img src='https://dongphuchaianh.vn/wp-content/uploads/2021/08/giay-the-thao-nam-chinh-hang-dynamic-store.jpg 'alt="Product information and showcase" className="full-image" />
          </div>
        </div>
        <p>
          Các sản phẩm của chúng tôi luôn được cập nhật, với kiểu dáng đa dạng và phong cách trẻ trung, năng động, từ cổ điển đến hiện đại. Chúng tôi luôn ưu tiên chọn lọc kỹ càng để đảm bảo sản phẩm có chất lượng cao, bền bỉ và thoải mái khi sử dụng.
        </p>
      </section>

      
    </div>
  );
};

export default H2VPPage;