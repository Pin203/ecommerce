<?php

use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\BillManagementController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\SanPhamController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\Admin\ThongKeController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VoucherController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\PasswordOtpController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\BillDetailController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\VNPayController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ZaloPayController;
use App\Http\Controllers\VoucherController as ApiVoucherController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// 🔐 Auth
Route::post('/dangky', [AuthController::class, 'dangKy']);
Route::post('/dangnhap', [AuthController::class, 'dangNhap']);

// 🌐 Public Sản phẩm
Route::get('/home/products', [HomeController::class, 'trangchu'])->middleware('throttle:60,1');

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

Route::delete('/cart/clear/{id_user}', [CartController::class, 'clearUserCart']);
Route::post('/cart/{id_cart}/check-stock', [CartController::class, 'checkStock']);
Route::get('/cart/user-info/{id_user}', [CartController::class, 'getUserInfo']);
Route::post('/cart/update-quantity/{id_cart}', [CartController::class, 'updateQuantity']);
Route::post('/cart/sync', [CartController::class, 'sync']);
Route::get('/cart/user/{id_user}', [CartController::class, 'getCart']);
Route::get('/products/{id_product}/sizes', [CartController::class, 'getSizes']);
Route::get('/products/{id_product}/colors', [CartController::class, 'getColors']);


// 💳 ZaloPay
Route::post('/zalopay/create-payment', [ZaloPayController::class, 'createPayment']);
Route::post('/zalopay/callback', [ZaloPayController::class, 'ZaloPaySuccess']);
Route::post('/zalopay/cancel', [ZaloPayController::class, 'ZaloPayCancel']);
Route::post('/zalopay/mock-success/{billId}', [ZaloPayController::class, 'mockZaloPaySuccess'])
    ->middleware('auth:sanctum');

Route::post('/vnpay/create-payment', [VNPayController::class, 'createPayment']);

// Callback IPN của VNPay (server to server)
Route::post('/vnpay/ipn', [VNPayController::class, 'handleVnpayIpn']);

// Redirect sau khi khách hàng thanh toán xong
Route::get('/vnpay/return', [VNPayController::class, 'handleVnpayReturn']);

// Hủy đơn hàng trước khi thanh toán
Route::post('/vnpay/cancel', [VNPayController::class, 'handleVnpayCancel']);

Route::post('/check-feedback', [FeedbackController::class, 'checkFeedback']);
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
Route::get('/feedback/{id_productdetail}', [FeedbackController::class, 'feedback']);
    Route::get('/{id_productdetail}', [FeedbackController::class, 'feedback']);

});

// 📩 Contact
Route::prefix('contacts')->group(function () {
    Route::post('/', [ContactController::class, 'store']);
    Route::get('/', [ContactController::class, 'index']);
    Route::get('/{id}', [ContactController::class, 'show']);
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

    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{product_id}', [WishlistController::class, 'destroy']);
    Route::get('/wishlist/status/{product_id}', [WishlistController::class, 'checkStatus']);

    Route::prefix('comments')->group(function () {
        Route::get('/{productId}', [CommentController::class, 'index']);
        Route::post('/', [CommentController::class, 'store']);
        Route::put('/{id}', [CommentController::class, 'update']);
        Route::delete('/{id}', [CommentController::class, 'destroy']);
    });
});

// 🧾 Bill Detail (cho mọi người xem)
Route::get('/billdetail/bill/{id_bill}', [BillDetailController::class, 'getByBill']);
// ================== VOUCHER ==================
Route::post('/vouchers/apply', [ApiVoucherController::class, 'apply']);


// 💬 Comment (public) → sửa lại có prefix để không đè root "/"
Route::prefix('comments-public')->group(function () {
    Route::get('/', [CommentController::class, 'all']);
    Route::delete('/{id}', [CommentController::class, 'destroy']);
    Route::put('/{id}', [CommentController::class, 'update']);
});

// 📰 News (Public)
Route::prefix('news')->group(function () {
    Route::get('/', [NewsController::class, 'index']);
    Route::get('/{id}', [NewsController::class, 'show']);
    Route::post('/', [NewsController::class, 'store']);
    Route::put('/{id}', [NewsController::class, 'update']);
    // Route::delete('/{id}', [NewsController::class, 'destroy']);
});

// 🔑 Forgot password
Route::post('/forgot-password-otp', [PasswordOtpController::class, 'sendOtp']);
Route::post('/verify-password-otp', [PasswordOtpController::class, 'verifyOtp']);

// 🔑 Google login
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// 🔑 Register with OTP
Route::post('/send-register-otp', [AuthController::class, 'sendRegisterOtp']);
Route::post('/verify-register-otp', [AuthController::class, 'verifyRegisterOtp']);

// 🔒 Admin Routes

// Admin Contact
Route::prefix('admin/contacts')->group(function () {
    Route::get('/', [AdminContactController::class, 'index']);            // list
    Route::get('/{id}', [AdminContactController::class, 'show']);         // chi tiết
    Route::post('/{id}/reply', [AdminContactController::class, 'reply']); // phản hồi










});

Route::middleware([])->prefix('admin')->group(function () {
    //voucher
    Route::get('/vouchers', [VoucherController::class, 'index']);
    Route::post('/vouchers', [VoucherController::class, 'store']);
    Route::put('/vouchers/{id}', [VoucherController::class, 'update']);
    Route::delete('/vouchers/{id}', [VoucherController::class, 'destroy']);
    Route::patch('/vouchers/{id}/toggle', [VoucherController::class, 'toggleActive']);
    // 📌 Quản lý News
    Route::prefix('news')->group(function () {
        Route::get('/', [AdminNewsController::class, 'index']);
        Route::get('/{id}', [AdminNewsController::class, 'show']);
        Route::post('/', [AdminNewsController::class, 'store']);
        Route::put('/{id}', [AdminNewsController::class, 'update']);
        Route::delete('/{id}', [AdminNewsController::class, 'destroy']);
    });
    // 👤 User áp dụng voucher
    Route::post('/vouchers/check', [VoucherController::class, 'checkVoucher']); // ✅ check voucher khi khách nhập code

    // 📌 Quản lý Comment
    Route::prefix('comments')->group(function () {
        Route::get('/', [\App\Http\Controllers\Admin\CommentController::class, 'index']);
        Route::get('/{id}', [\App\Http\Controllers\Admin\CommentController::class, 'show']);
        Route::put('/{id}', [\App\Http\Controllers\Admin\CommentController::class, 'update']);
        Route::delete('/{id}', [\App\Http\Controllers\Admin\CommentController::class, 'destroy']);
        Route::patch('/{id}/toggle-hidden', [\App\Http\Controllers\Admin\CommentController::class, 'toggleHidden']);
    });

    // 📊 Dashboard
    Route::get('/dashboard/counts', [DashboardController::class, 'getCounts']);
    Route::get('/thongke/doanhthu', [ThongKeController::class, 'doanhThuTheoThang']);

    // 📂 Category
    Route::get('/category', [CategoryController::class, 'index']);
    Route::post('/category', [CategoryController::class, 'store']);
    Route::get('/category/{id}', [CategoryController::class, 'show']);
    Route::put('/category/{id}', [CategoryController::class, 'update']);
    Route::delete('/category/{id}', [CategoryController::class, 'destroy']);

    // 🏷️ Brand
    Route::get('/brand', [BrandController::class, 'index']);
    Route::post('/brand', [BrandController::class, 'store']);
    Route::put('/brand/{id}', [BrandController::class, 'update']);
    Route::delete('/brand/{id}', [BrandController::class, 'destroy']);

    // 👟 Product
    Route::get('/product', [SanPhamController::class, 'index']);
    Route::post('/product', [SanPhamController::class, 'store']);
    Route::post('/productdetails', [SanPhamController::class, 'storeWithDetails']);
    Route::get('/product/{id}', [SanPhamController::class, 'show']);
    Route::put('/product/{id}', [SanPhamController::class, 'update']);
    Route::delete('/product/{id}', [SanPhamController::class, 'destroy']);
    Route::post('/products/hide/{id}', [SanPhamController::class, 'hideProduct']);
    Route::post('/products/unhide/{id}', [SanPhamController::class, 'unhideProduct']);

    // 👤 User
    Route::get('/user', [UserController::class, 'index']);
    Route::post('/user', [UserController::class, 'store']);
    Route::put('/user/{id}', [UserController::class, 'update']);
    Route::delete('/user/{id}', [UserController::class, 'destroy']);
    Route::put('/user/{id}/toggle-block', [UserController::class, 'toggleBlock']);

    // 📏 Size & Color
    Route::get('/size', [SizeController::class, 'index']);
    Route::get('/color', [ColorController::class, 'index']);

    // 🧾 Bills
    Route::prefix('bills')->group(function () {
        Route::get('/', [BillManagementController::class, 'index']);
        Route::get('/{bill}', [BillManagementController::class, 'show']);
        Route::post('/{bill}/confirm', [BillManagementController::class, 'confirmOrder']);
        Route::post('/{bill}/cancel', [BillManagementController::class, 'cancelOrder']);
        Route::get('/pending', [BillManagementController::class, 'index'])->name('admin.bills.pending');
        Route::post('/{bill}/ship', [BillManagementController::class, 'markAsShipped']);
        Route::post('/{bill}/deliver', [BillManagementController::class, 'markAsDelivered']);
    });

    // ✅ Để tránh trùng, sửa lại route getAllBrands/Categories
    Route::get('/brands', [ProductController::class, 'getAllBrands']);
    Route::get('/categories', [ProductController::class, 'getAllCategories']);
});
