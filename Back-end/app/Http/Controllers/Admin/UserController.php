<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::all());
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $user->update($request->only([
            'username',
            'name',
            'diachi',
            'dienthoai',
            'email',
            'role'
        ]));

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data' => $user
        ]);
    }

    public function toggleBlock($id)
    {
        $user = User::findOrFail($id);
        $user->is_blocked = !$user->is_blocked;
        $user->save();

        return response()->json([
            'message' => $user->is_blocked ? 'User đã bị chặn' : 'User đã được bỏ chặn',
            'user' => $user
        ]);
    }
}
