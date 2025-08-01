<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Chưa đăng nhập
        if (!$request->user()) {
            return response()->json(['message' => 'Bạn chưa đăng nhập!'], 401);
        }

        // 2. Không phải admin
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Bạn không có quyền truy cập admin!'], 403);
        }

        return $next($request);
    }
}
