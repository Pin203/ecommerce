<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\{Auth, DB, Log};
use App\Models\{Bill, BillDetail, Product, Discount, ProductDetail, Cart};

class ZaloPayController extends Controller
{
    private $app_id;
    private $key1;
    private $key2;
    private $endpoint;

    public function __construct()
    {
        $this->app_id = config('services.zalopay.app_id');
        $this->key1 = config('services.zalopay.key1');
        $this->key2 = config('services.zalopay.key2');
        $this->endpoint = config('services.zalopay.endpoint');

        if (
            empty($this->app_id) || empty($this->key1) || empty($this->key2) ||
            empty($this->endpoint)
        ) {
            throw new \Exception('Cấu hình ZaloPay bị thiếu hoặc không hợp lệ.');
        }
    }

    public function createPaymentRequest(array $validated, $user)
    {
        try {
            // Bước 1: Tạo hóa đơn nháp
            $bill = Bill::create([
                'id_user' => $user->id_user,
                'hoten_nguoinhan' => $user->name,
                'diachi_nguoinhan' => $validated['address'],
                'dienthoai_nguoinhan' => $validated['phone'],
                'pttt' => 'ZaloPay',
                'ngaydat' => now(),
                'id_voucher' => $validated['id_voucher'] ?? null,
                'voucher_discount' => $validated['voucher_discount'] ?? 0,
                'total' => $validated['total_price'],
                'order_status' => 'pending',
                'payment_status' => 'paid',
            ]);

            // Bước 2: Lưu chi tiết hóa đơn vào cache
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
            Cache::put("zalopay_bill_details_{$bill->id_bill}", $billDetailsData, now()->addHours(2));

            // Bước 3: Giảm tồn kho và xóa giỏ hàng
            DB::transaction(function () use ($bill, $billDetailsData) {
                $productDetailIds = collect($billDetailsData)->pluck('id_productdetail');
                foreach ($billDetailsData as $detail) {
                    ProductDetail::find($detail['id_productdetail'])->decrement('sl', $detail['quantity']);
                }
                Cart::where('id_user', $bill->id_user)
                    ->whereIn('id_productdetail', $productDetailIds)
                    ->delete();
                BillDetail::insert($billDetailsData);
            });

            // Bước 4: Tạo yêu cầu thanh toán ZaloPay
            $totalVND = (int) round($validated['total_price']);
            $embeddata = json_encode(['redirecturl' => 'http://localhost:3000/my-orders?bill_id=' . $bill->id_bill]);
            $item = json_encode($validated['products']);
            $apptransid = date("ymd") . "_" . time() . "_" . $bill->id_bill;
            Cache::put("zalopay_apptransid_{$apptransid}", $bill->id_bill, now()->addHours(2));
            $apptime = round(microtime(true) * 1000);

            $data = [
                "appid" => $this->app_id,
                "appuser" => "user_" . $user->id_user,
                "apptime" => $apptime,
                "amount" => $totalVND,
                "apptransid" => $apptransid,
                "embeddata" => $embeddata,
                "item" => $item,
                "bankcode" => "",
                "description" => "Thanh toán hóa đơn #{$bill->id_bill}",
            ];

            $data["mac"] = hash_hmac("sha256", implode("|", [
                $this->app_id,
                $apptransid,
                "user_" . $user->id_user,
                $totalVND,
                $apptime,
                $embeddata,
                $item
            ]), $this->key1);

            // Bước 5: Gọi API ZaloPay
            Log::info('Yêu cầu ZaloPay:', $data);
            $response = Http::withOptions(['verify' => false])->asForm()->post($this->endpoint, $data)->json();
            Log::info('Phản hồi từ ZaloPay:', $response ?? ['error' => 'Không có phản hồi']);

            if (isset($response["returncode"]) && $response["returncode"] == 1) {
                return [
                    'status' => 200,
                    'message' => 'Tạo yêu cầu thanh toán ZaloPay thành công',
                    'redirect_url' => $response['orderurl'],
                    'bill_id' => $bill->id_bill,
                ];
            }

            // Nếu lỗi, xóa hóa đơn và hoàn lại tồn kho/giỏ hàng
            DB::transaction(function () use ($bill, $billDetailsData) {
                foreach ($billDetailsData as $detail) {
                    ProductDetail::find($detail['id_productdetail'])->increment('sl', $detail['quantity']);
                }
                $cartData = collect($billDetailsData)->map(function ($detail) use ($bill) {
                    return [
                        'id_user' => $bill->id_user,
                        'id_productdetail' => $detail['id_productdetail'],
                        'quantity' => $detail['quantity'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();
                Cart::insert($cartData);
                $bill->delete();
            });
            return [
                'status' => 400,
                'message' => 'Lỗi tạo yêu cầu thanh toán ZaloPay: ' . ($response['returnmessage'] ?? 'Không rõ lý do.'),
                'error_code' => $response['returncode'] ?? null,
                'sub_error_code' => $response['subreturncode'] ?? null,
            ];

        } catch (\Exception $e) {
            if (isset($bill) && $bill->exists) {
                DB::transaction(function () use ($bill, $billDetailsData) {
                    foreach ($billDetailsData as $detail) {
                        ProductDetail::find($detail['id_productdetail'])->increment('sl', $detail['quantity']);
                    }
                    $cartData = collect($billDetailsData)->map(function ($detail) use ($bill) {
                        return [
                            'id_user' => $bill->id_user,
                            'id_productdetail' => $detail['id_productdetail'],
                            'quantity' => $detail['quantity'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    })->toArray();
                    Cart::insert($cartData);
                    $bill->delete();
                });
            }
            Log::error('Lỗi xử lý ZaloPay: ' . $e->getMessage(), ['exception' => $e]);
            return [
                'status' => 500,
                'message' => 'Lỗi xử lý ZaloPay: ' . $e->getMessage(),
            ];
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

            DB::transaction(function () use ($bill) {
                $bill->order_status = 'cancelled';
                $bill->payment_status = 'failed';
                $bill->save();

                $billDetailsData = Cache::get("zalopay_bill_details_{$bill->id_bill}");
                if ($billDetailsData) {
                    foreach ($billDetailsData as $detail) {
                        ProductDetail::find($detail['id_productdetail'])->increment('sl', $detail['quantity']);
                    }
                    // Phục hồi giỏ hàng
                    $cartData = collect($billDetailsData)->map(function ($detail) use ($bill) {
                        return [
                            'id_user' => $bill->id_user,
                            'id_productdetail' => $detail['id_productdetail'],
                            'quantity' => $detail['quantity'],
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    })->toArray();
                    Cart::insert($cartData);
                }
            });

            Cache::forget("zalopay_bill_details_{$bill->id_bill}");
            Log::info('Hủy hóa đơn ZaloPay thành công, tồn kho và giỏ hàng được hoàn lại.', ['id_bill' => $billId]);
            return response()->json(['status' => 200, 'message' => 'Hủy hóa đơn thành công, tồn kho và giỏ hàng đã được hoàn lại']);

        } catch (\Exception $e) {
            Log::error('Lỗi khi hủy hóa đơn: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['status' => 500, 'message' => 'Lỗi khi hủy hóa đơn: ' . $e->getMessage()], 500);
        }
    }

    public function checkPaymentStatus(Request $request, $billId)
    {
        try {
            $bill = Bill::find($billId);
            if (!$bill) {
                return response()->json(['status' => 404, 'message' => 'Không tìm thấy hóa đơn'], 404);
            }

            return response()->json([
                'status' => 200,
                'bill' => [
                    'id_bill' => $bill->id_bill,
                    'order_status' => $bill->order_status,
                    'payment_status' => $bill->payment_status,
                    'total' => $bill->total,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi khi kiểm tra trạng thái thanh toán: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['status' => 500, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}
