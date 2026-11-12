import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminProductList = () => {
    // Khởi tạo các state cho sản phẩm, danh mục, trạng thái tải và lỗi
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
const [lastPage, setLastPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const itemsPerPage = 10;
    // Khởi tạo useNavigate
    const navigate = useNavigate();

    // Các state cho bộ lọc và tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    // Hàm để lấy dữ liệu sản phẩm từ backend
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/product`, {
                params: {
                    name: searchTerm,
                    id_category: selectedCategory,
                    status: statusFilter,
                     page: currentPage, // Gửi số trang hiện tại lên backend
                per_page: itemsPerPage, // Tùy chọn, nếu backend hỗ trợ
                }
            });
            setProducts(response.data.data); // Backend dùng paginate() sẽ trả về dữ liệu trong trường `data`
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setTotalItems(response.data.total);
        } catch (err) {
            setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
            console.error("Lỗi khi lấy sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    // Hàm để lấy dữ liệu danh mục cho dropdown bộ lọc
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/admin/category`);
            setCategories(response.data);
        } catch (err) {
            console.error("Lỗi khi lấy danh mục:", err);
        }
    };

    // useEffect để lấy dữ liệu khi component được mount và khi các tham số lọc/tìm kiếm thay đổi
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [searchTerm, selectedCategory, statusFilter, LARAVEL_API_URL,  currentPage]);

    // Hàm xử lý khi nhấn nút Thêm sản phẩm mới
    const handleAddNewProduct = () => {
        navigate('/admin/addPro');
    };

    // Hàm xử lý khi gửi form tìm kiếm
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProducts();
    };
    const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= lastPage) {
        setCurrentPage(pageNumber);
    }
};

    return (
        <div className="main-content flex-grow-1 p-4">
            <div className="header-bar d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0 text-gray-800">Danh sách sản phẩm</h4>
                <div className="d-flex align-items-center">
                    <span className="badge bg-danger rounded-pill me-2">1</span>
                    <button className="btn btn-outline-secondary btn-sm rounded-md shadow-sm">
                        <i className="bi bi-bell"></i>
                    </button>
                </div>
            </div>

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
                        <div className="col-md-3">
                            <label htmlFor="statusFilter" className="form-label visually-hidden">Status</label>
                            <select
                                id="statusFilter"
                                className="form-select rounded-md shadow-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="0">Hiển thị</option>
                                <option value="1">Ẩn</option>
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
                        {/* <div className="col-md-1">
                            <button type="submit" className="btn btn-primary w-100 rounded-md shadow-sm">
                                Tìm
                            </button>
                        </div> */}
                        <div className="col-md-2">
                            <button type="button" className="btn btn-warning w-100 rounded-md shadow-sm" onClick={() => { setSearchTerm(''); setSelectedCategory(''); setStatusFilter(''); }}>
                                Đặt lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>

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
                                        <th scope="col" className="py-3 px-4">STT</th>
                                        <th scope="col" className="py-3 px-4">Hình ảnh</th>
                                        <th scope="col" className="py-3 px-4">Tên sản phẩm</th>
                                        <th scope="col" className="py-3 px-4">Giá</th>
                                        <th scope="col" className="py-3 px-4">Giảm giá (%)</th>
                                        <th scope="col" className="py-3 px-4">Số Lượng</th>
                                        <th scope="col" className="py-3 px-4">Nổi bật</th>
                                        <th scope="col" className="py-3 px-4">Danh mục</th>
                                        <th scope="col" className="py-3 px-4">Trạng thái</th>
                                        <th scope="col" className="py-3 px-4">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length > 0 ? (
                                        products.map((product, index) => (
                                            
                                            <tr key={product.id_product || index}>
                                                <td className="py-3 px-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="py-3 px-4">
                                                    <img src={product.img} alt={`Hình ảnh của ${product.name}`} style={{ width: '80px', height: 'auto', borderRadius: '5px' }} />
                                                </td>
                                                <td className="py-3 px-4 fw-medium">{product.name}</td>
                                                <td className="py-3 px-4 text-primary">
                                                    {product.price ? parseInt(product.price).toLocaleString('vi-VN') + '₫' : 'N/A'}
                                                </td>
                                                <td className="py-3 px-4">{product.discount || 0}%</td>
                                                <td className="py-3 px-4">
                                                    {product.product_details && product.product_details.length > 0
                                                        ? product.product_details[0].sl : 'N/A'}
                                                </td>
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
                                                    {product.status === 0 ? (
                                                        <span className="badge bg-success">Hiển thị</span>
                                                    ) : (
                                                        <span className="badge bg-danger">Ẩn</span>
                                                    )}
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
                                            <td colSpan="10" className="text-center py-4">Không tìm thấy sản phẩm nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
    <nav aria-label="Điều hướng trang ví dụ">
        <ul className="pagination mb-0 rounded-md">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <a className="page-link" href="#" onClick={() => handlePageChange(currentPage - 1)}>&laquo;</a>
            </li>
            
            {/* Tạo các nút trang động */}
            {Array.from({ length: lastPage }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                    <a className="page-link" href="#" onClick={() => handlePageChange(page)}>{page}</a>
                </li>
            ))}
            
            <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
                <a className="page-link" href="#" onClick={() => handlePageChange(currentPage + 1)}>&raquo;</a>
            </li>
        </ul>
    </nav>
    <p className="mb-0 text-gray-600">
        Hiển thị {products.length} trên tổng số {totalItems} sản phẩm
    </p>
</div>
        </div>
    );
};

export default AdminProductList;