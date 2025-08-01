import './index.css';
import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';

// Layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/Adminlayout';

// Client Pages
import HomePage from './pages/client/Home/HomePage';
import ProductFilter from './components/client/product/ProductFilter';
import ProductDetail from './components/client/productdetail/productdetail';
import ProductFlash from './components/client/product/productSale';
import Productnew from './components/client/product/productnew';
import CartPage from './pages/client/cart/CartPage';
import CheckoutPage from './pages/client/bill/CheckoutPage';
import MyOrdersPage from './components/client/bill/bill.jsx';
import DangNhap from './components/client/user/DangNhap.jsx';
import DangKy from './components/client/user/Register.jsx';
// import BrandProductsPage from './components/client/brand/branpage.jsx';
import BillDetailPage from './components/client/bill/BillDetailPage .jsx';
import NewsList from './components/client/news/page.jsx'; 
import NewsDetail from './components/client/news/newsdetail.jsx';
import UserProfile from './components/client/user/UserProfile.jsx';

// ✅ THÊM 2 DÒNG NÀY
import ForgotPassword from './components/client/user/ForgotPassword.jsx';
import ResetPassword from './components/client/user/ResetPassword.jsx';

// Admin Pages
import AdminProductList from './components/Admin/products/viewpro';
import AddProductForm from './components/Admin/products/creatproduct';
import EditProductForm from './components/Admin/products/editproduct';
import CategoryManager from './components/Admin/category/category';
import CategoryAdd from './components/Admin/category/creatcategory';
import EditCategory from './components/Admin/category/editcategory';
import AccountList from './components/Admin/user/AccountList.jsx';
import Dashboard from './components/Admin/TT/Statistic.jsx';
import AdminBillManagementPage from './components/Admin/BillAdmin/xnbill.jsx';
import AdminBillDetailPage from './components/Admin/BillAdmin/AdminBillDetail.jsx';
import ReviewManager from './components/Admin/feedback/FeedbackManager.jsx';
import BrandManagement from './components/Admin/brandAdmin/page.jsx';


// Middleware
import PrivateRouteAdmin from './components/client/user/PrivateRouteAdmin';

function App() {
  return (
    <Routes>
      {/* 👤 Giao diện người dùng */}
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home/products" element={<Productnew />} />
        <Route path="home/products/flash" element={<ProductFlash />} />
        <Route path="/products/brand/:brandId" element={<ProductFilter />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="products" element={<ProductFilter />} />
        <Route path="thanhtoan" element={<CheckoutPage />} />
        <Route path="checkout/:productId" element={<CheckoutPage />} />
        <Route path="my-orders" element={<MyOrdersPage />} />
        <Route path="my-orders/:id_bill" element={<BillDetailPage />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/:id" element={<NewsDetail />} />
        <Route path="/usepf" element={<UserProfile/>} />

        {/* ✅ THÊM 2 ROUTE MỚI */}
        <Route path="quen-mat-khau" element={<ForgotPassword />} />
        <Route path="doi-mat-khau" element={<ResetPassword />} />
      </Route>

      {/* 🛒 Giỏ hàng */}
      <Route path="/giohang" element={<CartPage />} />

      {/* 🔐 Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRouteAdmin>
            <AdminLayout />
          </PrivateRouteAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="viewpro" element={<AdminProductList />} />
        <Route path="addPro" element={<AddProductForm />} />
        <Route path="editpro/:id" element={<EditProductForm />} />
        <Route path="category" element={<CategoryManager />} />
        <Route path="creatcategory" element={<CategoryAdd />} />
        <Route path="editcategory/:id" element={<EditCategory />} />
        <Route path="account" element={<AccountList />} />
        <Route path="bills" element={<AdminBillManagementPage />} />
        <Route path="bills/:id_bill" element={<AdminBillDetailPage  />} />
        <Route path="feedback" element={<ReviewManager />} />
        <Route path="brand" element={<BrandManagement />} />
    
      </Route>

      {/* 🔑 Đăng nhập / Đăng ký */}
      <Route path="/dangnhap" element={<DangNhap />} />
      <Route path="/dangky" element={<DangKy />} />
    </Routes>
  );
}

export default App;
