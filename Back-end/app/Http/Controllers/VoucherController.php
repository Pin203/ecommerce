<?php
namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VoucherController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'code'  => 'nullable|string', // ❌ không bắt buộc nữa
            'total' => 'required|numeric|min:0',
        ]);

        $voucher = Voucher::where('code', $request->code)
            ->where('active', 1)
            ->first();

        if (! $voucher) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn!',
            ], 400);
        }

        $subtotal    = $request->total; // tiền hàng trước ship
        $shippingFee = 30000;           // phí ship cố định

        // Tính giảm giá
        $discount = 0;
        if ($voucher->type === 'percentage') {
            $discount = $subtotal * ($voucher->discount / 100);
        } elseif ($voucher->type === 'fixed') {
            $discount = $voucher->discount;
        }

        // Không cho giảm quá tiền hàng
        $discount = min($discount, $subtotal);

        // Tổng sau giảm nhưng chưa cộng ship
        $totalAfterDiscount = $subtotal - $discount;

        // Tổng cuối cùng = sau giảm + ship
        $finalTotal = $totalAfterDiscount + $shippingFee;

        return response()->json([
            'success'      => true,
            'voucher_id'   => $voucher->id_voucher,
            'code'         => $voucher->code,
            'discount'     => $discount,
            'shipping_fee' => $shippingFee,
            'new_total'    => $finalTotal,
        ]);
    }
}