<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class PasswordOtpController extends Controller
{
    // Gửi OTP
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();
        if (! $user) {
            return response()->json(['message' => 'Email không tồn tại'], 404);
        }

        $otp = rand(100000, 999999);

        DB::table('password_otps')->updateOrInsert(
            ['email' => $request->email],
            ['otp' => $otp, 'expires_at' => Carbon::now()->addMinutes(5), 'updated_at' => now()]
        );

        Mail::raw("Mã OTP để đặt lại mật khẩu là: $otp (có hiệu lực trong 5 phút)", function ($message) use ($request) {
            $message->to($request->email)->subject('Mã OTP đặt lại mật khẩu');
        });

        return response()->json(['message' => 'OTP đã được gửi qua email']);
    }

    // Xác minh OTP & đổi mật khẩu
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'otp'      => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $otpRecord = DB::table('password_otps')->where('email', $request->email)->first();
        if (! $otpRecord || $otpRecord->otp !== $request->otp) {
            return response()->json(['message' => 'OTP không đúng'], 400);
        }

        if (Carbon::parse($otpRecord->expires_at)->isPast()) {
            return response()->json(['message' => 'OTP đã hết hạn'], 400);
        }

        $user           = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_otps')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Đổi mật khẩu thành công']);
    }
}
