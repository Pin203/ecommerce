<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    Admin\BillManagementController,
    Admin\BrandController,
    Admin\CategoryController,
    Admin\ColorController,
    Admin\DashboardController,
    Admin\SanPhamController,
    Admin\SizeController,
    Admin\ThongKeController,
    Admin\UserController,
    AuthController,
    BillController,
    BillDetailController,
    CartController,
    CommentController,
    FeedbackController,
    HomeController,
    NewsController,
    ProductController,
    ProductDetailController,
    ZaloPayController,
   
    UserProfileController,
    Auth\PasswordOtpController,
    Auth\GoogleController,
};



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 🔐 Auth
Route::post('/dangky', [AuthController::class, 'dangKy']);
Route::post('/dangnhap', [AuthController::class, 'dangNhap']);

// 🌐 Public Sản phẩm
Route::get('/home/products', [HomeController::class, 'trangchu']);
Route::get('/products', [ProductController::class, 'sanpham']);
Route::get('/productdetail/{id}', [ProductDetailController::class, 'trangchitiet']);
Route::get('/product/{id}', [ProductDetailController::class, 'trangchitietTheoProductId']);
Route::get('/product/brand/{brandId}', [ProductController::class, 'getRelatedProductsByBrand']);
Route::get('/brands', [ProductController::class, 'getAllBrands']);
Route::get('/categories', [ProductController::class, 'getAllCategories']);
Route::get('/search-suggestions', [ProductController::class, 'searchSuggestions']);

// 🛒 Cart (không yêu cầu đăng nhập)
Route::post('/cart', [CartController::class, 'store']);
Route::get('/cart/{id_user}', [CartController::class, 'index']);
Route::put('/cart/{id_cart}', [CartController::class, 'update']);
Route::delete('/cart/{id_cart}', [CartController::class, 'destroy']);
Route::delete('/cart/clear/{id_user}', [CartController::class, 'clear']);
Route::post('/cart/sync', [CartController::class, 'sync']);

// 💳 ZaloPay
Route::post('/zalopay/create-payment', [ZaloPayController::class, 'createPayment']);
Route::post('/zalopay/callback', [ZaloPayController::class, 'ZaloPaySuccess']);
Route::post('/zalopay/cancel', [ZaloPayController::class, 'ZaloPayCancel']);
// ⭐ Feedback
Route::prefix('feedback')->group(function () {
    Route::get('/', [FeedbackController::class, 'index']);
    Route::post('/', [FeedbackController::class, 'store']);
    Route::put('/{id}', [FeedbackController::class, 'update']);
    Route::delete('/{id}', [FeedbackController::class, 'destroy']);
    Route::post('/{id}/reply', [FeedbackController::class, 'reply']);
    Route::post('/{id}/media', [FeedbackController::class, 'uploadMedia']);
    Route::post('/{id}/approve', [FeedbackController::class, 'approve']);
    Route::post('/{id}/hide', [FeedbackController::class, 'hide']);
    Route::get('/average/{id_productdetail}', [FeedbackController::class, 'average']);
    Route::get('/filter/{id_productdetail}', [FeedbackController::class, 'filterByStar']);
    Route::get('/feedback/check', [FeedbackController::class, 'checkFeedback']);


    Route::get('/{id_productdetail}', [FeedbackController::class, 'feedback']);
});
// 👤 User Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::get('/profile', [UserProfileController::class, 'show']); 
    Route::put('/profile', [UserProfileController::class, 'update']); 
    Route::prefix('bill')->group(function () {
        Route::post('/checkout', [BillController::class, 'processPayment']);
        Route::post('/checkout-zalopay', [BillController::class, 'processZaloPayment']);
        Route::get('/my-orders', [BillController::class, 'getUserBills']);
        Route::get('/my-orders/{id_bill}', [BillController::class, 'getUserBillById']);
        Route::post('/{bill}/cancel', [BillController::class, 'cancelOrder']);
    });
});

// 🧾 Bill Detail (cho mọi người xem - nếu cần bảo vệ thêm thì cho vào middleware)
Route::get('/billdetail/bill/{id_bill}', [BillDetailController::class, 'getByBill']);
//cmt
Route::prefix('comments')->group(function () {
    Route::get('/{productId}', [CommentController::class, 'index']);
    Route::post('/', [CommentController::class, 'store']); // Sửa từ /comments thành /
    Route::put('/{id}', [CommentController::class, 'update']);
    Route::delete('/{id}', [CommentController::class, 'destroy']);
});
//tin tức news
Route::prefix('news')->group(function () {
    Route::get('/', [NewsController::class, 'index']);
    Route::get('/{id}', [NewsController::class, 'show']);
    Route::post('/', [NewsController::class, 'store']);
    Route::put('/{id}', [NewsController::class, 'update']);
    // Route::delete('/{id}', [NewsController::class, 'destroy']);
});
// Gửi Email Quên Mật Khẩu
Route::post('/forgot-password-otp', [PasswordOtpController::class, 'sendOtp']);
Route::post('/verify-password-otp', [PasswordOtpController::class, 'verifyOtp']);
//dang nhap gg
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);
// 🔒 Admin Routes (yêu cầu là admin)
Route::middleware([])->prefix('admin')->group(function () {

    //cmt 
    Route::get('/', [CommentController::class, 'all']);         // Lấy tất cả bình luận
    Route::delete('/{id}', [CommentController::class, 'destroy']);     // Xóa bình luận
    Route::put('/{id}', [CommentController::class, 'update']);         // Sửa bình luận
    // Dashboard
    Route::get('/dashboard/counts', [DashboardController::class, 'getCounts']);
    Route::get('/thongke/doanhthu', [ThongKeController::class, 'doanhThuTheoThang']);
    // Category
    Route::get('/category', [CategoryController::class, 'index']);
    Route::post('/category', [CategoryController::class, 'store']);
    Route::get('/category/{id}', [CategoryController::class, 'show']);
    Route::put('/category/{id}', [CategoryController::class, 'update']);
    Route::delete('/category/{id}', [CategoryController::class, 'destroy']);

    // Brand
    Route::get('/brand', [BrandController::class, 'index']);
    Route::post('/brand', [BrandController::class, 'store']);
    Route::put('/brand/{id}', [BrandController::class, 'update']);
    Route::delete('/brand/{id}', [BrandController::class, 'destroy']);

    // Product
    Route::get('/product', [SanPhamController::class, 'index']);
    Route::post('/product', [SanPhamController::class, 'store']);
    Route::post('/productdetails', [SanPhamController::class, 'storeWithDetails']);
    Route::get('/product/{id}', [SanPhamController::class, 'show']);
    Route::put('/product/{id}', [SanPhamController::class, 'update']);
    Route::delete('/product/{id}', [SanPhamController::class, 'destroy']);

    // User
    Route::get('/user', [UserController::class, 'index']);
    Route::post('/user', [UserController::class, 'store']);
    Route::put('/user/{id}', [UserController::class, 'update']);
    Route::delete('/user/{id}', [UserController::class, 'destroy']);
    Route::put('/user/{id}/toggle-block', [UserController::class, 'toggleBlock']);

    // Size & Color
    Route::get('/size', [SizeController::class, 'index']);
    Route::get('/color', [ColorController::class, 'index']);

    // Bills
    Route::prefix('bills')->group(function () {
        Route::get('/', [BillManagementController::class, 'index']);
        Route::get('/{bill}', [BillManagementController::class, 'show']);
        Route::post('/{bill}/confirm', [BillManagementController::class, 'confirmOrder']);
        Route::post('/{bill}/cancel', [BillManagementController::class, 'cancelOrder']);
        Route::get('/pending', [BillManagementController::class, 'index'])->name('admin.bills.pending');
        Route::post('/{bill}/ship', [BillManagementController::class, 'markAsShipped']);      // Thêm route này
        Route::post('/{bill}/deliver', [BillManagementController::class, 'markAsDelivered']); // Thêm route nà
    });

    // Optional: Get all brands/categories
    Route::get('/brands', [ProductController::class, 'getAllBrands']);
    Route::get('/categories', [ProductController::class, 'getAllCategories']);
});
