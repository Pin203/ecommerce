<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\BillDetail;

class BillDetailController extends Controller
{
  public function getByBill($id_bill)
{
    $details = BillDetail::with([
                        'productDetail.product', // Tải thông tin sản phẩm
                        'productDetail.color',   // Tải thông tin màu sắc
                        'productDetail.size'     // Tải thông tin kích thước
                    ])
                    ->where('id_bill', $id_bill)
                    ->get();

    return response()->json($details);
}
}
