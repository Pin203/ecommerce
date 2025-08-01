import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useLocation} from 'react-router-dom';

const ProductFilter = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState([]);
    const [sortOrder, setSortOrder] = useState('');
    // State mới cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [paginationLinks, setPaginationLinks] = useState([]);

    // State mới cho Thương hiệu và Danh mục
    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(''); // Lưu id_brand được chọn
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(''); // Lưu id_category được chọn

    // State cho việc đóng/mở các phần lọc
    const [isBrandCollapsed, setIsBrandCollapsed] = useState(true);
    const [isCategoryCollapsed, setIsCategoryCollapsed] = useState(true); // State mới cho phần danh mục
    const { brandId, categoryId } = useParams(); // Hook để lấy param từ URL
    const location = useLocation(); // Hook để lấy thông tin về URL hiện tại
    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    // --- Các hàm gọi API ---
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/products`, {
                params: {
                    name: searchTerm,
                    prices: priceFilter,
                    sort: sortOrder,
                    page: currentPage,
                    brand_id: selectedBrand,    // Thêm ID thương hiệu được chọn
                    id_category: selectedCategory, // Thêm ID danh mục được chọn
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

    // --- Các hàm xử lý sự kiện ---
    const handlePriceFilterChange = (value) => {
        setPriceFilter((prev) =>
            prev.includes(value)
                ? prev.filter((v) => v !== value)
                : [...prev, value]
        );
        setCurrentPage(1); // Đặt lại trang về 1 khi các bộ lọc thay đổi
    };

    const handleBrandFilterChange = (brandId) => {
        setSelectedBrand(brandId);
        setCurrentPage(1); // Đặt lại trang về 1 khi bộ lọc thương hiệu thay đổi
    };

    const handleCategoryFilterChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1); // Đặt lại trang về 1 khi bộ lọc danh mục thay đổi
    };

    const handlePageChange = (url) => {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        setCurrentPage(parseInt(page));
    };

    const toggleBrandCollapse = () => {
        setIsBrandCollapsed(prev => !prev);
    };

    const toggleCategoryCollapse = () => { // Hàm toggle mới cho danh mục
        setIsCategoryCollapsed(prev => !prev);
    };

    // --- Effects ---
    // Effect để fetch sản phẩm khi các bộ lọc thay đổi
     useEffect(() => {
        // Ưu tiên brandId nếu có, sau đó đến categoryId
        if (brandId) {
            setSelectedBrand(brandId);
            setSelectedCategory(''); // Đảm bảo reset category khi lọc bằng brandId từ URL
        } else if (categoryId) {
            setSelectedCategory(categoryId);
            setSelectedBrand(''); // Đảm bảo reset brand khi lọc bằng categoryId từ URL
        } else {
            // Nếu không có cả brandId và categoryId trên URL, reset cả hai
            setSelectedBrand('');
            setSelectedCategory('');
        }
        setCurrentPage(1); // Luôn đặt lại về trang 1 khi URL params thay đổi
    }, [brandId, categoryId, location.pathname]); // Chạy lại khi brandId, categoryId hoặc đường dẫn thay đổi

    // Effect để fetch sản phẩm khi các bộ lọc thay đổi (bao gồm cả selectedBrand/Category)
    useEffect(() => {
        fetchProducts();
    }, [searchTerm, priceFilter, sortOrder, currentPage, selectedBrand, selectedCategory, LARAVEL_API_URL]);
 // Thêm các bộ lọc mới vào dependency array

    // Effect để fetch danh sách thương hiệu và danh mục một lần khi component được mount
    useEffect(() => {
        fetchBrands();
        fetchCategories();
    }, [LARAVEL_API_URL]);

    return (
        <div className="container py-5">
            <div className="row">
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
                                checked={priceFilter.includes("1000_2000")}
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

                        {/* Phần lọc theo Thương hiệu với tính năng đóng/mở */}
                        <div
                            className="sidebar-section-title brand-section-header d-flex justify-content-between align-items-center"
                            onClick={toggleBrandCollapse}
                            aria-expanded={!isBrandCollapsed}
                            aria-controls="brandCollapse"
                            style={{ cursor: 'pointer' }} // Thêm con trỏ để dễ nhận biết có thể click
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
                                        className={`list-group-item list-group-item-action ${selectedBrand === brand.id_brand ? 'active' : ''}`}
                                        onClick={() => handleBrandFilterChange(brand.id_brand)}
                                    >
                                        {brand.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <hr className="my-4" /> {/* Đường phân cách */}

                        {/* Phần lọc theo Danh mục với tính năng đóng/mở */}
                        <div
                            className="sidebar-section-title category-section-header d-flex justify-content-between align-items-center"
                            onClick={toggleCategoryCollapse}
                            aria-expanded={!isCategoryCollapsed}
                            aria-controls="categoryCollapse"
                            style={{ cursor: 'pointer' }} // Thêm con trỏ để dễ nhận biết có thể click
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
                                        className={`list-group-item list-group-item-action ${selectedCategory === category.id_category ? 'active' : ''}`}
                                        onClick={() => handleCategoryFilterChange(category.id_category)}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-9 col-md-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3>Sản phẩm</h3>
                        <div className="d-flex align-items-center">
                            <div className="input-group me-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1); // Đặt lại trang về 1 khi tìm kiếm
                                    }}
                                />
                                <button className="btn btn-outline-secondary" onClick={fetchProducts}>
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                            <select
                                className="form-select w-auto"
                                value={sortOrder}
                                onChange={(e) => {
                                    setSortOrder(e.target.value);
                                    setCurrentPage(1); // Đặt lại trang về 1 khi sắp xếp
                                }}
                            >
                                <option value="">Sắp Xếp</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                {/* <option value="date_desc">Mới nhất</option>
                                <option value="date_asc">Cũ nhất</option> */}
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
                                            <Link
                                                to={`/product/${product.id_product}`}
                                                className="text-decoration-none text-dark"
                                            >
                                                <div className="product-card p-2 border rounded text-center position-relative h-100">
                                                    {product.discount > 0 && (
                                                        <span className="discount-badge position-absolute bg-danger text-white px-2 rounded" style={{ top: '5px', left: '5px' }}>
                                                            -{product.discount}%
                                                        </span>
                                                    )}
                                                    <img
                                                        src={
                                                            // Đảm bảo đường dẫn ảnh đúng định dạng, thêm '/' nếu cần
                                                            product.img
                                                                ? `${LARAVEL_API_URL}${product.img.startsWith('/') ? '' : '/'}${product.img}`
                                                                : 'https://via.placeholder.com/150'
                                                        }
                                                        alt={product.name}
                                                        className="img-fluid mb-2"
                                                        style={{ height: '150px',width:'100%', objectFit: 'contain' }} // Chỉnh objectFit thành 'contain' để ảnh hiển thị tốt hơn
                                                    />
                                                    <div className="product-title fw-bold">{product.name}</div>
                                                    <div className="product-price text-primary">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(product.price))}
                                                    </div>
                                                </div>
                                            </Link>
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

                                            return (
                                                <li
                                                    key={index}
                                                    className={`page-item ${isCurrentPage ? 'active' : ''} ${link.url ? '' : 'disabled'}`}
                                                >
                                                    <button
                                                        className="page-link"
                                                        onClick={() => link.url && handlePageChange(link.url)}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
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