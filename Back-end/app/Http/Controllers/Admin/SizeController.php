<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Size; // Import Model Size của bạn
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index()
    {
        // Lấy tất cả dữ liệu từ bảng sizes
        $sizes = Size::all();
        // Trả về dữ liệu dưới dạng JSON
        return response()->json($sizes);
    }
}