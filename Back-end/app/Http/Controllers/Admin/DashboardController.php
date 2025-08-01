<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill; 
use App\Models\Category; 
use App\Models\Brand;
use App\Models\Product;
use App\Models\User; 
use App\Models\Voucher; 
use App\Models\News; 
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Lấy tổng số đơn hàng, danh mục, thương hiệu, sản phẩm, người dùng, mã giảm giá và bài viết.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCounts()
    {
        // 1. Lấy tổng số lượng bằng cách đếm các bản ghi trong mỗi bảng
        $totalOrders = Bill::count();           // Đếm tất cả các đơn hàng
        $totalCategories = Category::count();   // Đếm tất cả các danh mục
        $totalBrands = Brand::count();          // Đếm tất cả các thương hiệu
        $totalProducts = Product::count();      // Đếm tất cả các sản phẩm
        $totalUsers = User::count();            // Đếm tất cả người dùng
        $totalVouchers = Voucher::count(); // Đếm tất cả mã giảm giá
        $totalNews = News::count();      // Đếm tất cả bài viết (ví dụ: bài viết blog)

       
        $totalRevenue = Bill::sum('total');

        // 3. Trả về các số liệu này dưới dạng JSON (JavaScript Object Notation)
        // JSON là định dạng dữ liệu chuẩn để trao đổi giữa server và client (frontend)
        return response()->json([
            'total_orders' => $totalOrders,
            'total_categories' => $totalCategories,
            'total_brands' => $totalBrands,
            'total_products' => $totalProducts,
            'total_users' => $totalUsers,
            'total_vouchers' => $totalVouchers, // Thêm vào phản hồi JSON
            'total_news' => $totalNews,
            'total_revenue' => $totalRevenue,
        ]);
    }
}
