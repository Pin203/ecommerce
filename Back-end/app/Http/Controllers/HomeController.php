<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;


use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function trangchu()
    {
        // Sản phẩm mới (8 sản phẩm gần nhất)
        $sanphammoi = Product::orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Sản phẩm khuyến mãi (discount > 0)
        $sanphamsale = Product::where('discount', '>', 0)
            ->orderBy('updated_at', 'desc')
            ->take(8)
            ->get();

        // Sản phẩm nổi bật (is_featured = true)
        $sanphamnoibat = Product::where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Danh sách danh mục
        $danhmuc = Category::all();

        return response()->json([
            'status' => 'success',
            'sanphammoi' => $sanphammoi,
            'sanphamsale' => $sanphamsale,
            'sanphamnoibat' => $sanphamnoibat,
            'danhmuc' => $danhmuc,
        ]);
    }
}
