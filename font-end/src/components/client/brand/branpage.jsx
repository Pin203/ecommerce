// // src/pages/client/products/BrandProductsPage.jsx
// import React, { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
// import ProductCard from '../../../components/client/products/ProductCard'; // Import ProductCard

// const BrandProductsPage = () => {
//     const { brandId } = useParams(); // Lấy brandId từ URL
//     const [products, setProducts] = useState([]);
//     const [brandName, setBrandName] = useState('Đang tải...'); // Để hiển thị tên thương hiệu
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

//     useEffect(() => {
//         const fetchBrandData = async () => {
//             setLoading(true);
//             setError(null);
//             setProducts([]); // Xóa sản phẩm cũ khi chuyển thương hiệu

//             try {
//                 // Bước 1: Lấy thông tin chi tiết thương hiệu để hiển thị tên
//                 // Đảm bảo bạn có endpoint này trong Laravel: /api/brands/{id}
//                 const brandResponse = await axios.get(`${LARAVEL_API_URL}/api/brands/${brandId}`);
//                 if (brandResponse.status === 200 && brandResponse.data && brandResponse.data.name) {
//                     setBrandName(brandResponse.data.name);
//                 } else {
//                     setBrandName('Thương hiệu không xác định');
//                 }

//                 // Bước 2: Lấy sản phẩm theo thương hiệu
//                 const productsResponse = await axios.get(`${LARAVEL_API_URL}/api/product/brand/${brandId}`);
//                 if (productsResponse.status === 200 && productsResponse.data) {
//                     setProducts(productsResponse.data);
//                 } else {
//                     throw new Error('Không có dữ liệu sản phẩm.');
//                 }
//             } catch (err) {
//                 console.error("Lỗi khi tải sản phẩm thương hiệu:", err);
//                 if (err.response && err.response.status === 404) {
//                     setError(err.response.data.message || "Không tìm thấy sản phẩm cho thương hiệu này.");
//                 } else {
//                     setError("Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau.");
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (brandId) {
//             fetchBrandData();
//         } else {
//             setLoading(false);
//             setError("Không tìm thấy ID thương hiệu trong URL.");
//         }
//     }, [brandId, LARAVEL_API_URL]); // Chạy lại khi brandId trong URL thay đổi

//     if (loading) {
//         return <div className="container mt-5 text-center">Đang tải sản phẩm của {brandName}...</div>;
//     }

//     if (error) {
//         return <div className="container mt-5 text-center alert alert-danger">{error}</div>;
//     }

//     return (
//         <div className="container mt-4">
//             <nav aria-label="breadcrumb">
//                 <ol className="breadcrumb">
//                     <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
//                     <li className="breadcrumb-item"><Link to="/products">Sản phẩm</Link></li>
//                     <li className="breadcrumb-item active" aria-current="page">Thương hiệu: {brandName}</li>
//                 </ol>
//             </nav>

//             <h1 className="mb-4 text-center">Sản phẩm của Thương hiệu: {brandName}</h1>

//             {products.length === 0 ? (
//                 <div className="alert alert-info text-center">Không có sản phẩm nào cho thương hiệu này.</div>
//             ) : (
//                 <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
//                     {products.map((product) => (
//                         <div className="col" key={product.id_product}>
//                             <ProductCard product={product} />
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BrandProductsPage;