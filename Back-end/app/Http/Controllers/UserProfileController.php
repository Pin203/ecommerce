<?php

namespace App\Http\Controllers; // Hoặc App\Http\Controllers\User nếu bạn muốn tổ chức

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Để lấy người dùng đang đăng nhập
use Illuminate\Validation\Rule; // Để xử lý unique email/username khi update

class UserProfileController extends Controller
{
    /**
     * Hiển thị thông tin hồ sơ của người dùng đang đăng nhập.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show()
    {
        $user = Auth::user(); // Lấy người dùng đang đăng nhập
        if (!$user) {
            return response()->json(['message' => 'Bạn chưa đăng nhập.'], 401);
        }
        return response()->json($user);
    }

    /**
     * Cập nhật thông tin hồ sơ của người dùng đang đăng nhập.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Bạn chưa đăng nhập.'], 401);
        }

        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'username' => [
                'required',
                'string',
                'max:255',
                Rule::unique('user', 'username')->ignore($user->id_user, 'id_user'), // Duy nhất nhưng bỏ qua chính người dùng này
            ],
            'name' => 'required|string|max:255',
            'diachi' => 'nullable|string|max:255',
            'dienthoai' => 'nullable|string|max:20',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('user', 'email')->ignore($user->id_user, 'id_user'), // Duy nhất nhưng bỏ qua chính người dùng này
            ],
            // Lưu ý: không cho phép người dùng tự sửa 'role' hoặc 'is_blocked'
            // Nếu bạn muốn cho phép đổi mật khẩu, bạn cần thêm trường 'password' và xử lý băm mật khẩu 
          
        ]);

         $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công!',
            'data' => $user
        ]);
    }
}