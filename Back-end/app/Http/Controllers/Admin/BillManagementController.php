<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Bill, ProductDetail}; // Thêm ProductDetail để hoàn lại số lượng
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, DB, Log};
use Symfony\Component\HttpFoundation\Response;

class BillManagementController extends Controller
{
    /**
     * Get all bills (or filter by status) for admin dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Bill::with('details.productDetail.product', 'user');

            // Optional: Filter by order_status
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('order_status', $request->status);
            }

            // Optional: Search by bill ID or user name/phone
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('id_bill', 'like', "%{$searchTerm}%")
                      ->orWhereHas('user', function ($uq) use ($searchTerm) {
                          $uq->where('name', 'like', "%{$searchTerm}%");
                          // LỖI ĐÃ ĐƯỢC KHẮC PHỤC:
                          // Cột 'phone' không tồn tại trong bảng 'users'.
                          // Nếu bạn có cột số điện thoại trong bảng 'users' với tên khác,
                          // hãy thay thế 'ten_cot_sdt_cua_ban' bằng tên cột đó.
                          // Ví dụ: ->orWhere('dienthoai', 'like', "%{$searchTerm}%");
                          // Nếu không có cột số điện thoại cho người dùng hoặc không cần tìm kiếm,
                          // bạn có thể bỏ dòng này đi.
                          // ->orWhere('phone', 'like', "%{$searchTerm}%"); // Dòng này đã bị loại bỏ/comment
                      })
                      ->orWhere('hoten_nguoinhan', 'like', "%{$searchTerm}%")
                      ->orWhere('dienthoai_nguoinhan', 'like', "%{$searchTerm}%");
                });
            }
            $perPage = $request->input('per_page', 15); // Default 15 items per page
            $page = $request->input('page', 1);

           $perPage = min(max($perPage, 1), 100); // Giới hạn từ 1 đến 100 bản ghi

            $bills = $query->orderBy('ngaydat', 'desc')->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'status' => Response::HTTP_OK,
                'bills' => $bills,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy danh sách đơn hàng cho admin: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy danh sách đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get a specific bill by ID for admin.
     *
     * @param  \App\Models\Bill  $bill The bill instance resolved by route model binding.
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Bill $bill)
    {
        try {
           $bill->load([
    'details.productDetail.product',
    'details.productDetail.color',
    'details.productDetail.size',
    'user'
]);
            return response()->json([
                'status' => Response::HTTP_OK,
                'bill' => $bill,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi lấy chi tiết đơn hàng ID {$bill->id_bill} cho admin: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Confirm a specific bill by ID (Admin action).
     *
     * @param  \App\Models\Bill  $bill The bill instance resolved by route model binding.
     * @return \Illuminate\Http\JsonResponse
     */
    public function confirmOrder(Bill $bill)
    {
        try {
            // Only confirm if the order_status is 'pending'
            if ($bill->order_status !== 'pending') {
                return response()->json([
                    'status' => Response::HTTP_BAD_REQUEST,
                    'message' => 'Đơn hàng không ở trạng thái "Chờ xác nhận" để xác nhận.',
                ], Response::HTTP_BAD_REQUEST);
            }

            $bill->order_status = 'processing'; // Chuyển sang trạng thái đang xử lý
            $bill->save();

            return response()->json([
                'status' => Response::HTTP_OK,
                'message' => 'Đơn hàng đã được xác nhận thành công.',
                'bill' => $bill,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error("Lỗi khi xác nhận đơn hàng ID {$bill->id_bill}: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi xác nhận đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Cancel a specific bill by ID (Admin action).
     * This will also return the product quantities to inventory.
     *
     * @param  \App\Models\Bill  $bill The bill instance resolved by route model binding.
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelOrder(Bill $bill)
    {
        // Only allow cancellation if the order is not already 'Đã giao hàng' or 'Đã hủy'
        // Cần ánh xạ các trạng thái tiếng Việt sang tiếng Anh nếu cột order_status dùng tiếng Anh
        if (in_array($bill->order_status, ['delivered', 'cancelled'])) { // Giả định 'delivered' và 'cancelled'
            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'message' => 'Không thể hủy đơn hàng đã giao hoặc đã hủy.',
            ], Response::HTTP_BAD_REQUEST);
        }

        DB::beginTransaction(); // Start a database transaction

        try {
            // Update bill status to 'cancelled'
            $bill->order_status = 'cancelled'; // Chuyển sang trạng thái đã hủy
            $bill->save();

            // Return product quantities to ProductDetail
            foreach ($bill->details as $detail) {
                $productDetail = ProductDetail::find($detail->id_productdetail);
                if ($productDetail) {
                    $productDetail->sl += $detail->quantity;
                    $productDetail->save();
                } else {
                    // Log error if product detail not found, but don't stop the transaction
                    Log::warning("ProductDetail with ID {$detail->id_productdetail} not found for bill detail ID {$detail->id_billdetail}. Quantity not returned.");
                }
            }

            DB::commit(); // Commit the transaction

            return response()->json([
                'status' => Response::HTTP_OK,
                'message' => 'Đơn hàng đã được hủy thành công và số lượng sản phẩm đã được hoàn lại.',
                'bill' => $bill,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            DB::rollBack(); // Rollback the transaction on error
            Log::error("Lỗi khi hủy đơn hàng ID {$bill->id_bill}: {$e->getMessage()}");
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'message' => 'Lỗi khi hủy đơn hàng.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    public function markAsShipped(Bill $bill)
{
    try {
        // Only mark as shipped if the order_status is 'processing'
        if ($bill->order_status !== 'processing') {
            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'message' => 'Đơn hàng không ở trạng thái "Đang xử lý" để đánh dấu đã gửi hàng.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $bill->order_status = 'shipped'; // Chuyển sang trạng thái đã gửi hàng
        $bill->save();

        Log::info("Đơn hàng ID {$bill->id_bill} đã được đánh dấu là đã gửi hàng bởi admin.");

        return response()->json([
            'status' => Response::HTTP_OK,
            'message' => 'Đơn hàng đã được đánh dấu là đã gửi hàng thành công.',
            'bill' => $bill,
        ], Response::HTTP_OK);
    } catch (\Throwable $e) {
        Log::error("Lỗi khi đánh dấu đơn hàng ID {$bill->id_bill} là đã gửi hàng: {$e->getMessage()}");
        return response()->json([
            'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
            'message' => 'Lỗi khi đánh dấu đơn hàng là đã gửi hàng.',
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}

/**
 * Mark a specific bill as 'delivered' (Admin action).
 *
 * @param  \App\Models\Bill  $bill The bill instance resolved by route model binding.
 * @return \Illuminate\Http\JsonResponse
 */
public function markAsDelivered(Bill $bill)
{
    try {
        // Only mark as delivered if the order_status is 'shipped'
        if ($bill->order_status !== 'shipped') {
            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'message' => 'Đơn hàng không ở trạng thái "Đã gửi hàng" để đánh dấu đã giao hàng.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $bill->order_status = 'delivered'; // Chuyển sang trạng thái đã giao hàng
        $bill->ngaynhan = now(); // Thêm ngày nhận khi giao hàng thành công
        $bill->save();

        Log::info("Đơn hàng ID {$bill->id_bill} đã được đánh dấu là đã giao hàng bởi admin.");

        return response()->json([
            'status' => Response::HTTP_OK,
            'message' => 'Đơn hàng đã được đánh dấu là đã giao hàng thành công.',
            'bill' => $bill,
        ], Response::HTTP_OK);
    } catch (\Throwable $e) {
        Log::error("Lỗi khi đánh dấu đơn hàng ID {$bill->id_bill} là đã giao hàng: {$e->getMessage()}");
        return response()->json([
            'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
            'message' => 'Lỗi khi đánh dấu đơn hàng là đã giao hàng.',
        ], Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
}
