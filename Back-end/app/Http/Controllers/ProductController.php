<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp và phân trang.
     * Phương thức này sẽ nhận từ khóa tìm kiếm từ query parameter "name"
     * để hiển thị sản phẩm trên trang lọc.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sanpham(Request $request)
    {
        $query = Product::query();

        // Lọc theo tên sản phẩm, nhận từ khóa từ query parameter "name"
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        // Lọc theo thương hiệu (brand_id)
        if ($request->filled('brand_id')) {
            $query->where('id_brand', $request->input('brand_id'));
        }

        // Lọc theo danh mục (id_category)
        if ($request->filled('id_category')) {
            $query->where('id_category', $request->input('id_category'));
        }

        // Lọc theo khoảng giá
        if ($request->has('prices') && is_array($request->input('prices'))) {
            $query->where(function ($q) use ($request) {
                foreach ($request->input('prices') as $priceRange) {
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

        // Lọc sản phẩm có giảm giá
        if ($request->boolean('discount')) {
            $query->where('discount', '>', 0);
        }

        // Lọc sản phẩm nổi bật
        if ($request->filled('is_featured')) {
            $query->where('is_featured', $request->input('is_featured'));
        }

        // Sắp xếp sản phẩm
        switch ($request->sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'date_asc':
                $query->orderBy('created_at', 'asc');
                break;
            case 'date_desc':
            default: // Mặc định sắp xếp theo ngày tạo mới nhất
                $query->orderByDesc('created_at');
                break;
        }

        $products = $query->paginate(12);

        return response()->json($products);
    }

    /**
     * Lấy danh sách sản phẩm gợi ý dựa trên từ khóa tìm kiếm.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchSuggestions(Request $request)
    {
        $searchTerm = $request->input('query');

        if (empty($searchTerm) || strlen($searchTerm) < 2) {
            return response()->json(['products' => []]);
        }

        $products = Product::where('name', 'like', '%' . $searchTerm . '%')
                           ->select('id_product', 'name', 'price', 'discount', 'img')
                           ->limit(5)
                           ->get();

        $formattedProducts = $products->map(function ($product) {
            $imageUrl = $product->img ? asset($product->img) : null;
            $finalPrice = $product->price * (1 - ($product->discount ?? 0) / 100);

            return [
                'id' => $product->id_product,
                'name' => $product->name,
                'price' => $product->price,
                'discount' => $product->discount,
                'final_price' => $finalPrice,
                'img' => $imageUrl,
            ];
        });

        return response()->json(['products' => $formattedProducts]);
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

    /**
     * Lấy các sản phẩm liên quan theo ID thương hiệu.
     *
     * @param  int  $brandId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRelatedProductsByBrand($brandId)
    {
        $relatedProducts = Product::where('id_brand', $brandId)
                                  ->limit(8)
                                  ->get();

        if ($relatedProducts->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm liên quan cho thương hiệu này.'], 404);
        }

        return response()->json($relatedProducts->map(function ($product) {
            $imageUrl = $product->img ? asset($product->img) : null;
            $finalPrice = $product->price * (1 - ($product->discount ?? 0) / 100);

            return [
                'id_product' => $product->id_product,
                'name' => $product->name,
                'price' => $product->price,
                'discount' => $product->discount ?? 0,
                'final_price' => $finalPrice,
                'img' => $imageUrl,
            ];
        }));
    }
}
