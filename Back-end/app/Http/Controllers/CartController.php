<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // Lấy danh sách giỏ hàng theo id_user
    public function index($id_user)
    {
        $cart = DB::table('cart')->where('id_user', $id_user)->get();
        return response()->json($cart);
    }

    // Thêm sản phẩm vào giỏ
    public function store(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:user,id_user',
            'id_productdetail' => 'required|exists:productdetail,id_product_detail',
            'quantity' => 'required|integer|min:1',
        ]);

        $productDetail = DB::table('productdetail')
            ->join('product', 'product.id_product', '=', 'productdetail.id_product')
            ->select('product.name', 'product.img', 'productdetail.gia')
            ->where('productdetail.id_product_detail', $request->id_productdetail)
            ->first();

        if (!$productDetail) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $cart = DB::table('cart')->where([
            ['id_user', $request->id_user],
            ['id_productdetail', $request->id_productdetail],
        ])->first();

        if ($cart) {
            $newQty = $cart->quantity + $request->quantity;
            DB::table('cart')->where('id_cart', $cart->id_cart)->update([
                'quantity' => $newQty,
                'thanhtien' => $productDetail->gia * $newQty,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('cart')->insert([
                'id_user' => $request->id_user,
                'id_productdetail' => $request->id_productdetail,
                'name' => $productDetail->name,
                'img' => $productDetail->img,
                'quantity' => $request->quantity,
                'price' => $productDetail->gia,
                'dongia' => $productDetail->gia,
                'thanhtien' => $productDetail->gia * $request->quantity,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        return response()->json(['message' => 'Thêm vào giỏ hàng thành công']);
    }

    // Cập nhật số lượng
    public function update(Request $request, $id_cart)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = DB::table('cart')->where('id_cart', $id_cart)->first();

        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng'], 404);
        }

        DB::table('cart')->where('id_cart', $id_cart)->update([
            'quantity' => $request->quantity,
            'thanhtien' => $cart->dongia * $request->quantity,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Cập nhật thành công']);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public function destroy($id_cart)
    {
        $deleted = DB::table('cart')->where('id_cart', $id_cart)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Đã xóa khỏi giỏ hàng']);
        } else {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }
    }

    // Đồng bộ giỏ hàng từ frontend (nếu cần)
    public function sync(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:user,id_user',
            'items' => 'required|array',
        ]);

        foreach ($request->items as $item) {
            $product = DB::table('productdetail')
                ->join('product', 'product.id_product', '=', 'productdetail.id_product')
                ->select('product.name', 'product.img', 'productdetail.gia')
                ->where('productdetail.id_product_detail', $item['id_productdetail'])
                ->first();

            if (!$product) {
                continue;
            }

            DB::table('cart')->updateOrInsert(
                [
                    'id_user' => $request->id_user,
                    'id_productdetail' => $item['id_productdetail']
                ],
                [
                    'name' => $product->name,
                    'img' => $product->img,
                    'quantity' => $item['quantity'],
                    'price' => $product->gia,
                    'dongia' => $product->gia,
                    'thanhtien' => $product->gia * $item['quantity'],
                    'updated_at' => now(),
                ]
            );
        }

        return response()->json(['message' => 'Đồng bộ giỏ hàng thành công']);
    }
}
