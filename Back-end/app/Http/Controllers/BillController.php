<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ZaloPayController;
use App\Models\Bill;
use App\Models\BillDetail;
use App\Models\Cart;
use App\Models\ProductDetail;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BillController extends Controller
{
    public function processPayment(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'status'  => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để thanh toán.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $validated = $request->validate([
            'products'              => 'nullable|array|min:1',
            'products.*.product_id' => 'required|integer|exists:productdetail,id_product_detail',
            'products.*.quantity'   => 'required|integer|min:1|max:1000',
            'products.*.price'      => 'required|numeric|min:0',
            'phone'                 => 'required|regex:/^[0-9]{9,12}$/',
            'address'               => 'required|string|max:255',
            'payment_id'            => 'required|string', // 'COD' / 'ZaloPay'
            'total_price'           => 'required|numeric|min:1000',
            'voucher'               => 'nullable|string|max:50',
        ]);

        $originalTotal = collect($validated['products'] ?? [])
            ->sum(fn ($p) => $p['price'] * $p['quantity']);
        $shippingFee = 30000;

        $voucherDiscount = 0;
        $voucherId       = null;

        if (! empty($validated['voucher'])) {
            $voucher = Voucher::where('code', $validated['voucher'])
                ->where('active', true)
                ->first();

            if (! $voucher) {
                return response()->json([
                    'status'  => Response::HTTP_BAD_REQUEST,
                    'message' => 'Voucher không hợp lệ hoặc đã hết hạn.',
                ], Response::HTTP_BAD_REQUEST);
            }

            if ($voucher->type === 'fixed') {
                $voucherDiscount = $voucher->discount;
            } elseif ($voucher->type === 'percentage') {
                $voucherDiscount = ($voucher->discount / 100) * $originalTotal;
            }

            $voucherDiscount = min($voucherDiscount, $originalTotal);
            $voucherId       = $voucher->id_voucher;
        }

        $calculatedTotal = $originalTotal + $shippingFee - $voucherDiscount;

        if (abs($calculatedTotal - $validated['total_price']) > 0.01) {
            return response()->json([
                'status'  => Response::HTTP_BAD_REQUEST,
                'message' => 'Tổng giá không khớp.',
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->handlePayment(
            $validated['payment_id'],
            [
                'products'          => $validated['products'],
                'phone'             => $validated['phone'],
                'address'           => $validated['address'],
                'payment_id'        => $validated['payment_id'],
                'shipping_fee'      => $shippingFee,
                'voucher_discount'  => $voucherDiscount,
                'id_voucher'        => $voucherId,
                'total_price'       => $calculatedTotal,
            ],
            $user
        );
    }

    private function handlePayment(string $paymentMethod, array $validated, $user)
    {
        $handlers = [
            'COD'     => function () use ($validated, $user) {
                return $this->createBillAndProcessOrder($validated, $user, 'COD', 'unpaid');
            },
            'ZaloPay' => function () use ($validated, $user) {
                $controller = app(ZaloPayController::class);
                return $controller->createPaymentRequest($validated, $user);
            },
            'VNPay' => function () use ($validated, $user) {
                $controller = app(\App\Http\Controllers\VNPayController::class);
                return $controller->createPayment($validated, $user);
            },
        ];

        if (! isset($handlers[$paymentMethod])) {
            return response()->json([
                'status'  => Response::HTTP_BAD_REQUEST,
                'message' => 'Phương thức thanh toán không hợp lệ.',
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $response = $handlers[$paymentMethod]();
            return response()->json($response, Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error("Lỗi thanh toán $paymentMethod: " . $e->getMessage());
            return response()->json([
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi xử lý thanh toán.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function createBillAndProcessOrder(array $validated, $user, string $paymentMethod, string $paymentStatus = 'unpaid')
    {
        try {
            DB::beginTransaction();

            if (empty($validated['products'])) {
                $validated['products'] = Cart::where('id_user', $user->id_user)
                    ->select('id_productdetail as product_id', 'quantity', 'price')
                    ->get()
                    ->toArray();
            }

            $productDetailIds = collect($validated['products'])->pluck('product_id');
            $details          = ProductDetail::whereIn('id_product_detail', $productDetailIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id_product_detail');

            foreach ($validated['products'] as $product) {
                $item = $details->get($product['product_id']);
                if (! $item || $item->sl < $product['quantity']) {
                    throw new \Exception("Sản phẩm ID {$product['product_id']} không đủ hàng.");
                }
            }

            // $bill = Bill::create([
            //     'id_user'             => $user->id_user,
            //     'hoten_nguoinhan'     => $user->name,
            //     'diachi_nguoinhan'    => $validated['address'],
            //     'dienthoai_nguoinhan' => $validated['phone'],
            //     'pttt'                => $paymentMethod,
            //     'ngaydat'             => now(),
            //     'id_voucher'          => $voucherId ?? null,
            //     'voucher_discount'    => $voucherDiscount ?? 0,
            //     'total'               => $validated['total_price'],
            //     'order_status'        => 'pending',
            //     'payment_status'      => $paymentStatus,
            // ]);
            $bill = Bill::create([
                'id_user'             => $user->id_user,
                'hoten_nguoinhan'     => $user->name,
                'diachi_nguoinhan'    => $validated['address'],
                'dienthoai_nguoinhan' => $validated['phone'],
                'pttt'                => $paymentMethod,
                'ngaydat'             => now(),
                'id_voucher'          => $validated['id_voucher'] ?? null,
                'voucher_discount'    => $validated['voucher_discount'] ?? 0,
                'total'               => $validated['total_price'],
                'order_status'        => 'pending',
                'payment_status'      => $paymentStatus,
            ]);


            $billDetails = collect($validated['products'])->map(function ($product) use ($bill) {
                return [
                    'id_bill'          => $bill->id_bill,
                    'id_productdetail' => $product['product_id'],
                    'quantity'         => $product['quantity'],
                    'price'            => $product['price'],
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            })->toArray();

            BillDetail::insert($billDetails);

            foreach ($validated['products'] as $product) {
                $details->get($product['product_id'])->decrement('sl', $product['quantity']);
            }

            Cart::where('id_user', $user->id_user)
                ->whereIn('id_productdetail', $productDetailIds)
                ->delete();

            DB::commit();

            return [
                'status'         => 200,
                'message'        => 'Đã tạo đơn hàng thành công.',
                'bill_id'        => $bill->id_bill,
                'payment_status' => $paymentStatus,
            ];

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Lỗi khi tạo bill: {$e->getMessage()}");
            return [
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi tạo hóa đơn: ' . $e->getMessage(),
            ];
        }
    }

    public function getUserBills(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'status'  => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để xem đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $bills = Bill::where('id_user', $user->id_user)
                ->with([
                    'details.productDetail.product',
                    'details.productDetail.color',
                    'details.productDetail.size',
                ])
                ->orderBy('ngaydat', 'desc')
                ->get();

            return response()->json([
                'status' => Response::HTTP_OK,
                'bills'  => $bills,
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy danh sách đơn hàng cho người dùng {$user->id_user}: {$e->getMessage()}");
            return response()->json([
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy danh sách đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function getUserBillById($id_bill)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'status'  => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để xem đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $bill = Bill::where('id_bill', $id_bill)
                ->where('id_user', $user->id_user)
                ->with([
                    'details.productDetail.product',
                    'details.productDetail.color',
                    'details.productDetail.size',
                ])
                ->first();

            if (! $bill) {
                return response()->json([
                    'status'  => Response::HTTP_NOT_FOUND,
                    'message' => 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.',
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'bill'   => $bill,
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy đơn hàng ID {$id_bill} cho người dùng {$user->id_user}: {$e->getMessage()}");
            return response()->json([
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function cancelOrder(Bill $bill)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json([
                'status'  => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để hủy đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($bill->id_user !== $user->id_user) {
            return response()->json([
                'status'  => Response::HTTP_FORBIDDEN,
                'message' => 'Bạn không có quyền hủy đơn hàng này.',
            ], Response::HTTP_FORBIDDEN);
        }

        $cancellableStatuses = ['pending', 'payment_pending'];

        if (in_array($bill->order_status, $cancellableStatuses)) {
            DB::transaction(function () use ($bill) {
                $bill->order_status   = 'cancelled';
                $bill->payment_status = 'cancelled';
                $bill->save();

                foreach ($bill->details as $detail) {
                    $productDetail = ProductDetail::find($detail->id_productdetail);
                    if ($productDetail) {
                        $productDetail->increment('sl', $detail->quantity);
                    }
                }
            });

            return response()->json([
                'status'  => Response::HTTP_OK,
                'message' => 'Đơn hàng đã được hủy thành công. Số lượng sản phẩm đã được hoàn lại.',
                'bill'    => $bill,
            ], Response::HTTP_OK);
        }

        return response()->json([
            'status'  => Response::HTTP_BAD_REQUEST,
            'message' => 'Đơn hàng không thể hủy ở trạng thái hiện tại.',
        ], Response::HTTP_BAD_REQUEST);
    }
}
