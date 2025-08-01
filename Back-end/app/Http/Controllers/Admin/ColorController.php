<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color; // Import Model Color của bạn
use Illuminate\Http\Request;

class ColorController extends Controller
{
    public function index()
    {
        // Lấy tất cả dữ liệu từ bảng colors
        $colors = Color::all();
        // Trả về dữ liệu dưới dạng JSON
        return response()->json($colors);
    }
}