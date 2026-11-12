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
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
class DashboardController extends Controller
{
    public function getCounts()
    {
        $totalOrders = Bill::count();
        $totalCategories = Category::count();
        $totalBrands = Brand::count();
        $totalProducts = Product::count();
        $totalUsers = User::count();
        $totalVouchers = Voucher::count();
        $totalNews = News::count();
        // Đếm đơn hàng theo trạng thái order_status, loại bỏ trạng thái 'cancelled'
        $orderStatusCounts = Bill::where('order_status', '!=', 'cancelled')
            ->groupBy('order_status')
            ->select('order_status', DB::raw('count(*) as count'))
            ->get()
            ->pluck('count', 'order_status')
            ->toArray();
        // Sửa lỗi ở đây:
        // Tổng doanh thu (Tổng tất cả các hóa đơn)
        $totalRevenue = Bill::sum('total');
        // Doanh thu đã xác nhận (Chỉ từ các bill có trạng thái 'delivered')
      $confirmedRevenue = Bill::whereNotNull('ngaynhan')->sum('total');
        // Doanh thu tạm tính (Tổng các hóa đơn chưa hoàn tất, tức là không phải 'delivered')
        $temporaryRevenue = Bill::where('order_status', '!=', 'delivered')->sum('total');
        return response()->json([
            'total_orders' => $totalOrders,
            'total_categories' => $totalCategories,
            'total_brands' => $totalBrands,
            'total_products' => $totalProducts,
            'total_users' => $totalUsers,
            'total_vouchers' => $totalVouchers,
            'total_news' => $totalNews,
            'total_revenue' => $totalRevenue,
            'temporary_revenue' => $temporaryRevenue,
            'confirmed_revenue' => $confirmedRevenue,
            'order_status_counts' => $orderStatusCounts ?? [],
        ]);
    }
}