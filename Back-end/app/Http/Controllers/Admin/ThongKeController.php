<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ThongKeController extends Controller
{
    public function doanhThuTheoThang()
    {
        $data = DB::table('billdetail')
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as thang, SUM(quantity * price) as doanh_thu")
            ->groupBy('thang')
            ->orderBy('thang', 'asc')
            ->get();

        return response()->json($data);
    }
}
