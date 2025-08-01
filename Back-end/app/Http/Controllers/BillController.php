<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\{Bill, BillDetail, ProductDetail, Cart,Voucher, Product, Color, Size}; // Đảm bảo import đầy đủ các Models
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Log};
use Symfony\Component\HttpFoundation\Response;
use App\Http\Controllers\ZaloPayController;

class BillController extends Controller
{
 
    public function processPayment(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để thanh toán.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $validated = $request->validate([
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|integer|exists:product,id_product',
            'products.*.quantity' => 'required|integer|min:1|max:1000',
            'products.*.price' => 'required|numeric|min:0',
            'phone' => 'required|regex:/^[0-9]{9,12}$/',
            'address' => 'required|string|max:255',
            'payment_id' => 'required|string', // 'COD' / 'ZaloPay'
            'total_price' => 'required|numeric|min:1000',
            'voucher' => 'nullable|string|max:50'
        ]);

        // Tính tổng giá trị gốc
        $originalTotal = collect($validated['products'])
            ->sum(fn ($p) => $p['price'] * $p['quantity']);
        $shippingFee = 30000;

        // Áp dụng voucher nếu có
        $voucherDiscount = 0;
        $voucherId = null;

        if (!empty($validated['voucher'])) {
            $voucher = Voucher::where('code', $validated['voucher'])
                ->where('active', true)
                ->first();

            if (!$voucher) {
                return response()->json([
                    'status' => Response::HTTP_BAD_REQUEST,
                    'message' => 'Voucher không hợp lệ hoặc đã hết hạn.'
                ], Response::HTTP_BAD_REQUEST);
            }

            if ($voucher->type === 'fixed') {
                $voucherDiscount = $voucher->discount;
            } elseif ($voucher->type === 'percentage') {
                $voucherDiscount = ($voucher->discount / 100) * $originalTotal;
            }

            // Giới hạn giảm không vượt quá tổng đơn hàng
            $voucherDiscount = min($voucherDiscount, $originalTotal);
            $voucherId = $voucher->id_voucher;
        }

        $calculatedTotal = $originalTotal + $shippingFee - $voucherDiscount;

        if (abs($calculatedTotal - $validated['total_price']) > 0.01) {
            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'message' => 'Tổng giá không khớp.',
            ], Response::HTTP_BAD_REQUEST);
        }

        return $this->handleBillCreation(
            $validated + [
                'shipping_fee' => $shippingFee,
                'voucher_discount' => $voucherDiscount,
                'id_voucher' => $voucherId,
            ],
            $user
        );
    }

    private function handleBillCreation(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            try {
                $productDetailIds = collect($validated['products'])->pluck('product_id');
                $details = ProductDetail::whereIn('id_product_detail', $productDetailIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id_product_detail');

                foreach ($validated['products'] as $product) {
                    $item = $details->get($product['product_id']);
                    if (!$item || $item->sl < $product['quantity']) {
                        throw new \Exception("Sản phẩm ID {$product['product_id']} không đủ hàng.");
                    }
                }

                $bill = Bill::create([
                    'id_user' => $user->id_user,
                    'hoten_nguoinhan' => $user->name,
                    'diachi_nguoinhan' => $validated['address'],
                    'dienthoai_nguoinhan' => $validated['phone'],
                    'pttt' => $validated['payment_id'],
                    'ngaydat' => now(),
                    'id_voucher' => $validated['id_voucher'] ?? null,
                    'voucher_discount' => $validated['voucher_discount'] ?? 0,
                    'total' => $validated['total_price'],
                ]);

                $billDetails = collect($validated['products'])->map(function ($product) use ($bill) {
                    return [
                        'id_bill' => $bill->id_bill,
                        'id_productdetail' => $product['product_id'],
                        'quantity' => $product['quantity'],
                        'price' => $product['price'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();

                BillDetail::insert($billDetails);

                foreach ($validated['products'] as $product) {
                    $details->get($product['product_id'])->decrement('sl', $product['quantity']);
                }

                Cart::where('id_user', $user->id_user)
                    ->whereIn('id_productdetail', $productDetailIds)
                    ->delete();

                Log::info('Đơn hàng đã tạo (Bill)', ['id_bill' => $bill->id_bill]);

                return $this->handlePayment($validated['payment_id'], $bill);
            } catch (\Throwable $e) {
                Log::error("Lỗi khi tạo bill: {$e->getMessage()}");
                return response()->json([
                    'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                    'message' => 'Lỗi tạo hóa đơn: ' . $e->getMessage()
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        });
    }

    private function handlePayment(string $paymentMethod, Bill $bill)
    {
        $handlers = [
            'COD' => fn () => [
                'status' => 200,
                'message' => 'Đã tạo đơn hàng COD',
                'bill_id' => $bill->id_bill,
                'voucher_discount' => $bill->voucher_discount,
                'id_voucher' => $bill->id_voucher,
            ],
            'ZaloPay' => function () use ($bill) {
                $controller = app(ZaloPayController::class);
                $validatedData = request()->all();
                $response = $controller->createPayment($validatedData, $bill);

                return $response instanceof \Illuminate\Http\JsonResponse
                    ? $response->getData(true)
                    : $response;
            }
        ];

        if (!isset($handlers[$paymentMethod])) {
            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'message' => 'Phương thức thanh toán không hợp lệ.',
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            return response()->json($handlers[$paymentMethod](), Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error("Lỗi thanh toán $paymentMethod: " . $e->getMessage());
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi xử lý thanh toán.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy tất cả hóa đơn cho người dùng đã xác thực.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserBills(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để xem đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            // Đảm bảo tải các mối quan hệ lồng nhau cho danh sách đơn hàng
            $bills = Bill::where('id_user', $user->id_user)
                          ->with([
                              'details.productDetail.product',
                              'details.productDetail.color',
                              'details.productDetail.size'
                          ])
                          ->orderBy('ngaydat', 'desc')
                          ->get();

            return response()->json([
                'status' => Response::HTTP_OK,
                'bills' => $bills,
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy danh sách đơn hàng cho người dùng {$user->id_user}: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy danh sách đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Lấy một hóa đơn cụ thể theo ID cho người dùng đã xác thực.
     *
     * @param int $id_bill
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserBillById($id_bill)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để xem đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        try {
            $bill = Bill::where('id_bill', $id_bill)
                         ->where('id_user', $user->id_user)
                         ->with([
                             'details.productDetail.product', // Tải thông tin sản phẩm
                             'details.productDetail.color',   // Tải thông tin màu sắc
                             'details.productDetail.size'     // Tải thông tin kích thước
                         ])
                         ->first();

            if (!$bill) {
                return response()->json([
                    'status' => Response::HTTP_NOT_FOUND,
                    'message' => 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.',
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'bill' => $bill,
            ], Response::HTTP_OK);

        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy đơn hàng ID {$id_bill} cho người dùng {$user->id_user}: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Hủy một hóa đơn cụ thể. Phương thức này có thể được sử dụng bởi cả người dùng (cho đơn hàng của họ)
     * và quản trị viên (cho bất kỳ đơn hàng nào). Logic ủy quyền sẽ phân biệt.
     *
     * @param \App\Models\Bill $bill Đối tượng hóa đơn được giải quyết bằng route model binding.
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelOrder(Bill $bill)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => Response::HTTP_UNAUTHORIZED,
                'message' => 'Bạn cần đăng nhập để hủy đơn hàng.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Admin có thể hủy bất kỳ đơn hàng nào, người dùng thông thường chỉ có thể hủy đơn hàng của họ
        if (!$user->is_admin && $bill->id_user !== $user->id_user) { // Giả định có cột 'is_admin' trong bảng users
            return response()->json([
                'status' => Response::HTTP_FORBIDDEN,
                'message' => 'Bạn không có quyền hủy đơn hàng này.',
            ], Response::HTTP_FORBIDDEN);
        }

        $cancellableStatuses = ['pending', 'processing'];
        if (in_array($bill->order_status, $cancellableStatuses)) {
            DB::transaction(function () use ($bill) {
            $bill->order_status = 'cancelled'; // Cập nhật trạng thái thành 'cancelled' (tiếng Anh)
               $bill->save();
                // Hoàn lại số lượng sản phẩm vào kho
                foreach ($bill->details as $detail) {
                    $productDetail = ProductDetail::find($detail->id_productdetail);
                    if ($productDetail) {
                        $productDetail->increment('sl', $detail->quantity);
                    }
                }
            });
            Log::info("Đơn hàng ID {$bill->id_bill} đã được hủy bởi người dùng {$user->id_user} (Admin: {$user->is_admin}). Số lượng sản phẩm đã được hoàn lại.");
            return response()->json([
                'status' => Response::HTTP_OK,
                'message' => 'Đơn hàng đã được hủy thành công. Số lượng sản phẩm đã được hoàn lại.',
                'bill' => $bill // Trả về đơn hàng đã cập nhật
            ], Response::HTTP_OK);
        }

        return response()->json([
            'status' => Response::HTTP_BAD_REQUEST,
            'status' => Response::HTTP_BAD_REQUEST,
            'message' => 'Đơn hàng không thể hủy ở trạng thái hiện tại.',
        ], Response::HTTP_BAD_REQUEST);
    }

    // Phương thức 'confirmOrder' và 'getPendingOrdersForAdmin' đã được loại bỏ
    // để phù hợp với logic "admin mới được xác nhận" và tránh trùng lặp.
}
