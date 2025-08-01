<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductDetail;
use Illuminate\Http\Request;

class ProductDetailController extends Controller
{
    public function trangchitietTheoProductId($id_product)
    {
        // Sử dụng eager loading 'product.brand', 'product', 'color', 'size'
        // 'product' sẽ tải cả cột 'img_phu' đã được cast thành mảng bởi Product Model
        $details = ProductDetail::with(['product.brand', 'product', 'color', 'size'])
                               ->where('id_product', $id_product)
                               ->get();

        if ($details->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy chi tiết sản phẩm cho sản phẩm này'], 404);
        }

        // Lấy chi tiết đầu tiên làm mặc định
        $detail = $details->first();

        // Lấy ảnh chính và đảm bảo nó là URL đầy đủ bằng asset()
        $mainImageUrl = asset($detail->product->img);

        // Lấy mảng ảnh phụ. Vì img_phu đã được cast thành array trong Product Model,
        // nó sẽ là một mảng PHP. Chúng ta cần đảm bảo mỗi phần tử trong mảng này
        // cũng là một URL đầy đủ.
        $additionalImages = [];
        if (is_array($detail->product->img_phu)) {
            foreach ($detail->product->img_phu as $path) {
                $additionalImages[] = asset($path); // <--- Áp dụng asset() cho từng ảnh phụ
            }
        }

        return response()->json([
            'id' => $detail->id_product_detail,
            'id_product' => $detail->product->id_product,
            'name' => $detail->product->name,
            'price' => $detail->product->price,
            'discount' => $detail->product->discount ?? 0,
            'final_price' => $detail->product->price * (1 - ($detail->product->discount ?? 0) / 100),
            'img' => $mainImageUrl, // Ảnh chính đã được xử lý bằng asset()
            'img_phu' => $additionalImages, // Mảng ảnh phụ đã được xử lý bằng asset()
            'mota' => $detail->mota,
            'sl' => $detail->sl,
            'color' => optional($detail->color)->name,
            'size' => optional($detail->size)->name,
            'brand' => optional($detail->product->brand)->toArray(),

            'other_details' => $details->map(function($d) {
                return [
                    'id_product_detail' => $d->id_product_detail,
                    'color' => optional($d->color)->name,
                    'size' => optional($d->size)->name,
                    'sl' => $d->sl,
                    // Nếu cột 'img' tồn tại trong product_details và bạn muốn nó là thumbnail,
                    // hãy đảm bảo nó cũng được xử lý bằng asset()
                    // 'img' => $d->img ? asset($d->img) : null,
                ];
            })
        ]);
    }

    public function trangchitiet($id)
    {
        $productDetail = ProductDetail::with(['product.brand', 'size', 'color'])->find($id);

        if (!$productDetail) {
            return response()->json(['message' => 'Chi tiết sản phẩm không tìm thấy.'], 404);
        }

        return response()->json($productDetail);
    }
    public function show($id_product)
    {
        // Sử dụng eager loading 'product.brand', 'product', 'color', 'size'
        $details = ProductDetail::with(['product.brand', 'product', 'color', 'size'])
                               ->where('id_product', $id_product)
                               ->get();

        if ($details->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy chi tiết sản phẩm cho sản phẩm này'], 404);
        }

        // Lấy chi tiết đầu tiên làm mặc định để lấy thông tin sản phẩm chính
        $detail = $details->first();
        $product = $detail->product; // Lấy đối tượng Product chính

        // Lấy ảnh chính và đảm bảo nó là URL đầy đủ bằng asset()
        $mainImageUrl = $product->img ? asset($product->img) : null;

        // Lấy mảng ảnh phụ và đảm bảo mỗi phần tử là một URL đầy đủ
        $additionalImages = [];
        if (is_array($product->img_phu)) { // Dùng $product->img_phu
            foreach ($product->img_phu as $path) {
                $additionalImages[] = asset($path);
            }
        }

        return response()->json([
            'status' => 'success', // THÊM TRƯỜNG STATUS NÀY
            'product' => [ // LỒNG TẤT CẢ VÀO TRONG TRƯỜNG PRODUCT
                'id' => $detail->id_product_detail, // Hoặc bạn có thể trả về id_product nếu muốn
                'id_product' => $product->id_product,
                'name' => $product->name,
                'price' => $product->price,
                'discount' => $product->discount ?? 0,
                'final_price' => $product->price * (1 - ($product->discount ?? 0) / 100),
                'img' => $mainImageUrl,
                'img_phu' => $additionalImages,
                'mota' => $product->description, // Dùng mô tả từ Product Model
                'description' => $product->description, // Dùng mô tả từ Product Model (cho rõ ràng)
                'sl' => $detail->sl, // Số lượng của chi tiết mặc định
                'color' => optional($detail->color)->name,
                'size' => optional($detail->size)->name,
                'brand' => optional($product->brand)->toArray(), // Dùng $product->brand

                'other_details' => $details->map(function($d) {
                    return [
                        'id_product_detail' => $d->id_product_detail,
                        'color' => optional($d->color)->name,
                        'size' => optional($d->size)->name,
                        'sl' => $d->sl,
                    ];
                })
            ]
        ]);
    }
}


// namespace App\Http\Controllers;

// use App\Models\Product;
// use App\Models\Category;
// use App\Models\ProductDetail;
// use Illuminate\Http\Request;

// class ProductDetailController extends Controller
// {
//     public function trangchitiet($id)
//     {
//         $detail = ProductDetail::with(['product', 'color', 'size'])->find($id);

//         if (!$detail) {
//             return response()->json(['message' => 'Không tìm thấy chi tiết sản phẩm'], 404);
//         }

//         return response()->json([
//             'id' => $detail->id_product_detail,
//             'id_product' => $detail->product->id_product,
//             'name' => $detail->product->name,
//             'price' => $detail->product->price,
//             'discount' => $detail->product->discount ?? 0,
//             'final_price' => $detail->product->price * (1 - ($detail->product->discount ?? 0) / 100),
//             'img' => asset($detail->product->img),
//             'mota' => $detail->mota,
//             'sl' => $detail->sl,
//             'color' => optional($detail->color)->name,
//             'size' => optional($detail->size)->name,
//         ]);
//     }
// }
 