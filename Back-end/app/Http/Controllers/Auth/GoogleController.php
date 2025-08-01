<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'              => $googleUser->getName(),
                'username'          => Str::slug($googleUser->getName()) . rand(1000, 9999),
                'password'          => bcrypt(Str::random(24)),
                'email_verified_at' => now(),
                'diachi'            => 'Chưa cập nhật',
                'dienthoai'         => '0123456789',
                'role'              => 'user',
            ]
        );

        $token = $user->createToken('authToken')->plainTextToken;

        // ✅ Redirect về frontend kèm các thông tin user cần thiết
        return redirect("http://localhost:3000/dangnhap?token={$token}&name={$user->name}&email={$user->email}&role={$user->role}");
    }
}
