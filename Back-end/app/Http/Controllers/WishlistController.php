<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
public function index(Request $request) {
    $user = Auth::user();
    if (!$user) {
        return response()->json(['status' => 401, 'message' => 'Chưa đăng nhập.'], 401);
    }

    // Eager load cả 'product' và 'productdetails' của product
    $wishlist = Wishlist::with(['product.productdetails'])->where('id_user', $user->id_user)->get();
    
    // SỬA: Lấy dữ liệu và gán vào thuộc tính của PRODUCT, không phải WISHLIST
    foreach ($wishlist as $item) {
        if ($item->product) {
            // Gán giá cuối cùng vào thuộc tính `final_price` của đối tượng PRODUCT
            $item->product->final_price = $item->product->gia_km > 0 ? $item->product->gia_km : $item->product->gia;
        }
    }
    
    return response()->json(['status' => 200, 'data' => $wishlist], 200);
}
public function store(Request $request) {
    $user = Auth::user();
    if (!$user) return response()->json(['status' => 401, 'message' => 'Chưa đăng nhập.'], 401);
    $request->validate(['product_id' => 'required|exists:product,id_product']);
    $alreadyExists = Wishlist::where('id_user', $user->id_user)->where('id_product', $request->product_id)->exists();
    if ($alreadyExists) return response()->json(['status' => 409, 'message' => 'Sản phẩm đã có trong danh sách yêu thích.'], 409);
    $wishlist = Wishlist::create(['id_user' => $user->id_user, 'id_product' => $request->product_id]);
    return response()->json(['status' => 201, 'message' => 'Đã thêm sản phẩm vào danh sách yêu thích.', 'data' => $wishlist], 201);
}

public function destroy(Request $request, $product_id) {
    $user = Auth::user();
    if (!$user) return response()->json(['status' => 401, 'message' => 'Chưa đăng nhập.'], 401);
    $deleted = Wishlist::where('id_user', $user->id_user)->where('id_product', $product_id)->delete();
    return $deleted
        ? response()->json(['status' => 200, 'message' => 'Đã xóa sản phẩm khỏi danh sách yêu thích.'], 200)
        : response()->json(['status' => 404, 'message' => 'Sản phẩm không tồn tại trong danh sách yêu thích.'], 404);
}
// WishlistController.php
public function checkStatus(Request $request, $product_id) {
    $user = Auth::user();
    if (!$user) {
        return response()->json(['isWishlisted' => false], 200);
    }
    $exists = Wishlist::where('id_user', $user->id_user)
                      ->where('id_product', $product_id)
                      ->exists();
    return response()->json(['isWishlisted' => $exists], 200);
}
}
