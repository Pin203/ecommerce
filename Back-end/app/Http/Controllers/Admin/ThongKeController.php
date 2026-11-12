<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{public function doanhThuTheoThang()
    {
        $data = DB::table('bill')
            ->where('order_status', '!=', 'cancelled')
            ->whereNotNull('ngaynhan') // Lọc bỏ các ngày nhận null
            ->selectRaw("DATE_FORMAT(ngaynhan, '%Y-%m') as thang, SUM(total) as doanh_thu")
            ->groupBy('thang')
            ->orderBy('thang', 'asc')
            ->get();

        return response()->json($data);
    }
}