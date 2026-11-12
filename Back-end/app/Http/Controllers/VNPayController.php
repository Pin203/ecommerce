<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{DB, Log, Cache};
use App\Models\{Bill, BillDetail, ProductDetail, Cart};

class VNPayController extends Controller
{
    private $tmn_code;
    private $hash_secret;
    private $url;
    private $return_url;

    public function __construct()
    {
        $this->tmn_code = config('services.vnpay.tmn_code');
        $this->hash_secret = config('services.vnpay.hash_secret');
        $this->url = config('services.vnpay.url');
        $this->return_url = config('services.vnpay.return_url');

        $missingConfigs = [];
        if (empty($this->tmn_code)) {
            $missingConfigs[] = 'tmn_code';
        }
        if (empty($this->hash_secret)) {
            $missingConfigs[] = 'hash_secret';
        }
        if (empty($this->url)) {
            $missingConfigs[] = 'url';
        }
        if (empty($this->return_url)) {
            $missingConfigs[] = 'return_url';
        }
        if ($missingConfigs) {
            throw new \Exception('Cấu hình VNPay bị thiếu: ' . implode(', ', $missingConfigs));
        }
    }

    public function createPayment(array $validated, $user)
    {
        try {
            $bill = Bill::create([
                'id_user' => $user->id_user,
                'hoten_nguoinhan' => $user->name,
                'diachi_nguoinhan' => $validated['address'],
                'dienthoai_nguoinhan' => $validated['phone'],
                'pttt' => 'VNPay',
                'ngaydat' => now(),
                'id_voucher' => $validated['id_voucher'] ?? null,
                'voucher_discount' => $validated['voucher_discount'] ?? 0,
                'total' => $validated['total_price'],
                'order_status' => 'payment_pending',
                'payment_status' => 'unpaid',
            ]);

            $billDetailsData = collect($validated['products'])->map(function ($product) use ($bill) {
                return [
                    'id_bill' => $bill->id_bill,
                    'id_productdetail' => $product['product_id'],
                    'quantity' => $product['quantity'],
                    'price' => $product['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();

            Cache::put("vnpay_bill_details_{$bill->id_bill}", $billDetailsData, now()->addHour());

            $vnp_TxnRef = $bill->id_bill . '_' . time();
            $vnp_Amount = round($validated['total_price'] * 100);
            $vnp_CreateDate = date('YmdHis');
            $vnp_IpAddr = request()->ip();

            $inputData = [
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => $this->tmn_code,
                "vnp_Amount" => $vnp_Amount,
                "vnp_Command" => "pay",
                "vnp_CreateDate" => $vnp_CreateDate,
                "vnp_CurrCode" => "VND",
                "vnp_IpAddr" => $vnp_IpAddr,
                "vnp_Locale" => 'vn',
                "vnp_OrderInfo" => "Thanh toán hóa đơn #{$bill->id_bill}",
                "vnp_OrderType" => 'billpayment',
                "vnp_ReturnUrl" => $this->return_url,
                "vnp_TxnRef" => $vnp_TxnRef,
            ];

            ksort($inputData);
            $query = http_build_query($inputData);
            $vnp_SecureHash = hash_hmac('sha512', $query, $this->hash_secret);
            $vnp_Url = $this->url . "?" . $query . "&vnp_SecureHash=" . $vnp_SecureHash;

            Log::info('VNPay payment request created:', [
                'bill_id' => $bill->id_bill,
                'vnp_TxnRef' => $vnp_TxnRef,
                'amount' => $validated['total_price'],
                'url' => $vnp_Url,
            ]);

            return [
                'status' => 200,
                'message' => 'Yêu cầu thanh toán VNPay đã được tạo',
                'redirect_url' => $vnp_Url,
                'bill_id' => $bill->id_bill,
            ];
        } catch (\Exception $e) {
            Log::error('VNPay createPayment error:', ['message' => $e->getMessage()]);
            return [
                'status' => 500,
                'message' => 'Lỗi tạo yêu cầu thanh toán VNPay: ' . $e->getMessage(),
            ];
        }
    }

    public function handleVnpayIpn(Request $request)
    {
        try {
            $vnp_SecureHash = $request->input('vnp_SecureHash');
            $inputData = $request->except('vnp_SecureHash', 'vnp_SecureHashType');
            ksort($inputData);
            $hashData = http_build_query($inputData);
            $calculatedHash = hash_hmac('sha512', $hashData, $this->hash_secret);

            if ($vnp_SecureHash !== $calculatedHash) {
                return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
            }

            $billId = explode('_', $request->input('vnp_TxnRef'))[0] ?? null;
            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['RspCode' => '01', 'Message' => 'Bill not found']);
            }

            $vnpAmount = (int) ($request->input('vnp_Amount') / 100);
            if ($vnpAmount !== $bill->total) {
                return response()->json(['RspCode' => '04', 'Message' => 'Amount mismatch']);
            }

            if ($bill->payment_status === 'unpaid') {
                $success = $request->input('vnp_ResponseCode') === '00';
                DB::transaction(function () use ($bill, $success) {
                    $bill->payment_status = $success ? 'paid' : 'failed';
                    $bill->order_status = $success ? 'pending' : 'cancelled';
                    $bill->save();

                    if ($success) {
                        $billDetailsData = Cache::get("vnpay_bill_details_{$bill->id_bill}");
                        if ($billDetailsData) {
                            BillDetail::insert($billDetailsData);
                            foreach ($billDetailsData as $detail) {
                                ProductDetail::find($detail['id_productdetail'])->decrement('sl', $detail['quantity']);
                            }
                            $productDetailIds = collect($billDetailsData)->pluck('id_productdetail');
                            Cart::where('id_user', $bill->id_user)->whereIn('id_productdetail', $productDetailIds)->delete();
                        }
                        Cache::forget("vnpay_bill_details_{$bill->id_bill}");
                    }
                });
            }

            return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);
        } catch (\Exception $e) {
            Log::error('VNPay IPN error:', ['message' => $e->getMessage()]);
            return response()->json(['RspCode' => '99', 'Message' => 'Exception: ' . $e->getMessage()]);
        }
    }

    public function handleVnpayReturn(Request $request)
    {
        try {
            $vnp_SecureHash = $request->input('vnp_SecureHash');
            $inputData = $request->except('vnp_SecureHash', 'vnp_SecureHashType');
            ksort($inputData);
            $calculatedHash = hash_hmac('sha512', http_build_query($inputData), $this->hash_secret);

            if ($vnp_SecureHash !== $calculatedHash) {
                return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
            }

            $billId = explode('_', $request->input('vnp_TxnRef'))[0] ?? null;
            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['status' => 'error', 'message' => 'Bill not found'], 404);
            }

            $message = $request->input('vnp_ResponseCode') === '00' ? 'Thanh toán thành công' : 'Thanh toán thất bại';

            return response()->json([
                'status' => 'success',
                'message' => $message,
                'bill_id' => $bill->id_bill
            ]);
        } catch (\Exception $e) {
            Log::error('VNPay return error:', ['message' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Lỗi xử lý phản hồi: ' . $e->getMessage()], 500);
        }
    }

    public function handleVnpayCancel(Request $request)
    {
        try {
            $billId = $request->input('bill_id');
            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['status' => 404, 'message' => 'Không tìm thấy hóa đơn'], 404);
            }

            if ($bill->payment_status !== 'unpaid') {
                return response()->json(['status' => 400, 'message' => 'Không thể hủy vì không ở trạng thái chờ thanh toán'], 400);
            }

            $billDetails = BillDetail::where('id_bill', $bill->id_bill)->get();
            DB::transaction(function () use ($bill, $billDetails) {
                foreach ($billDetails as $detail) {
                    $product = ProductDetail::find($detail->id_productdetail);
                    if ($product) {
                        $product->increment('sl', $detail->quantity);
                    }
                }
                $bill->payment_status = 'cancelled';
                $bill->order_status = 'cancelled';
                $bill->save();
            });

            return response()->json(['status' => 200, 'message' => 'Hủy hóa đơn thành công và hoàn kho']);
        } catch (\Exception $e) {
            Log::error('VNPay cancel error:', ['message' => $e->getMessage()]);
            return response()->json(['status' => 500, 'message' => 'Lỗi khi hủy hóa đơn: ' . $e->getMessage()], 500);
        }
    }
}
