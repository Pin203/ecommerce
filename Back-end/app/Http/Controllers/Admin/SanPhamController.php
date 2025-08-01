<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class SanPhamController extends Controller
{
    /* ------------------------------------------------------------------
     |  Helper: Xoá ảnh cũ nếu tồn tại
     | ------------------------------------------------------------------*/
    private function deleteImageIfExists(?string $publicUrl): void
    {
        if ($publicUrl) {
            // '/storage/product_images/abc.jpg'  ->  'product_images/abc.jpg'
            $relativePath = str_replace('/storage/', '', $publicUrl);
            if (Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
    }

     /* ------------------------------------------------------------------
     |  Helper: Xoá danh sách ảnh phụ
     | ------------------------------------------------------------------*/
    private function deleteMultipleImagesIfExists(?array $publicUrls): void
    {
        if (!empty($publicUrls)) {
            foreach ($publicUrls as $url) {
                $this->deleteImageIfExists($url);
            }
        }
    }

    /* ------------------------------------------------------------------
     |  Lấy danh sách sản phẩm  (không đổi)
     | ------------------------------------------------------------------*/
    public function index(Request $request)
    {
        $query = Product::with(['category', 'brand', 'productDetails.size', 'productDetails.color']);

        if ($request->filled('name')) {
            $query->where('name', 'like', "%{$request->name}%");
        }
        if ($request->filled('id_category')) {
            $query->where('id_category', $request->id_category);
        }
        if ($request->filled('status')) {
            $query->where('is_featured', $request->status === 'active' ? 1 : 0);
        }

        return $query->get();
    }

    /* ------------------------------------------------------------------
     |  Thêm mới sản phẩm + chi tiết
     | ------------------------------------------------------------------*/
    public function storeWithDetails(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'id_category'  => ['required', Rule::exists('category', 'id_category')],
            'id_brand'     => ['required', Rule::exists('brand', 'id_brand')],
            'price'        => 'required|numeric|min:0',
            'discount'     => 'nullable|numeric|min:0|max:100',
            'is_featured'  => 'boolean',
            'sl'           => 'required|integer|min:0',
            'id_size'      => ['required', Rule::exists('size', 'id_size')],
            'id_color'     => ['required', Rule::exists('color', 'id_color')],
            'img'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'img_phu.*'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // THÊM DÒNG NÀY
        ]);

        try {
            DB::beginTransaction();

            // ------ Xử lý ảnh chính upload -----------------------------------
            $mainImgPublicUrl = null;
            if ($request->hasFile('img')) {
                $storedPath       = $request->file('img')->store('product_images', 'public');
                $mainImgPublicUrl = Storage::url($storedPath);
            }

            // ------ Xử lý ảnh phụ upload -------------------------------------
            $additionalImgPublicUrls = [];
            if ($request->hasFile('img_phu')) {
                foreach ($request->file('img_phu') as $file) {
                    $storedPath                = $file->store('product_images', 'public');
                    $additionalImgPublicUrls[] = Storage::url($storedPath);
                }
            }

            // ------ Product -------------------------------------------
            $product = Product::create([
                'name'            => $request->name,
                'id_category'     => $request->id_category,
                'id_brand'        => $request->id_brand,
                'description'     => $request->description,
                'technical_specs' => $request->technical_specs,
                'price'           => $request->price,
                'discount'        => $request->discount ?? 0,
                'is_featured'     => $request->is_featured,
                'img'             => $mainImgPublicUrl,
                'img_phu'         => $additionalImgPublicUrls, // LƯU MẢNG URL ẢNH PHỤ
            ]);

            // ------ ProductDetail -------------------------------------
            $detail = ProductDetail::create([
                'id_product' => $product->id_product,
                'mota'       => $request->mota,
                'sl'         => $request->sl,
                'id_size'    => $request->id_size,
                'id_color'   => $request->id_color,
                'gia'        => $request->price,
            ]);

            DB::commit();

            return response()->json([
                'message'        => 'Thêm sản phẩm thành công.',
                'product'        => $product->load('category', 'brand'),
                'product_detail' => $detail->load('size', 'color'),
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi thêm sản phẩm.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /* ------------------------------------------------------------------
     |  Lấy 1 sản phẩm
     | ------------------------------------------------------------------*/
    public function show($id)
    {
        $product = Product::with(['category', 'brand', 'productDetails.size', 'productDetails.color'])->find($id);
        return $product
            ? response()->json($product)
            : response()->json(['message' => 'Sản phẩm không tìm thấy.'], 404);
    }

    /* ------------------------------------------------------------------
     |  Cập nhật sản phẩm + chi tiết
     | ------------------------------------------------------------------*/
    public function update(Request $request, $id)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'id_category'  => ['required', Rule::exists('category', 'id_category')],
            'id_brand'     => ['required', Rule::exists('brand', 'id_brand')],
            'price'        => 'required|numeric|min:0',
            'discount'     => 'nullable|numeric|min:0|max:100',
            'is_featured'  => 'boolean',
            'sl'           => 'required|integer|min:0',
            'id_size'      => ['required', Rule::exists('size', 'id_size')],
            'id_color'     => ['required', Rule::exists('color', 'id_color')],
            'img'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'img_phu.*'    => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // THÊM DÒNG NÀY
            'current_img'  => 'nullable|string',
            'current_img_phu' => 'nullable|array', // MẢNG CHỨA CÁC URL ẢNH PHỤ HIỆN TẠI
            'current_img_phu.*' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $product = Product::find($id);
            if (!$product) {
                return response()->json(['message' => 'Sản phẩm không tìm thấy.'], 404);
            }

            /* ---------- Xử lý ảnh chính mới / xoá ảnh chính---------- */
            $mainImgPublicUrl = $product->img; // giữ ảnh cũ mặc định

            if ($request->hasFile('img')) {
                // xóa ảnh cũ
                $this->deleteImageIfExists($product->img);

                $storedPath       = $request->file('img')->store('product_images', 'public');
                $mainImgPublicUrl = Storage::url($storedPath);
            } elseif ($request->input('current_img') === 'null' || $request->input('current_img') === '') {
                // user chọn xoá ảnh
                $this->deleteImageIfExists($product->img);
                $mainImgPublicUrl = null;
            }

            /* ---------- Xử lý ảnh phụ mới / xoá ảnh phụ ---------- */
            $additionalImgPublicUrls = $product->img_phu ?? []; // Lấy ảnh phụ hiện có

            // Xoá các ảnh phụ bị gỡ bỏ
            $currentAdditionalImages = $request->input('current_img_phu', []);
            $imagesToDelete = array_diff($additionalImgPublicUrls, $currentAdditionalImages);
            $this->deleteMultipleImagesIfExists($imagesToDelete);

            // Thêm các ảnh phụ mới
            $newAdditionalImgPublicUrls = $currentAdditionalImages; // Bắt đầu với các ảnh còn lại

            if ($request->hasFile('img_phu')) {
                foreach ($request->file('img_phu') as $file) {
                    $storedPath = $file->store('product_images', 'public');
                    $newAdditionalImgPublicUrls[] = Storage::url($storedPath);
                }
            }
            // Giới hạn số lượng ảnh phụ nếu cần (ví dụ: chỉ giữ 3 ảnh mới nhất)
            // $newAdditionalImgPublicUrls = array_slice($newAdditionalImgPublicUrls, -3); // Giữ 3 ảnh cuối

            /* ---------- Cập nhật Product ---------- */
            $product->update([
                'name'            => $request->name,
                'id_category'     => $request->id_category,
                'id_brand'        => $request->id_brand,
                'description'     => $request->description,
                'technical_specs' => $request->technical_specs,
                'price'           => $request->price,
                'discount'        => $request->discount ?? 0,
                'is_featured'     => $request->is_featured,
                'img'             => $mainImgPublicUrl,
                'img_phu'         => $newAdditionalImgPublicUrls, // CẬP NHẬT MẢNG ẢNH PHỤ
            ]);

            // Cập nhật ProductDetail (giữ nguyên logic đã có)
            $detail = $product->productDetails()->first();
            if ($detail) {
                $detail->update([
                    'mota'     => $request->mota,
                    'sl'       => $request->sl,
                    'id_size'  => $request->id_size,
                    'id_color' => $request->id_color,
                    'gia'      => $request->price,
                ]);
            } else {
                $detail = ProductDetail::create([
                    'id_product' => $product->id_product,
                    'mota'       => $request->mota,
                    'sl'         => $request->sl,
                    'id_size'    => $request->id_size,
                    'id_color'   => $request->id_color,
                    'gia'        => $request->price,
                ]);
            }

            DB::commit();

            return response()->json([
                'message'        => 'Cập nhật sản phẩm thành công.',
                'product'        => $product->load('category', 'brand'),
                'product_detail' => $detail->load('size', 'color'),
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Lỗi khi cập nhật sản phẩm.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}