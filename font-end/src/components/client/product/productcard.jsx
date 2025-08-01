import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom'; // Import Link

const Productband = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { brandId } = useParams(); // Lấy brandId từ URL (nếu có)
    const location = useLocation(); // Lấy thông tin về URL hiện tại (để đọc query params)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            let apiUrl = `${process.env.REACT_APP_LARAVEL_API_URL}/api/products`; // URL mặc định cho tất cả sản phẩm

            // Kiểm tra xem có brandId trong URL không
            if (brandId) {
                apiUrl = `${process.env.REACT_APP_LARAVEL_API_URL}/api/products?brand_id=${brandId}`;
            }

            // Kiểm tra xem có query parameter 'name' từ thanh tìm kiếm không
            const searchParams = new URLSearchParams(location.search);
            const productName = searchParams.get('name');
            if (productName) {
                // Nếu có brandId và productName, bạn có thể kết hợp chúng nếu API hỗ trợ
                // Ví dụ: /api/products?brand_id=X&name=Y
                // Trong ví dụ này, chúng ta ưu tiên tìm kiếm theo tên nếu có
                apiUrl = `${process.env.REACT_APP_LARAVEL_API_URL}/api/products?name=${encodeURIComponent(productName)}`;
            }


            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Lỗi mạng khi lấy sản phẩm');
                }
                const data = await response.json();
                // Tùy thuộc vào cấu trúc phản hồi của API, bạn có thể cần data.products hoặc data trực tiếp
                setProducts(data.products || data);
            } catch (err) {
                console.error('Lỗi khi lấy sản phẩm:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [brandId, location.search]); // Chạy lại useEffect khi brandId hoặc query string thay đổi

    if (loading) return <div className="text-center mt-5">Đang tải sản phẩm...</div>;
    if (error) return <div className="text-center mt-5 text-danger">Lỗi: {error}</div>;

    return (
        <div className="container mt-4">
            {brandId ? (
                <h2>Sản phẩm của thương hiệu: **{brandId}**</h2> // Bạn có thể thêm logic để lấy tên thương hiệu nếu muốn
            ) : (
                <h2>Tất cả sản phẩm</h2>
            )}
            <hr />
            <div className="row">
                {products.length > 0 ? (
                    products.map(product => (
                        <div key={product.id} className="col-md-3 mb-4"> {/* Dùng col-md-3 cho 4 cột */}
                            <div className="card h-100 product-card"> {/* Thêm class h-100 để card có cùng chiều cao */}
                                {product.img && (
                                    <Link to={`/product/${product.id}`}>
                                        <img
                                            src={product.img.startsWith('http') ? product.img : `${process.env.REACT_APP_LARAVEL_API_URL}/storage/${product.img}`}
                                            className="card-img-top product-img-fit"
                                            alt={product.name}
                                        />
                                    </Link>
                                )}
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title product-title">{product.name}</h5>
                                    <p className="card-text mt-auto"> {/* mt-auto đẩy giá xuống cuối */}
                                        {product.discount > 0 && (
                                            <span className="original-price text-muted text-decoration-line-through me-2">
                                                {product.price.toLocaleString('vi-VN')}VND
                                            </span>
                                        )}
                                        <span className="final-price fw-bold text-danger">
                                            {product.final_price.toLocaleString('vi-VN')}VND
                                        </span>
                                    </p>
                                    <Link to={`/product/${product.id}`} className="btn btn-primary mt-2">Xem chi tiết</Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">Không tìm thấy sản phẩm nào.</div>
                )}
            </div>
        </div>
    );
};

export default Productband ;