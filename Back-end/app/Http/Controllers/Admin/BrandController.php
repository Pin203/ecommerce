<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    // GET: Danh sách thương hiệu
    public function index()
    {
        return Brand::all();
    }

    // POST: Thêm thương hiệu
     public function store(Request $request)
    {
        // 1. Validate dữ liệu đầu vào: Tên là bắt buộc, chuỗi, tối đa 255 ký tự và duy nhất
        $request->validate([
            'name' => 'required|string|max:255|unique:brand,name',
        ]);

        // 2. Tạo thương hiệu mới trong cơ sở dữ liệu chỉ với tên
        $brand = Brand::create([
            'name' => $request->name,
        ]);

        // 3. Trả về thông tin thương hiệu vừa tạo với mã 201 Created
        return response()->json($brand, 201);
    }
    // PUT: Sửa thương hiệu
   public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                // SỬA DÒNG NÀY: Dùng Rule::unique và chỉ rõ tên cột ID
                Rule::unique('brand')->ignore($id, 'id_brand'), // <-- Sửa tại đây
            ],
        ]);

        // 3. Cập nhật tên thương hiệu trong cơ sở dữ liệu
        $brand->update([
            'name' => $request->name,
        ]);

        // 4. Trả về thông tin thương hiệu đã cập nhật
        return response()->json($brand);
    }
}
