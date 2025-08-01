<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;    // Import Brand model
use App\Models\Category; // Import Category model
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function sanpham(Request $request)
    {
        $query = Product::query();

        // Lọc theo tên sản phẩm
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        // Lọc theo thương hiệu (brand_id đã có trong code của bạn)
        if ($request->has('brand_id') && $request->input('brand_id') != '') {
            $brandId = $request->input('brand_id');
            $query->where('id_brand', $brandId);
        }

        // Lọc theo danh mục (thêm vào hoặc sửa lại tên tham số cho khớp)
        if ($request->has('id_category') && $request->input('id_category') != '') {
            $categoryId = $request->input('id_category');
            $query->where('id_category', $categoryId);
        }

        // Lọc theo khoảng giá
        if ($request->filled('prices')) {
            $query->where(function ($q) use ($request) {
                foreach ($request->prices as $priceRange) {
                    switch ($priceRange) {
                        case 'under_1000':
                            $q->orWhere('price', '<', 1000000);
                            break;
                        case '1000_2000':
                            $q->orWhereBetween('price', [1000000, 2000000]);
                            break;
                        case '2000_3000':
                            $q->orWhereBetween('price', [2000000, 3000000]);
                            break;
                        case 'over_3000':
                            $q->orWhere('price', '>', 3000000);
                            break;
                    }
                }
            });
        }

        // Sắp xếp
        if ($request->sort === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($request->sort === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($request->sort === 'date_desc') { // Sắp xếp Mới nhất
            $query->orderBy('created_at', 'desc');
        } elseif ($request->sort === 'date_asc') { // Sắp xếp Cũ nhất
            $query->orderBy('created_at', 'asc');
        } else {
            $query->orderByDesc('created_at'); // Sắp xếp mặc định
        }

        // Lọc sản phẩm có giảm giá
        if ($request->boolean('discount')) {
            $query->where('discount', '>', 0);
        }

        // Lọc sản phẩm nổi bật
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->input('is_featured'));
        }

        $products = $query->paginate(12);

        return response()->json($products);
    }

    /**
     * Lấy tất cả các thương hiệu.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllBrands()
    {
        $brands = Brand::all();
        return response()->json($brands);
    }

    /**
     * Lấy tất cả các danh mục.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAllCategories()
    {
        $categories = Category::all();
        return response()->json($categories);
    }

    // Giữ nguyên phương thức getRelatedProductsByBrand nếu bạn cần
    public function getRelatedProductsByBrand($brandId)
    {
        $relatedProducts = Product::where('id_brand', $brandId)
                                 ->limit(8)
                                 ->get();

        if ($relatedProducts->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm liên quan cho thương hiệu này.'], 404);
        }

        return response()->json($relatedProducts->map(function($product) {
            $imageUrl = $product->img ? asset($product->img) : null;

            return [
                'id_product' => $product->id_product,
                'name' => $product->name,
                'price' => $product->price,
                'discount' => $product->discount ?? 0,
                'final_price' => $product->price * (1 - ($product->discount ?? 0) / 100),
                'img' => $imageUrl,
            ];
        }));
    }
     public function searchSuggestions(Request $request)
    {
        $searchTerm = $request->input('query');

        if (empty($searchTerm)) {
            return response()->json([
                'products' => []
            ]);
        }

        // 1. Tìm kiếm sản phẩm
        $products = Product::where('name', 'like', '%' . $searchTerm . '%')
                           ->select('id_product', 'name', 'price', 'discount', 'img')
                           ->limit(5) // Giới hạn số lượng sản phẩm gợi ý
                           ->get();

        // Xử lý giá cuối cùng và URL hình ảnh cho sản phẩm
        $formattedProducts = $products->map(function($product) {
            $imageUrl = $product->img ? asset($product->img) : null;
            $finalPrice = $product->price * (1 - ($product->discount ?? 0) / 100);
            return [
                'id' => $product->id_product,
                'name' => $product->name,
                'price' => $product->price,
                'discount' => $product->discount,
                'final_price' => $finalPrice,
                'img' => $imageUrl,
                // 'type' => 'product' // ✅ Có thể bỏ trường 'type' nếu chỉ có 1 loại kết quả
            ];
        });

        return response()->json([
            'products' => $formattedProducts
        ]);
    }
}