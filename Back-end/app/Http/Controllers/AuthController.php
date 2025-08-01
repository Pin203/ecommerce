<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function dangKy(Request $req)
    {
        $validator = Validator::make($req->all(), [
            // 'username' => 'required|unique:users,username',
            'username' => 'required|unique:user,username',
            'password' => 'required|min:6',
            'name'     => 'required',
            // 'email' => 'required|email|unique:users,email',
             'email' => 'required|email|unique:user,email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'username'   => $req->username,
            'password'   => Hash::make($req->password),
            'name'       => $req->name,
            'diachi'     => $req->diachi ?? '',
            'dienthoai'  => $req->dienthoai ?? '',
            'email'      => $req->email,
            'role'       => 'user',
            'is_blocked' => false // mặc định không bị chặn
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
        ], 201);
    }

  public function dangNhap(Request $req)
{
    $user = User::where('username', $req->username)->first();

    // Nếu không tồn tại tài khoản
    if (!$user) {
        return response()->json(['message' => 'Tài khoản không tồn tại'], 401);
    }

    // Nếu đã bị chặn
    if ($user->is_blocked) {
        return response()->json([
            'message' => "Tài khoản '{$user->username}' đã bị chặn. Vui lòng liên hệ quản trị viên."
        ], 403);
    }

    // Kiểm tra mật khẩu
    if (!Hash::check($req->password, $user->password)) {
        return response()->json(['message' => 'Mật khẩu không đúng'], 401);
    }

    // Đăng nhập thành công
    $token = $user->createToken('authToken')->plainTextToken;

    return response()->json([
        'message' => 'Đăng nhập thành công',
        'token'   => $token,
        'user'    => $user,
        'role'    => $user->role,
    ]);
}


    public function dangXuat(Request $req)
    {
        $req->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đăng xuất thành công',
        ]);
    }
}
