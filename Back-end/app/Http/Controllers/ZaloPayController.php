<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\{Bill, BillDetail, Product, Discount};

class ZaloPayController extends Controller
{
    private $app_id;
    private $key1;
    private $key2;
    private $endpoint;
    private $callback_url;

    public function __construct()
    {
        $this->app_id = config('services.zalopay.app_id');
        $this->key1 = config('services.zalopay.key1');
        $this->key2 = config('services.zalopay.key2');
        $this->endpoint = config('services.zalopay.endpoint');
        $this->callback_url = config('services.zalopay.callback_url');

        if (
            empty($this->app_id) || empty($this->key1) || empty($this->key2) ||
            empty($this->endpoint) || empty($this->callback_url)
        ) {
            throw new \Exception('Cấu hình ZaloPay bị thiếu hoặc không hợp lệ.');
        }
    }

    public function createPayment($validated, $bill)
    {
        try {
            $discountCode = $validated['discount_code'] ?? null;
            $totalPrice = $validated['total_price'];
            $totalVND = $this->applyDiscount($discountCode, $totalPrice);

            $embeddata = json_encode(['redirecturl' => 'http://127.0.0.1:8000/dashboard']);
            $item = json_encode($validated['products']);
            $bill_code = date("ymd") . "_" . time();
            Cache::put("zalopay_bill_{$bill_code}", $bill->id_bill, now()->addHour());
            $apptime = round(microtime(true) * 1000);

            $data = [
                "appid" => $this->app_id,
                "appuser" => "user_" . $bill->id_user,
                "apptime" => $apptime,
                "amount" => $totalVND,
                "apptransid" => $bill_code,
                "embeddata" => $embeddata,
                "item" => $item,
                "bankcode" => "",
                "description" => "Thanh toán hóa đơn #{$bill->id_bill}",
                "callbackurl" => $this->callback_url
            ];

            $data["mac"] = hash_hmac("sha256", implode("|", [
                $this->app_id,
                $bill_code,
                "user_" . $bill->id_user,
                $totalVND,
                $apptime,
                $embeddata,
                $item
            ]), $this->key1);

            // $response = Http::asForm()->post($this->endpoint, $data)->json();
            $response = Http::withOptions([
            'verify' => false // ❗️tắt kiểm tra SSL – chỉ dùng để test local
            ])->asForm()->post($this->endpoint, $data)->json();

            if (isset($response["returncode"]) && $response["returncode"] == 1) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Tạo yêu cầu thanh toán ZaloPay thành công',
                    'redirect_url' => $response['orderurl'],
                    'bill_id' => $bill->id_bill,
                ]);
            }

            return response()->json([
                'status' => 400,
                'message' => 'Lỗi tạo yêu cầu thanh toán ZaloPay: ' . ($response['returnmessage'] ?? 'Không rõ lý do.'),
                'error_code' => $response['returncode'] ?? null,
                'sub_error_code' => $response['subreturncode'] ?? null,
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => 'Lỗi xử lý ZaloPay: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function applyDiscount(?string $discountCode, float $totalPrice): int
    {
        return (int) round($totalPrice); // đơn giản nếu không tính giảm giá
    }

    public function ZaloPaySuccess(Request $request)
    {
        try {
            $data = $request->input('data');
            $mac = $request->input('mac');
            $calculatedMac = hash_hmac('sha256', $data, $this->key2);

            if ($mac !== $calculatedMac) {
                return response()->json(['returncode' => -1, 'returnmessage' => 'Sai chữ ký']);
            }

            $callbackData = json_decode($data, true);
            $bill_code = $callbackData['apptransid'];
            $billId = Cache::get("zalopay_bill_{$bill_code}");

            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['returncode' => -1, 'returnmessage' => 'Không tìm thấy hóa đơn']);
            }

            if ($bill->payment_status === 'pending') {
                if ($callbackData['returncode'] == 1) {
                    $bill->payment_status = 'paid';
                } elseif ($callbackData['returncode'] == 2) {
                    $bill->payment_status = 'failed';
                }
                $bill->save();
            }

            return response()->json(['returncode' => 1, 'returnmessage' => 'Thành công']);
        } catch (\Exception $e) {
            return response()->json(['returncode' => -1, 'returnmessage' => 'Lỗi: ' . $e->getMessage()]);
        }
    }

    public function ZaloPayCancel(Request $request)
    {
        try {
            $billId = $request->input('bill_id');
            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['status' => 404, 'message' => 'Không tìm thấy hóa đơn'], 404);
            }

            if ($bill->payment_status !== 'pending') {
                return response()->json(['status' => 400, 'message' => 'Không thể hủy vì không ở trạng thái chờ thanh toán'], 400);
            }

            $billDetails = BillDetail::where('id_bill', $bill->id_bill)->get();

            foreach ($billDetails as $detail) {
                $product = Product::find($detail->id_product);
                if ($product) {
                    $product->stock_quantity += $detail->quantity;
                    $product->sold -= $detail->quantity;
                    $product->save();
                }
            }

            $bill->payment_status = 'cancelled';
            $bill->save();

            return response()->json(['status' => 200, 'message' => 'Hủy hóa đơn thành công và đã hoàn kho']);
        } catch (\Exception $e) {
            return response()->json(['status' => 500, 'message' => 'Lỗi khi hủy hóa đơn: ' . $e->getMessage()], 500);
        }
    }
}
