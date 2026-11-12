<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class SanPhamController extends Controller
{
    /* ------------------------------------------------------------------
     |  Helper: Xoá ảnh cũ nếu tồn tại
     | ------------------------------------------------------------------*/
    private function deleteImageIfExists(?string $publicUrl): void
    {
        if ($publicUrl) {
            $path = public_path(parse_url($publicUrl, PHP_URL_PATH));
            if (file_exists($path)) {
                unlink($path);
            }
        }
    }

    /* ------------------------------------------------------------------
     |  Helper: Xoá danh sách ảnh phụ
     | ------------------------------------------------------------------*/
    private function deleteMultipleImagesIfExists(?array $publicUrls): void
    {
        if (! empty($publicUrls)) {
            foreach ($publicUrls as $url) {
                $this->deleteImageIfExists($url);
            }
        }
    }

    /* ------------------------------------------------------------------
     |  Lấy danh sách sản phẩm (đã chỉnh sửa cho admin)
     | ------------------------------------------------------------------*/
    public function index(Request $request)
    {
        $query = Product::withoutGlobalScopes(['visible'])
            ->with(['category', 'brand', 'productDetails.size', 'productDetails.color']);

        if ($request->filled('name')) {
            $query->where('name', 'like', "%{$request->name}%");
        }
        if ($request->filled('id_category')) {
            $query->where('id_category', $request->id_category);
        }
        if ($request->filled('status') && in_array($request->status, [0, 1])) {
            $query->where('status', $request->status);
        }

        $products = $query->paginate(10);
        return response()->json($products);
    }

    /* ------------------------------------------------------------------
     |  Thêm mới sản phẩm + chi tiết
     | ------------------------------------------------------------------*/
    public function storeWithDetails(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'id_category' => ['required', Rule::exists('category', 'id_category')],
            'id_brand'    => ['required', Rule::exists('brand', 'id_brand')],
            'price'       => 'required|numeric|min:0',
            'discount'    => 'nullable|numeric|min:0|max:100',
            'is_featured' => 'nullable',
            'sl'          => 'required|integer|min:0',
            'id_size'     => ['required', Rule::exists('size', 'id_size')],
            'id_color'    => ['required', Rule::exists('color', 'id_color')],
'img'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'img_phu.*'   => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'status'      => 'nullable',
        ]);

        try {
            DB::beginTransaction();

            // ✅ ép kiểu boolean ở backend
            $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
            $status     = filter_var($request->status, FILTER_VALIDATE_BOOLEAN);

            $mainImgPublicUrl = null;
            if ($request->hasFile('img')) {
                $fileName = time() . '_' . $request->file('img')->getClientOriginalName();
                $request->file('img')->move(public_path('product_images'), $fileName);
                $mainImgPublicUrl = url('product_images/' . $fileName);
            }

            $additionalImgPublicUrls = [];
            if ($request->hasFile('img_phu')) {
                foreach ($request->file('img_phu') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('product_images'), $fileName);
                    $additionalImgPublicUrls[] = url('product_images/' . $fileName);
                }
            }

            $product = Product::create([
                'name'            => $request->name,
                'id_category'     => $request->id_category,
                'id_brand'        => $request->id_brand,
                'description'     => $request->description,
                'technical_specs' => $request->technical_specs,
                'price'           => $request->price,
                'discount'        => $request->discount ?? 0,
                'is_featured'     => $isFeatured,
                'status'          => $status,
                'img'             => $mainImgPublicUrl,
                'img_phu'         => $additionalImgPublicUrls,
            ]);

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
        $product = Product::withoutGlobalScopes(['visible'])
            ->with(['category', 'brand', 'productDetails.size', 'productDetails.color'])
            ->find($id);

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
            'name'              => 'required|string|max:255',
            'id_category'       => ['required', Rule::exists('category', 'id_category')],
            'id_brand'          => ['required', Rule::exists('brand', 'id_brand')],
            'price'             => 'required|numeric|min:0',
            'discount'          => 'nullable|numeric|min:0|max:100',
            'is_featured'       => 'nullable',
            'sl'                => 'required|integer|min:0',
            'id_size'           => ['required', Rule::exists('size', 'id_size')],
            'id_color'          => ['required', Rule::exists('color', 'id_color')],
            'img'               => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'img_phu.*'         => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'current_img'       => 'nullable|string',
            'current_img_phu'   => 'nullable|array',
            'current_img_phu.*' => 'nullable|string',
            'status'            => 'nullable',
        ]);

        try {
            DB::beginTransaction();

            $product = Product::withoutGlobalScopes(['visible'])->find($id);
            if (! $product) {
                return response()->json(['message' => 'Sản phẩm không tìm thấy.'], 404);
            }

            // ✅ ép kiểu boolean
            $isFeatured = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
            $status     = filter_var($request->status, FILTER_VALIDATE_BOOLEAN);

            $mainImgPublicUrl = $product->img;
            if ($request->hasFile('img')) {
                $this->deleteImageIfExists($product->img);
                $fileName = time() . '_' . $request->file('img')->getClientOriginalName();
                $request->file('img')->move(public_path('product_images'), $fileName);
                $mainImgPublicUrl = url('product_images/' . $fileName);
            } elseif ($request->input('current_img') === 'null' || $request->input('current_img') === '') {
                $this->deleteImageIfExists($product->img);
                $mainImgPublicUrl = null;
            }

            $additionalImgPublicUrls = $product->img_phu ?? [];
$currentAdditionalImages = $request->input('current_img_phu', []);
            $imagesToDelete          = array_diff($additionalImgPublicUrls, $currentAdditionalImages);
            $this->deleteMultipleImagesIfExists($imagesToDelete);

            $newAdditionalImgPublicUrls = $currentAdditionalImages;
            if ($request->hasFile('img_phu')) {
                foreach ($request->file('img_phu') as $file) {
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $file->move(public_path('product_images'), $fileName);
                    $newAdditionalImgPublicUrls[] = url('product_images/' . $fileName);
                }
            }

            $product->update([
                'name'            => $request->name,
                'id_category'     => $request->id_category,
                'id_brand'        => $request->id_brand,
                'description'     => $request->description,
                'technical_specs' => $request->technical_specs,
                'price'           => $request->price,
                'discount'        => $request->discount ?? 0,
                'is_featured'     => $isFeatured,
                'status'          => $status,
                'img'             => $mainImgPublicUrl,
                'img_phu'         => $newAdditionalImgPublicUrls,
            ]);

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

    /* |  Ẩn sản phẩm */
    public function hideProduct($id)
    {
        $product = Product::withoutGlobalScopes(['visible'])->find($id);
        if (! $product) {
return response()->json(['message' => 'Sản phẩm không tồn tại.'], 404);
        }
        $product->status = 1;
        $product->save();
        return response()->json(['message' => 'Sản phẩm đã được ẩn thành công.']);
    }

    /* |  Hiện sản phẩm */
    public function unhideProduct($id)
    {
        $product = Product::withoutGlobalScopes(['visible'])->find($id);
        if (! $product) {
            return response()->json(['message' => 'Sản phẩm không tồn tại.'], 404);
        }
        $product->status = 0;
        $product->save();
        return response()->json(['message' => 'Sản phẩm đã được hiện thành công.']);
    }
}
