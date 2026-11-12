<?php

// app/Http/Controllers/Admin/VoucherController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    // Danh sách voucher
    public function index()
    {
        return response()->json(Voucher::all());
    }

    // Thêm mớis
    public function store(Request $request)
    {
        $request->validate([
            'code'     => 'required|string|unique:vouchers,code',
            'discount' => 'required|integer|min:1',
            'type'     => 'required|in:percentage,fixed',
            'active'   => 'required|boolean',
        ]);

        $voucher = Voucher::create($request->all());

        return response()->json(['message' => 'Voucher created', 'voucher' => $voucher], 201);
    }

    // Cập nhật
    public function update(Request $request, $id)
    {
        $voucher = Voucher::findOrFail($id);

        $request->validate([
            'code'     => 'required|string|unique:vouchers,code,' . $id . ',id_voucher',
            'discount' => 'required|integer|min:1',
            'type'     => 'required|in:percentage,fixed',
            'active'   => 'required|boolean',
        ]);

        $voucher->update($request->all());

        return response()->json(['message' => 'Voucher updated', 'voucher' => $voucher]);
    }

    // Xóa
    public function destroy($id)
    {
        Voucher::destroy($id);

        return response()->json(['message' => 'Voucher deleted']);
    }

    // Thay đổi trạng thái (bật/tắt voucher)
    public function toggleActive($id)
    {
        $voucher         = Voucher::findOrFail($id);
        $voucher->active = ! $voucher->active;
        $voucher->save();

        return response()->json(['message' => 'Status updated', 'active' => $voucher->active]);
    }
}
