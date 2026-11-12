import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './WishlistPage.css';
import { useCart } from '../../../pages/client/cart/CartContext'; 

const WishlistPage = () => {
    const { fetchCart, cartItems } = useCart(); 
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const LARAVEL_API_URL = process.env.REACT_APP_LARAVEL_API_URL;

    useEffect(() => {
        fetchWishlist();
        fetchCart(); 
    }, []);

    const fetchWishlist = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập!',
                text: 'Bạn cần đăng nhập để xem danh sách yêu thích.',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy',
                customClass: {
                    confirmButton: 'btn btn-primary',
                    cancelButton: 'btn btn-secondary'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dangnhap');
                }
            });
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${LARAVEL_API_URL}/api/wishlist`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setWishlist(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải danh sách yêu thích:", err);
            setError('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) return;

        try {
            await axios.delete(`${LARAVEL_API_URL}/api/wishlist/${productId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
                timer: 1500,
                showConfirmButton: false
            });
            setWishlist(wishlist.filter(item => item.id_product !== productId));
        } catch (err) {
            console.error("Lỗi khi xóa sản phẩm yêu thích:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể xóa sản phẩm. Vui lòng thử lại.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleAddToCart = async (productId) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.token) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập!',
                text: 'Bạn cần đăng nhập để thêm vào giỏ hàng.',
                showCancelButton: true,
                confirmButtonText: 'Đăng nhập ngay',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dangnhap');
                }
            });
            return;
        }

        const productInWishlist = wishlist.find(item => item.id_product === productId);
        
        const productDetails = productInWishlist?.product?.productdetails;
        
        if (!productInWishlist || !productDetails || productDetails.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Sản phẩm này không có chi tiết cụ thể để thêm vào giỏ hàng.',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        const id_productdetail = productDetails[0].id_product_detail;

        const isInCart = cartItems.some(item => item.id_product_detail === id_productdetail);
        if (isInCart) {
            Swal.fire({
                icon: 'info',
                title: 'Sản phẩm đã có trong giỏ hàng!',
                text: 'Sản phẩm này đã được thêm vào giỏ hàng trước đó.',
                timer: 1500,
                showConfirmButton: false
            });
            return;
        }

        try {
            await axios.post(`${LARAVEL_API_URL}/api/cart`, {
                id_user: user.id_user,
                id_productdetail: id_productdetail,
                quantity: 1
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            
            Swal.fire({
                icon: 'success',
                title: 'Đã thêm vào giỏ hàng!',
                text: 'Sản phẩm đã được thêm vào giỏ hàng của bạn.',
                timer: 1500,
                showConfirmButton: false
            });
            
            // GỌI HÀM TỪ CONTEXT để cập nhật giỏ hàng toàn cục
            fetchCart(); 

        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Đang tải danh sách yêu thích...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center p-4 rounded">
                <i className="fa-solid fa-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="wishlist-page container my-5">
            <h1 className="text-center mb-5">Danh Sách Yêu Thích Của Tôi</h1>
            {wishlist.length === 0 ? (
                <div className="empty-wishlist text-center p-5 border rounded shadow-sm">
                    <i className="fa-regular fa-heart fa-5x mb-3 text-muted"></i>
                    <h3>Danh sách yêu thích của bạn đang trống</h3>
                    <p className="text-muted">Hãy thêm các sản phẩm bạn yêu thích để dễ dàng theo dõi.</p>
                    <Link to="/products" className="btn btn-primary mt-3 px-4 py-2">
                        <i className="fa-solid fa-shopping-cart me-2"></i>Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map(item => (
                        <div key={item.id_wishlist} className="wishlist-item card shadow-sm">
                            <Link to={`/product/${item.id_product}`} className="text-decoration-none text-dark">
                                <div className="image-container">
                                    <img 
                                        src={item.product?.img || 'https://via.placeholder.com/200'} 
                                        alt={item.product?.name} 
                                        className="card-img-top" 
                                    />
                                </div>
                            </Link>
                            <div className="card-body">
                                <h5 className="card-title">{item.product?.name}</h5>
                                <p className="card-text price">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.product?.price || 0)}
                                </p>
                                <div className="d-flex gap-2">
                                    <button 
                                        onClick={() => handleAddToCart(item.id_product)} 
                                        className="btn btn-outline-primary btn-sm flex-grow-1"
                                        disabled={cartItems.some(cartItem => cartItem.id_product_detail === item.product?.productdetails[0]?.id_product_detail)}
                                    >
                                        <i className="fa-solid fa-cart-plus me-2"></i>
                                        {cartItems.some(cartItem => cartItem.id_product_detail === item.product?.productdetails[0]?.id_product_detail) ? 'Đã trong giỏ' : 'Thêm vào giỏ'}
                                    </button>
                                    <button 
                                        onClick={() => handleRemoveFromWishlist(item.id_product)} 
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <i className="fa-solid fa-trash-can me-2"></i>Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;