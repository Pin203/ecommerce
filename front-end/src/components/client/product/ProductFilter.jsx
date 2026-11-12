import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation, useSearchParams, useNavigate } from 'react-router-dom';

const ProductFilter = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho các bộ lọc
    const [priceFilter, setPriceFilter] = useState([]);
    const [sortOrder, setSortOrder] = useState('');
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationLinks, setPaginationLinks] = useState([]);

    // State cho việc đóng/mở các phần lọc trên sidebar
    const [isBrandCollapsed, setIsBrandCollapsed] = useState(true);
    const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(true);

    // Sử dụng hooks để lấy thông tin từ URL
    const { brandId, categoryId } = useParams();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate(); // Khởi tạo hook useNavigate

    // Lấy URL API từ biến môi trường
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    // Tạo state searchTerm riêng, được cập nhật từ URL hoặc từ input
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    // --- Các hàm gọi API ---
    const fetchProducts = async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/products`, {
                params: {
                    name: filters.searchTerm,
                    prices: filters.priceFilter,
                    sort: filters.sortOrder,
                    page: page,
                    brand_id: filters.selectedBrand,
                    id_category: filters.selectedCategory,
                }
            });

            if (response.data && response.data.data) {
                setProducts(response.data.data);
                setLastPage(response.data.last_page);
                setPaginationLinks(response.data.links);
                setError(null);
            } else {
                setProducts([]);
                setLastPage(1);
                setPaginationLinks([]);
                setError("Không có sản phẩm phù hợp.");
            }
        } catch (err) {
            setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
            console.error("Lỗi khi tải sản phẩm:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/brands`);
            if (response.data) {
                setBrands(response.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải thương hiệu:", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/categories`);
            if (response.data) {
                setCategories(response.data);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
        }
    };

    // --- Effects ---
    // Effect để lấy các tham số từ URL và cập nhật state khi URL thay đổi
    useEffect(() => {
        const urlSearchTerm = searchParams.get('name') || '';
        const urlBrandId = brandId || '';
        const urlCategoryId = categoryId || '';

        // Cập nhật các state chính từ URL
        setLocalSearchTerm(urlSearchTerm);
        setSelectedBrand(urlBrandId);
        setSelectedCategory(urlCategoryId);
        setCurrentPage(1); // Luôn đặt lại trang về 1 khi các tham số URL chính thay đổi

        // Gọi API với các filters mới nhất
        fetchProducts(1, {
            searchTerm: urlSearchTerm,
            priceFilter,
            sortOrder,
            selectedBrand: urlBrandId,
            selectedCategory: urlCategoryId
        });
    }, [location.search, brandId, categoryId]); // Phụ thuộc vào thay đổi của URL

    // Effect để fetch sản phẩm khi các bộ lọc khác thay đổi (không phải từ URL)
    useEffect(() => {
        // Chỉ gọi fetchProducts khi các bộ lọc khác thay đổi
        fetchProducts(currentPage, {
            searchTerm: localSearchTerm,
            priceFilter,
            sortOrder,
            selectedBrand,
            selectedCategory
        });
    }, [localSearchTerm, priceFilter, sortOrder, currentPage, selectedBrand, selectedCategory]);

    // Effect để fetch danh sách thương hiệu và danh mục một lần khi component được mount
    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, [LARAVEL_API_URL]);

    // --- Các hàm xử lý sự kiện ---
    const handlePriceFilterChange = (value) => {
        setPriceFilter((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
        setCurrentPage(1);
    };

    const handleBrandFilterChange = (id) => {
        setSelectedBrand(id);
        setCurrentPage(1);
    };

    const handleCategoryFilterChange = (id) => {
        setSelectedCategory(id);
        setCurrentPage(1);
    };

    const handlePageChange = (url) => {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        setCurrentPage(parseInt(page));
    };

    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    const handleBuyNowClick = (productId) => {
        // Điều hướng đến trang thanh toán với ID sản phẩm
        navigate(`/checkout/${productId}`);
    };

    const toggleBrandCollapse = () => {
        setIsBrandCollapsed(prev => !prev);
    };

    const toggleCategoryCollapse = () => {
        setIsCategoryCollapsed(prev => !prev);
    };

    return (
        <div className="container py-5">
            <div className="row">
                {/* --- Sidebar Lọc --- */}
                <div className="col-lg-3 col-md-4">
                    <div className="sidebar mb-4">
                        {/* Phần lọc theo giá */}
                        <div className="sidebar-section-title">Chọn mức giá</div>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="priceUnder1mil"
                                checked={priceFilter.includes("under_1000")}
                                onChange={() => handlePriceFilterChange("under_1000")}
                            />
                            <label className="form-check-label" htmlFor="priceUnder1mil">
                                Dưới 1 triệu
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="price1mil2mil"
                                checked={priceFilter.includes("1000_2000")} // Fixed typo
                                onChange={() => handlePriceFilterChange("1000_2000")}
                            />
                            <label className="form-check-label" htmlFor="price1mil2mil">
                                Từ 1 triệu đến 2 triệu
                            </label>
                        </div>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="price2mil3mil"
                                checked={priceFilter.includes("2000_3000")}
                                onChange={() => handlePriceFilterChange("2000_3000")}
                            />
                            <label className="form-check-label" htmlFor="price2mil3mil">
                                Từ 2 triệu đến 3 triệu
                            </label>
                        </div>
                        <div className="form-check mb-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="priceOver3mil"
                                checked={priceFilter.includes("over_3000")}
                                onChange={() => handlePriceFilterChange("over_3000")}
                            />
                            <label className="form-check-label" htmlFor="priceOver3mil">
                                Trên 3 triệu
                            </label>
                        </div>

                        {/* Phần lọc theo Thương hiệu */}
                        <div
                            className="sidebar-section-title brand-section-header d-flex justify-content-between align-items-center"
                            onClick={toggleBrandCollapse}
                            aria-expanded={!isBrandCollapsed}
                            aria-controls="brandCollapse"
                            style={{ cursor: 'pointer' }}
                        >
                            <span>Hãng Giày</span>
                            <i className={`bi ${isBrandCollapsed ? 'bi-plus' : 'bi-dash'}`}></i>
                        </div>
                        <div className={`collapse ${isBrandCollapsed ? '' : 'show'}`} id="brandCollapse">
                            <div className="list-group">
                                <button
                                    className={`list-group-item list-group-item-action ${selectedBrand === '' ? 'active' : ''}`}
                                    onClick={() => handleBrandFilterChange('')}
                                >
                                    Tất cả
                                </button>
                                {brands.map((brand) => (
                                    <button
                                        key={brand.id_brand}
                                        className={`list-group-item list-group-item-action ${selectedBrand == brand.id_brand ? 'active' : ''}`}
                                        onClick={() => handleBrandFilterChange(brand.id_brand)}
                                    >
                                        {brand.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <hr className="my-4" />

                        {/* Phần lọc theo Danh mục */}
                        <div
                            className="sidebar-section-title category-section-header d-flex justify-content-between align-items-center"
                            onClick={toggleCategoryCollapse}
                            aria-expanded={!isCategoryCollapsed}
                            aria-controls="categoryCollapse"
                            style={{ cursor: 'pointer' }}
                        >
                            <span>Danh Mục</span>
                            <i className={`bi ${isCategoryCollapsed ? 'bi-plus' : 'bi-dash'}`}></i>
                        </div>
                        <div className={`collapse ${isCategoryCollapsed ? '' : 'show'}`} id="categoryCollapse">
                            <div className="list-group">
                                <button
                                    className={`list-group-item list-group-item-action ${selectedCategory === '' ? 'active' : ''}`}
                                    onClick={() => handleCategoryFilterChange('')}
                                >
                                    Tất cả
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id_category}
                                        className={`list-group-item list-group-item-action ${selectedCategory == category.id_category ? 'active' : ''}`}
                                        onClick={() => handleCategoryFilterChange(category.id_category)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Phần hiển thị sản phẩm --- */}
                <div className="col-lg-9 col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>Sản phẩm</h3>
                        <div className="d-flex align-items-center">
                            <div className="input-group me-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={localSearchTerm}
                                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            // Cập nhật URL để đồng bộ với thanh tìm kiếm
                                            const newSearchParams = new URLSearchParams(searchParams);
                                            newSearchParams.set('name', localSearchTerm);
                                            window.history.pushState(null, '', `?${newSearchParams.toString()}`);
                                        }
                                    }}
                                />
                                <button className="btn btn-outline-secondary" onClick={() => {
                                    const newSearchParams = new URLSearchParams(searchParams);
                                    newSearchParams.set('name', localSearchTerm);
                                    window.history.pushState(null, '', `?${newSearchParams.toString()}`);
                                }}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                            <select
                                className="form-select w-auto"
                                value={sortOrder}
                                onChange={handleSortOrderChange}
                            >
                                <option value="">Sắp Xếp</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <p>Đang tải sản phẩm...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <div className="col" key={product.id_product}>
                                            <div className="product-card p-2 border rounded text-center position-relative h-100">
                                                {product.discount > 0 && (
                                                    <span className="discount-badge position-absolute bg-danger text-white px-2 rounded" style={{ top: '5px', left: '5px' }}>
                                                        -{product.discount}%
                                                    </span>
                                                )}
                                                <Link
                                                    to={`/product/${product.id_product}`}
                                                    className="text-decoration-none text-dark"
                                                >
                                                    <img
                                                        src={
                                                            product.img
                                                                ? `${product.img}`
                                                                : 'https://via.placeholder.com/150'
                                                        }
                                                        alt={product.name}
                                                        className="img-fluid mb-2"
                                                        style={{ height: '150px', width: '100%', objectFit: 'contain' }}
                                                    />
                                                    <div className="product-title fw-bold">{product.name}</div>
                                                    <div className="product-price text-primary">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                            parseFloat(product.price) * (1 - product.discount / 100)
                                                        )}
                                                        {product.discount > 0 && (
                                                            <span
                                                                className="original-price"
                                                                style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#999' }}
                                                            >
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND'
                                                                }).format(parseFloat(product.price))}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
                                                <button
                                                    className="btn btn-warning mt-2"
                                                    onClick={() => handleBuyNowClick(product.id_product)}
                                                >
                                                    Mua ngay
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-12 text-center">
                                        <p>Không tìm thấy sản phẩm nào.</p>
                                    </div>
                                )}
                            </div>

                            {/* Điều khiển phân trang */}
                         {lastPage > 1 && (
    <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
            {paginationLinks.map((link, index) => {
                const isEdgeLink = link.label.includes('Previous') || link.label.includes('Next');
                const isCurrentPage = !isEdgeLink && parseInt(link.label) === currentPage;

                // Chỉnh label
                let label = link.label;
                if (label.includes('Previous')) label = '« Trước';
                if (label.includes('Next')) label = 'Sau »';

                return (
                    <li
                        key={index}
                        className={`page-item ${isCurrentPage ? 'active' : ''} ${link.url ? '' : 'disabled'}`}
                    >
                        <button
                            className="page-link"
                            onClick={() => link.url && handlePageChange(link.url)}
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    </li>
                );
            })}
        </ul>
    </nav>
)}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductFilter;