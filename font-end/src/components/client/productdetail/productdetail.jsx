import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../../context/CartContext';
import FeedbackPageprodctdetail from '../../../pages/client/feedback/FeedbackPageprodctdetail';
import CommentSection from '../cmt/CommentSection';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchCart } = useCart();

  const [product, setProduct] = useState(null);
  const [availableDetails, setAvailableDetails] = useState([]);
  const [mainImage, setMainImage] = useState('');
  const [thumbnails, setThumbnails] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);
  const [cartPreview, setCartPreview] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`${LARAVEL_API_URL}/api/product/${id}`);
        console.log('API Response Data:', response.data); // Log toàn bộ dữ liệu API

        if (response.data && response.data.name) {
          setProduct(response.data);
          setAvailableDetails(response.data.other_details || []);

          const mainProductImage = response.data.img;
          setMainImage(mainProductImage);

          let collectedThumbnails = [];

          console.log('response.data.img_phu (from API):', response.data.img_phu);
          console.log('Is response.data.img_phu an array?', Array.isArray(response.data.img_phu));

          // Logic điền thumbnails: Tạm thời chỉ lấy từ img_phu và loại bỏ ảnh chính
          if (response.data.img_phu && Array.isArray(response.data.img_phu)) {
            response.data.img_phu.forEach(extraImg => {
              // Chỉ thêm nếu ảnh phụ tồn tại và KHÔNG phải là ảnh chính
              if (extraImg && extraImg !== mainProductImage) {
                collectedThumbnails.push(extraImg);
              }
            });
          }

          // Nếu bạn muốn thêm ảnh từ other_details, hãy đảm bảo chúng có trường 'img'
          // và thêm logic tương tự ở đây. (Hiện tại JSON bạn gửi không có img trong other_details)
          response.data.other_details?.forEach(detail => {
            if (detail.img && detail.img !== mainProductImage && !collectedThumbnails.includes(detail.img)) {
              collectedThumbnails.push(detail.img);
            }
          });


          console.log('Collected Thumbnails before setting state:', collectedThumbnails); // Log mảng trước khi set state
          setThumbnails(collectedThumbnails);

          if (response.data.brand?.id_brand) {
            const related = await axios.get(`${LARAVEL_API_URL}/api/product/brand/${response.data.brand.id_brand}`);
            const filtered = related.data.filter(p => p.id_product !== response.data.id_product);
            setRelatedProducts(filtered);
          } else {
            setRelatedProducts([]);
          }
        } else {
          setError('Dữ liệu sản phẩm không hợp lệ hoặc không tìm thấy.');
        }
      } catch (err) {
        setError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại sau.');
        console.error("Lỗi khi tải chi tiết sản phẩm:", err);
      }
    };
    fetchProductDetail();
  }, [id, LARAVEL_API_URL]);

  const handleAddToCart = async () => {
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      user = JSON.parse(userStr);
    } catch (e) {
      user = null;
    }

    if (!user || !user.token || !user.id_user) {
      const confirmLogin = window.confirm("⚠️ Bạn cần đăng nhập để thêm vào giỏ hàng.");
      if (confirmLogin) {
        navigate('/dangnhap');
      }
      return;
    }

    const firstDetail = availableDetails.length > 0 ? availableDetails[0] : null;

    if (!firstDetail || !firstDetail.id_product_detail) {
      console.error("Không tìm thấy chi tiết sản phẩm để thêm vào giỏ hàng.");
      return;
    }

    const cartItem = {
      id_user: user.id_user,
      id_productdetail: firstDetail.id_product_detail,
      quantity: quantity,
    };

    try {
      const res = await axios.post(`${LARAVEL_API_URL}/api/cart`, cartItem, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (res.data.success || res.data.message?.includes("Thêm vào giỏ hàng")) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);

        setCartPreview({
          ...cartItem,
          name: product.name,
          img: firstDetail.img || product.img,
          price: firstDetail.gia || product.final_price,
        });

        await fetchCart();
        setQuantity(1);
      } else {
        console.error("Không thể thêm vào giỏ hàng: " + (res.data.message || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi yêu cầu:", err);
      if (err.response) {
        console.error("Lỗi từ server: " + (err.response.data.message || "Không xác định"));
      } else {
        console.error("Lỗi khi thêm vào giỏ hàng. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.");
      }
    }
  };

  if (error) return <p className="text-danger">{error}</p>;
  if (!product) return <p>Đang tải chi tiết sản phẩm...</p>;

  const originalPrice = product.discount && product.discount > 0
    ? product.price / (1 - product.discount / 100)
    : product.price;

  console.log('Final Thumbnails array in render:', thumbnails); // Log cuối cùng trước khi render

  return (
    <div className="product-detail-container">
      {/* ✅ Hiển thị toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#38a169',
          color: 'white',
          padding: '14px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 9999,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          transition: 'opacity 0.3s ease-in-out'
        }}>
          ✅ Đã thêm vào giỏ hàng!
        </div>
      )}

      <div className="product-main-content">
        <div className="product-images">
          <div className="main-image">
            <img src={mainImage || 'https://via.placeholder.com/400'} alt={product.name || 'Sản phẩm'} />
          </div>
          <div className="thumbnails">
            {/* Chỉ hiển thị thumbnails nếu có ảnh phụ */}
            {thumbnails.length > 0 ? (
              thumbnails.map((thumbPath, index) => (
                <img
                  key={index}
                  src={thumbPath}
                  alt={`${product.name} - ảnh ${index + 1}`}
                  onClick={() => setMainImage(thumbPath)}
                  className={mainImage === thumbPath ? 'active' : ''}
                />
              ))
            ) : (
              // Tùy chọn: hiển thị ảnh chính làm thumbnail duy nhất nếu không có ảnh phụ
              // hoặc không hiển thị gì nếu không muốn
              <img
                src={mainImage || 'https://via.placeholder.com/100'}
                alt={`${product.name} - ảnh chính`}
                className="active"
                style={{ cursor: 'default' }}
              />
            )}
          </div>
        </div>

        <div className="product-info-wrapper">
          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="product-meta">
              Mã: <span className="product-code">{product.id_product}</span> |
              Thương hiệu: <span className="product-brand">{product.brand?.name || 'N/A'}</span> |
              Số lượng: <span className="status-available">{product.sl}</span><br />
              Màu: {product.color || 'N/A'}
            </p>
            <p className="price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.final_price)}
              {product.discount > 0 && (
                <span className="old-price">
                  Giá niêm yết: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                </span>
              )}
            </p>

            <div className="quantity-selector">
              <button
                className="quantity-btn minus"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >-</button>

              <input
                type="text"
                value={quantity}
                className="quantity-input"
                readOnly
              />

              <button
                className="quantity-btn plus"
                onClick={() => setQuantity(prev => prev + 1)}
              >+</button>
            </div>

            <div className="add-to-cart-section">
              <button className="add-to-cart-btn buy-now">Mua</button>
              <button className="add-to-cart-btn add-to-cart" onClick={handleAddToCart}>Thêm Giỏ Hàng</button>
            </div>

            <div className="product-features benefit-section">
              <h3><span className="icon-gift">🎁</span> Ưu Đãi</h3>
              <ul>
                <li><span className="icon-check">✔</span> Cam kết chính hãng</li>
                <li><span className="icon-check">✔</span> Tặng bao đơn</li>
                <li><span className="icon-check">✔</span> Kiểm hàng rồi mới thanh toán</li>
                <li><span className="icon-check">✔</span> Bảo hành chính hãng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="related-products-sidebar">
        <h3>Sản Phẩm Liên Quan</h3>
        {relatedProducts.length > 0 ? (
          relatedProducts.map(p => (
            <Link to={`/product/${p.id_product}`} key={p.id_product} className="related-item">
              <img src={p.img || 'https://placehold.co/100x100'} alt={p.name} />
              <div className="related-c">
                <p>{p.name}</p>
                <p className="related-item-price">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.final_price)}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p>Không có sản phẩm liên quan.</p>
        )}
      </div>
        {/* PHẦN ĐÁNH GIÁ */}
      <div className="product-feedback-section" style={{marginTop: '40px'}}>
        {availableDetails.length > 0 ? (
          <FeedbackPageprodctdetail productDetailId={availableDetails[0]?.id_product_detail} />
        ) : (
          <p>Chưa có đánh giá.</p>
        )}
      </div>

      <div className="product-description-section">
        <h3>Mô Tả Sản Phẩm</h3>
        <div dangerouslySetInnerHTML={{ __html: product.mota || 'Chưa có mô tả chi tiết.' }} />
      </div>

      <div className="product-care-section">
        <h3>Hướng dẫn bảo quản Giày</h3>
        <ul>
          <li>- Không giặt bằng máy giặt</li>
          <li>- Tránh ánh nắng trực tiếp</li>
          <li>- Lau khô sau khi sử dụng</li>
        </ul>
      </div>

      <CommentSection productId={product?.id_product} />
    </div>
  );
};

export default ProductDetail;
