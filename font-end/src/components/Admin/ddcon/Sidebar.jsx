import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faClipboardList, faBox, faTags, faUsers, faNewspaper,
  faGift, faShoppingCart, faCog, faChevronDown, faChevronUp,
  faStar, faSignOutAlt, faCommentDots, faBars
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // CSS thêm ở phần dưới

const Sidebar = () => {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
  const [isArticlesOpen, setIsArticlesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile toggle

  const toggleProducts = () => setIsProductsOpen(!isProductsOpen);
  const toggleCustomers = () => setIsCustomersOpen(!isCustomersOpen);
  const toggleArticles = () => setIsArticlesOpen(!isArticlesOpen);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      {/* Nút mở sidebar trên mobile */}
   {!isSidebarOpen && (
  <button className="btn btn-dark d-md-none mobile-toggle" onClick={toggleSidebar}>
    <FontAwesomeIcon icon={faBars} />
  </button>
)}
      {/* Sidebar */}
      <div className={`sidebar-custom bg-dark text-white ${isSidebarOpen ? 'open' : ''}`}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Trang quản trị
          </h5>
          <button className="btn btn-sm btn-secondary d-md-none" onClick={toggleSidebar}>X</button>
        </div>
        <ul className="nav flex-column p-2">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin">
              <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Tổng quan
            </Link>
          </li>
          {/* Sản phẩm */}
          <li className="nav-item">
            <button className="nav-link text-white d-flex justify-content-between align-items-center"
              onClick={toggleProducts}>
              <span><FontAwesomeIcon icon={faBox} className="me-2" /> Sản phẩm</span>
              <FontAwesomeIcon icon={isProductsOpen ? faChevronUp : faChevronDown} />
            </button>
            {isProductsOpen && (
              <ul className="nav flex-column ms-3">
                <li><Link className="nav-link text-white" to="/admin/category">Danh mục sản phẩm</Link></li>
                <li><Link className="nav-link text-white" to="/admin/viewpro">Danh sách sản phẩm</Link></li>
              </ul>
            )}
          </li>

          {/* Các mục khác tương tự */}
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/brand">
              <FontAwesomeIcon icon={faTags} className="me-2" /> Thương hiệu
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/account">
              <FontAwesomeIcon icon={faUsers} className="me-2" /> Tài khoản
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/promotions">
              <FontAwesomeIcon icon={faGift} className="me-2" /> Mã khuyến mãi
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/bills">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" /> Đơn hàng
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/feedback">
              <FontAwesomeIcon icon={faStar} className="me-2" /> Đánh giá
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin/cmt">
              <FontAwesomeIcon icon={faCommentDots} className="me-2" /> Bình luận
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/logout">
              <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Đăng xuất
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
