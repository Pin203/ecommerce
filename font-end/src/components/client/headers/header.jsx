import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import MiniCartPopup from '../../../pages/client/cart/MiniCart';
import debounce from 'lodash.debounce';

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const { cartQuantity, clearCart } = useCart();

    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState({ products: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [totalResults, setTotalResults] = useState(0);


    // Trạng thái mới cho thương hiệu
    const [brands, setBrands] = useState([]);
    const [isBrandsDropdownOpen, setIsBrandsDropdownOpen] = useState(false);
    const brandsDropdownTimeoutRef = useRef(null); // Ref để lưu timeout cho dropdown thương hiệu
    const searchInputRef = useRef(null);
    const miniCartTimeoutRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                setUser(null);
            }
        }

        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            if (updatedUser) {
                try {
                    setUser(JSON.parse(updatedUser));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        // Lấy thương hiệu khi component được mount
        const fetchBrands = async () => {
            try {
                // Sử dụng tuyến API công khai cho thương hiệu
                const response = await fetch(`${process.env.REACT_APP_LARAVEL_API_URL}/api/brands`);
                if (!response.ok) {
                    throw new Error('Lỗi mạng khi lấy thương hiệu');
                }
                const data = await response.json();
                setBrands(data);
            } catch (error) {
                console.error('Lỗi khi lấy thương hiệu:', error);
            }
        };

        fetchBrands(); // Gọi hàm lấy dữ liệu

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('mousedown', handleClickOutside);
            if (miniCartTimeoutRef.current) {
                clearTimeout(miniCartTimeoutRef.current);
            }
        };
    }, []);

    const handleLogout = () => {
        console.log("Đang thực hiện đăng xuất...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        clearCart();
        navigate('/');
    };

    const handleMouseEnterCart = () => {
        if (miniCartTimeoutRef.current) {
            clearTimeout(miniCartTimeoutRef.current);
        }
        setIsMiniCartOpen(true);
    };

    const handleMouseLeaveCart = () => {
        miniCartTimeoutRef.current = setTimeout(() => {
            setIsMiniCartOpen(false);
        }, 200);
    };

    const handleCloseMiniCart = () => {
        if (miniCartTimeoutRef.current) {
            clearTimeout(miniCartTimeoutRef.current);
        }
        setIsMiniCartOpen(false);
    };
    // Hàm xử lý hover cho dropdown Thương hiệu
    const handleMouseEnterBrands = () => {
        if (brandsDropdownTimeoutRef.current) {
            clearTimeout(brandsDropdownTimeoutRef.current);
        }
        setIsBrandsDropdownOpen(true);
    };

    const handleMouseLeaveBrands = () => {
        brandsDropdownTimeoutRef.current = setTimeout(() => {
            setIsBrandsDropdownOpen(false);
        }, 200); // Độ trễ 200ms trước khi đóng
    }

    const fetchSearchSuggestions = useRef(
        debounce(async (query) => {
            if (query.length < 2) {
                setSearchResults({ products: [] });
                setTotalResults(0);
                setShowSuggestions(false);
                return;
            }
            try {
                const response = await fetch(`${process.env.REACT_APP_LARAVEL_API_URL}/api/search-suggestions?query=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Lỗi mạng');
                }
                const data = await response.json();
                setSearchResults(data);
                const total = data.products.length;
                setTotalResults(total);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
                setSearchResults({ products: [] });
                setTotalResults(0);
                setShowSuggestions(false);
            }
        }, 300)
    ).current;

    const handleSearchInputChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        fetchSearchSuggestions(value);
    };

    const handleSearchSubmit = () => {
        if (searchTerm.trim()) {
            navigate(`/products?name=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
            setSearchResults({ products: [] });
            setTotalResults(0);
            setShowSuggestions(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleSuggestionClick = (path) => {
        navigate(path);
        setSearchTerm('');
        setSearchResults({ products: [] });
        setTotalResults(0);
        setShowSuggestions(false);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg top-navbar py-2">
                <div className="container">
                    <Link className="navbar-brand d-flex align-items-center" to="/">
                        {/* Nếu có logo, thêm vào đây */}
                        <img src="" alt="" className="me-2" style={{ height: '35px' }} />
                    </Link>

                    <div className="d-flex align-items-center ms-4 me-5">
                        <i className="fa-solid fa-location-dot store-icon me-1"></i>
                        <Link className="nav-link store-link" to="#">HỆ THỐNG CỬA HÀNG</Link>
                    </div>

                    <div className="input-group search-bar flex-grow-1 mx-4 position-relative" ref={searchInputRef}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm sản phẩm..."
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            onKeyPress={handleKeyPress}
                            onFocus={() => {
                                if (searchTerm.length > 1 && searchResults.products.length > 0) {
                                    setShowSuggestions(true);
                                } else if (searchTerm.length > 1 && totalResults === 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                        />
                        <button className="btn btn-search" type="button" onClick={handleSearchSubmit}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>

                        {/* Popup gợi ý tìm kiếm */}
                        {showSuggestions && searchTerm.length > 1 && (
                            <div className="search-suggestions-popup">
                                {totalResults === 0 ? (
                                    <div className="no-results">Không tìm thấy kết quả nào.</div>
                                ) : (
                                    <>
                                        {searchResults.products.length > 0 && (
                                            <>
                                                {searchResults.products.map((product) => (
                                                    <div key={product.id} className="suggestion-item suggestion-product" onClick={() => handleSuggestionClick(`/product/${product.id}`)}>
                                                        {product.img && <img src={product.img} alt={product.name} className="suggestion-product-img" />}
                                                        <div className="suggestion-product-info">
                                                            <div className="suggestion-product-name">{product.name}</div>
                                                            <div className="suggestion-product-prices">
                                                                {product.discount > 0 && (
                                                                    <span className="original-price">
                                                                        {product.price.toLocaleString('vi-VN')}VND
                                                                    </span>
                                                                )}
                                                                <span className="final-price">
                                                                    {product.final_price.toLocaleString('vi-VN')}VND
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        <Link to={`/products?name=${encodeURIComponent(searchTerm.trim())}`} className="view-more-results" onClick={() => setShowSuggestions(false)}>
                                            XEM THÊM KẾT QUẢ TÌM KIẾM ({totalResults})
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <ul className="navbar-nav right-icons d-flex flex-row ms-auto">
                        <li className="nav-item text-center mx-2 position-relative account-hover">
                            <div className="nav-link d-flex flex-column align-items-center" style={{ cursor: 'pointer' }}>
                                <div className="icon-circle d-flex justify-content-center align-items-center">
                                    <i className="fa-solid fa-user fa-lg"></i>
                                </div>
                                <small>{user ? user.name || user.username : 'TÀI KHOẢN'}</small>
                            </div>
                            <div className="account-dropdown">
                                {user ? (
                                    <>
                                        <Link to="/usepf" className="dropdown-item">Thông tin cá nhân</Link>
                                        <button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/dangnhap" className="dropdown-item">Đăng nhập</Link>
                                        <Link to="/dangky" className="dropdown-item">Đăng ký</Link>
                                    </>
                                )}
                            </div>
                        </li>

                        <li className="nav-item text-center mx-2">
                            <Link className="nav-link d-flex flex-column align-items-center" to="/my-orders">
                                <div className="icon-circle d-flex justify-content-center align-items-center">
                                    <i className="fa-solid fa-receipt fa-lg"></i>
                                </div>
                                <small>ĐƠN HÀNG</small>
                            </Link>
                        </li>

                        <li className="nav-item text-center mx-2">
                            <Link className="nav-link d-flex flex-column align-items-center" to="#">
                                <div className="icon-circle d-flex justify-content-center align-items-center">
                                    <i className="fa-regular fa-heart fa-lg"></i>
                                </div>
                                <small>YÊU THÍCH</small>
                            </Link>
                        </li>

                        <li
                            className="nav-item text-center mx-2 position-relative"
                            onMouseEnter={handleMouseEnterCart}
                            onMouseLeave={handleMouseLeaveCart}
                        >
                            <Link className="nav-link d-flex flex-column align-items-center" to="/giohang">
                                <div className="icon-circle d-flex justify-content-center align-items-center position-relative">
                                    <i className="fa-solid fa-cart-shopping fa-lg"></i>
                                    {cartQuantity > 0 && (
                                        <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {cartQuantity}
                                        </span>
                                    )}
                                </div>
                                <small>GIỎ HÀNG</small>
                            </Link>
                            <MiniCartPopup
                                isOpen={isMiniCartOpen}
                                onClose={handleCloseMiniCart}
                            />
                        </li>
                    </ul>
                </div>
            </nav>

            <nav className="navbar navbar-expand-lg main-nav">
                <div className="container">

                    {/* Nút toggle mobile */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item"><Link className="nav-link active" to="/">TRANG CHỦ</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="#">GIỚI THIỆU</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/products">SẢN PHẨM</Link></li>

                            <li className={`nav-item dropdown ${isBrandsDropdownOpen ? 'show' : ''}`}
                                onMouseEnter={handleMouseEnterBrands}
                                onMouseLeave={handleMouseLeaveBrands}>
                                <Link className="nav-link dropdown-toggle" to="#" id="navbarDropdownBrands" role="button" aria-expanded={isBrandsDropdownOpen}>
                                    THƯƠNG HIỆU
                                </Link>
                                <ul className={`dropdown-menu ${isBrandsDropdownOpen ? 'show' : ''}`} aria-labelledby="navbarDropdownBrands">
                                    {brands.map((brand) => (
                                        <li key={brand.id_brand}>
                                            <Link className="dropdown-item" to={`/products/brand/${brand.id_brand}`}>{brand.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>

                            <li className="nav-item"><Link className="nav-link" to="#">HƯỚNG DẪN</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="/news">TIN TỨC</Link></li>
                            <li className="nav-item"><Link className="nav-link" to="#">LIÊN HỆ</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

        </>
    );
};

export default Header;