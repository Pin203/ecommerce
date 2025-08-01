import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminProductList = () => {
    // Khởi tạo các state cho sản phẩm, danh mục, trạng thái tải và lỗi
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Khởi tạo useNavigate
    const navigate = useNavigate();

    // Các state cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm tên sản phẩm
    const [selectedCategory, setSelectedCategory] = useState(''); // Danh mục được chọn để lọc
    const [statusFilter, setStatusFilter] = useState(''); // Trạng thái sản phẩm được chọn để lọc (giả định có trường trạng thái)
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;
     console.log("LARAVEL_API_URL:", process.env.REACT_APP_LARAVEL_API_URL);

    // Hàm để lấy dữ liệu sản phẩm từ backend
    const fetchProducts = async () => {
        setLoading(true); // Đặt trạng thái tải là true
        setError(null);   // Xóa lỗi trước đó
        try {
            // Lưu ý: SanPhamController@index hiện tại ở backend cần được cập nhật để xử lý các tham số truy vấn này.
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/product`, {
                params: {
                    name: searchTerm,
                    id_category: selectedCategory,
                    status: statusFilter, // Giả định có trường trạng thái trên sản phẩm
                }
            });
            // Backend trả về trực tiếp một mảng sản phẩm, không phải response.data.data
            setProducts(response.data); // Cập nhật state sản phẩm
        } catch (err) {
            setError("Không thể tải sản phẩm. Vui lòng thử lại sau."); // Đặt thông báo lỗi
            console.error("Lỗi khi lấy sản phẩm:", err); // Ghi log lỗi vào console
        } finally {
            setLoading(false); // Đặt trạng thái tải là false sau khi hoàn tất
        }
    };

    // Hàm để lấy dữ liệu danh mục cho dropdown bộ lọc
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/category`);
            setCategories(response.data); // Cập nhật state danh mục
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err); // Ghi log lỗi vào console
            // Tùy chọn: đặt lỗi cho việc tải danh mục
        }
    };

    // useEffect để lấy dữ liệu khi component được mount và khi các tham số lọc/tìm kiếm thay đổi
    useEffect(() => {
        fetchProducts();    // Lấy sản phẩm
        fetchCategories();  // Lấy danh mục (chỉ một lần khi mount)
    }, [searchTerm, selectedCategory, statusFilter, LARAVEL_API_URL]); // Thêm LARAVEL_API_URL vào dependencies

    // Hàm xử lý khi nhấn nút Sửa
    const handleEdit = (productId) => {
        console.log("Chỉnh sửa sản phẩm:", productId);
        // Triển khai điều hướng đến trang chỉnh sửa hoặc mở modal
        // Ví dụ: Điều hướng đến trang chỉnh sửa sản phẩm với productId
        navigate(`/admin/products/edit/${productId}`);
    };


    // Hàm xử lý khi nhấn nút Thêm sản phẩm mới
    const handleAddNewProduct = () => {
        console.log("Đang thêm sản phẩm mới");
        // Điều hướng đến trang thêm sản phẩm mới
        navigate('/admin/addPro');
    };

    // Hàm xử lý khi gửi form tìm kiếm
    const handleSearchSubmit = (e) => {
        e.preventDefault(); // Ngăn chặn hành vi gửi form mặc định
        fetchProducts();    // Kích hoạt lấy sản phẩm với các điều kiện tìm kiếm/lọc hiện tại
    };

    return (
        <div className="main-content flex-grow-1 p-4">
            {/* Thanh tiêu đề */}
            <div className="header-bar d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-gray-800">Danh sách sản phẩm</h4>
                <div className="d-flex align-items-center">
                    <span className="badge bg-danger rounded-pill me-2">1</span>
                    <button className="btn btn-outline-secondary btn-sm rounded-md shadow-sm">
                        <i className="bi bi-bell"></i>
                    </button>
                </div>
            </div>

            {/* Thẻ Bộ lọc và Tìm kiếm */}
            <div className="card shadow-sm rounded-lg mb-4">
                <div className="card-header bg-white border-bottom py-3 px-4">
                    <h5 className="mb-0 text-gray-700">Bộ lọc và tìm kiếm</h5>
                </div>
                <div className="card-body p-4">
                    <form className="row g-3 align-items-center" onSubmit={handleSearchSubmit}>
                        <div className="col-md-3">
                            <label htmlFor="categoryFilter" className="form-label visually-hidden">Category</label>
                            <select
                                id="categoryFilter"
                                className="form-select rounded-md shadow-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id_category} value={cat.id_category}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Giả định input 'Vị trí giảm dần' là cho một trường cụ thể, có thể là 'order' hoặc 'position' */}
                        <div className="col-md-3">
                            <label htmlFor="statusFilter" className="form-label visually-hidden">Status</label>
                            <select
                                id="statusFilter"
                                className="form-select rounded-md shadow-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Dừng hoạt động</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="searchTerm" className="form-label visually-hidden">Search Term</label>
                            <input
                                type="text"
                                id="searchTerm"
                                className="form-control rounded-md shadow-sm"
                                placeholder="Nhập từ khóa tên sản phẩm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className="btn btn-primary w-100 rounded-md shadow-sm">
                                Tìm
                            </button>
                        </div>
                        <div className="col-md-2">
                            <button type="button" className="btn btn-warning w-100 rounded-md shadow-sm">
                                Áp dụng
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Thẻ Bảng danh sách sản phẩm */}
            <div className="card shadow-sm rounded-lg">
                <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-gray-700">Danh sách sản phẩm</h5>
                    <button className="btn btn-danger rounded-md shadow-sm" onClick={handleAddNewProduct}>
                        Thêm sản phẩm mới
                    </button>
                </div>
                <div className="card-body p-4">
                    {loading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="ms-2">Đang tải sản phẩm...</p>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th scope="col" className="py-3 px-4"><input type="checkbox" className="form-check-input" /></th>
                                        <th scope="col" className="py-3 px-4">STT</th>
                                        <th scope="col" className="py-3 px-4">Hình ảnh</th>
                                        <th scope="col" className="py-3 px-4">Tên sản phẩm</th>
                                        <th scope="col" className="py-3 px-4">Giá</th>
                                        <th scope="col" className="py-3 px-4">Giảm giá (%)</th>
                                        <th scope="col" className="py-3 px-4">Nổi bật</th>
                                        <th scope="col" className="py-3 px-4">Danh mục</th>
                                        <th scope="col" className="py-3 px-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product, index) => (
                                            <tr key={product.id_product || index}>
                                                <td className="py-3 px-4"><input type="checkbox" className="form-check-input" /></td>
                                                <td className="py-3 px-4">{index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <img src={`${process.env.REACT_APP_LARAVEL_API_URL}${product.img}`} />
                                                </td>
                                                <td className="py-3 px-4 fw-medium">{product.name}</td>
                                                <td className="py-3 px-4 text-primary">
                                                    {product.price ? parseInt(product.price).toLocaleString('vi-VN') + '₫' : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">{product.discount || 0}%</td>
                                                <td className="py-3 px-4">
                                                    {product.is_featured ? (
                                                        <span className="badge bg-success-subtle text-success">Có</span>
                                                    ) : (
                                                        <span className="badge bg-secondary-subtle text-secondary">Không</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.category ? product.category.name : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button className="btn btn-sm btn-info me-2" onClick={() => navigate(`/admin/editpro/${product.id_product}`)}>
                                                         Sửa
                                                  </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="text-center py-4">Không tìm thấy sản phẩm nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Phân trang và Nút Tạo mới */}
            <div className="d-flex justify-content-between align-items-center mt-4">
                <nav aria-label="Điều hướng trang ví dụ">
                    <ul className="pagination mb-0 rounded-md">
                        <li className="page-item disabled"><a className="page-link" href="#">&laquo;</a></li>
                        <li className="page-item active"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item"><a className="page-link" href="#">&raquo;</a></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default AdminProductList;