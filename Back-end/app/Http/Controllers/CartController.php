<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // Lấy giỏ hàng của user
  public function index($id_user)
    {
        try {
            $cart = DB::table('cart')
                ->join('productdetail', 'productdetail.id_product_detail', '=', 'cart.id_productdetail')
                ->join('product', 'product.id_product', '=', 'productdetail.id_product')
                ->select(
                    'cart.*',
                    'product.id_product',
                    'product.name as product_name',
                    'product.img as product_img',
                    'productdetail.gia',
                    'productdetail.sl'
                )
                ->where('cart.id_user', $id_user)
                ->get();

            return response()->json($cart);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server', 'error' => $e->getMessage()], 500);
        }
    }

    // Lấy size theo id_product
    public function getSizes($id_product)
    {
        try {
            $sizes = DB::table('productdetail')
                ->join('size', 'size.id_size', '=', 'productdetail.id_size')
                ->select('size.id_size', 'size.name as size_name')
                ->where('productdetail.id_product', $id_product)
                ->distinct()
                ->get();

            if ($sizes->isEmpty()) {
                return response()->json(['message' => 'Không tìm thấy size cho sản phẩm này'], 404);
            }

            return response()->json($sizes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server', 'error' => $e->getMessage()], 500);
        }
    }

    // Lấy màu theo id_product
    public function getColors($id_product)
    {
        try {
            $colors = DB::table('productdetail')
                ->join('color', 'color.id_color', '=', 'productdetail.id_color')
                ->select('color.id_color', 'color.name as color_name')
                ->where('productdetail.id_product', $id_product)
                ->distinct()
                ->get();

            if ($colors->isEmpty()) {
                return response()->json(['message' => 'Không tìm thấy màu cho sản phẩm này'], 404);
            }

            return response()->json($colors);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server', 'error' => $e->getMessage()], 500);
        }
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
            ->select('product.id_product', 'product.name', 'product.img', 'productdetail.gia', 'productdetail.sl')
            ->where('productdetail.id_product_detail', $request->id_productdetail)
            ->first();

        if (!$productDetail) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        if ($request->quantity > $productDetail->sl) {
            return response()->json(['message' => 'Số lượng yêu cầu vượt quá tồn kho'], 400);
        }

        $cart = DB::table('cart')
            ->where('id_user', $request->id_user)
            ->where('id_productdetail', $request->id_productdetail)
            ->first();

        if ($cart) {
            $newQty = $cart->quantity + $request->quantity;

            if ($newQty > $productDetail->sl) {
                return response()->json(['message' => 'Đã đạt số lượng tối đa trong kho'], 400);
            }

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
                'updated_at' => now(),
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

        $productDetail = DB::table('productdetail')
            ->where('id_product_detail', $cart->id_productdetail)
            ->select('sl', 'gia')
            ->first();

        if (!$productDetail) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm trong kho'], 404);
        }

        if ($request->quantity > $productDetail->sl) {
            return response()->json(['message' => 'Số lượng trong kho đã hết'], 400);
        }

        DB::table('cart')->where('id_cart', $id_cart)->update([
            'quantity' => $request->quantity,
            'thanhtien' => $productDetail->gia * $request->quantity,
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Cập nhật thành công']);
    }

    // Xóa 1 sản phẩm khỏi giỏ
    public function destroy($id_cart)
    {
        $deleted = DB::table('cart')->where('id_cart', $id_cart)->delete();

        if ($deleted) {
            return response()->json(['message' => 'Đã xóa khỏi giỏ hàng']);
        }
        return response()->json(['message' => 'Không tìm thấy sản phẩm'], 404);
    }

    // Xóa toàn bộ giỏ hàng
     public function clear($id_user)
    {
        try {
            DB::table('cart')->where('id_user', $id_user)->delete();
            return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
    public function clearUserCart($id_user)
{
    return $this->clear($id_user);
}



    // Đồng bộ giỏ hàng từ frontend
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

    // Lấy thông tin user
    public function getUserInfo($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'Không tìm thấy user'], 404);
            }

            return response()->json([
                'name' => $user->name,
                'email' => $user->email,
                'dienthoai' => $user->dienthoai ?? $user->phone ?? null,
                'diachi' => $user->diachi ?? $user->address ?? null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server', 'error' => $e->getMessage()], 500);
        }
    }

    // Cập nhật thông tin user
    public function updateUserInfo(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'Không tìm thấy user'], 404);
            }

            $user->name = $request->name ?? $user->name;
            $user->email = $request->email ?? $user->email;
            $user->dienthoai = $request->dienthoai ?? $user->dienthoai;
            $user->diachi = $request->diachi ?? $user->diachi;
            $user->save();

            return response()->json(['message' => 'Cập nhật thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server', 'error' => $e->getMessage()], 500);
        }
    }
}
