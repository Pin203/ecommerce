<?php
namespace App\Http\Controllers;

use App\Mail\RegisterOtpMail;
use App\Models\OtpRegister;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // Gửi OTP đăng ký
    public function sendRegisterOtp(Request $req)
    {
        $validator = Validator::make($req->all(), [
            'username'  => [
                'required',
                'regex:/^[a-zA-Z0-9_]{4,20}$/',
                function ($attribute, $value, $fail) {
                    if (User::where('username', $value)->exists()) {
                        $fail('Tên đăng nhập đã tồn tại.');
                    }
                    if (OtpRegister::where('username', $value)->exists()) {
                        $fail('Tên đăng nhập đã được đăng ký và đang chờ xác thực.');
                    }
                },
            ],
            'password'  => 'required|min:6|max:32|regex:/^(?=.*[A-Za-z])(?=.*\d).+$/',
            'name'      => 'required|string|max:50',
            'email'     => [
                'required',
                'email:rfc,dns',
                'max:100',
                function ($attribute, $value, $fail) {
                    if (User::where('email', $value)->exists()) {
                        $fail('Email đã tồn tại.');
                    }
                    if (OtpRegister::where('email', $value)->exists()) {
                        $fail('Email này đã được đăng ký và đang chờ xác thực.');
                    }
                },
            ],
            'dienthoai' => 'nullable|regex:/^0\d{9}$/',
            'diachi'    => 'nullable|string|max:255',
        ], [
            'username.required' => 'Vui lòng nhập tên đăng nhập.',
            'username.regex'    => 'Tên đăng nhập chỉ chứa chữ, số, dấu _ và dài 4-20 ký tự.',

            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.max'      => 'Mật khẩu không được vượt quá 32 ký tự.',
            'password.regex'    => 'Mật khẩu phải có ít nhất 1 chữ và 1 số.',

            'name.required'     => 'Vui lòng nhập họ tên.',
            'name.max'          => 'Họ tên không được vượt quá 50 ký tự.',

            'email.required'    => 'Vui lòng nhập email.',
            'email.email'       => 'Email không hợp lệ.',
            'email.max'         => 'Email không được vượt quá 100 ký tự.',

            'dienthoai.regex'   => 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0.',

            'diachi.max'        => 'Địa chỉ không được vượt quá 255 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $otp = rand(100000, 999999);

        OtpRegister::updateOrCreate(
            ['email' => $req->email],
            [
                'phone'      => $req->dienthoai ?? null,
                'username'   => $req->username,
                'password'   => Hash::make($req->password),
                'name'       => $req->name,
                'diachi'     => $req->diachi ?? null,
                'role'       => 'user',
                'is_blocked' => false,
                'otp'        => $otp,
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        try {
            Mail::to($req->email)->send(new RegisterOtpMail($otp, $req->username));
        } catch (\Throwable $e) {
            // Có thể log lỗi gửi mail
        }

        return response()->json(['message' => 'OTP đã được gửi tới email, vui lòng kiểm tra.']);
    }

    // Xác nhận OTP và đăng ký
    public function verifyRegisterOtp(Request $req)
    {
        $req->validate([
            'otp'   => 'required|digits:6',
            'email' => 'nullable|email',
        ]);

        $otpRecord = $req->filled('email')
        ? OtpRegister::where('email', $req->email)
            ->where('otp', $req->otp)
            ->where('expires_at', '>', Carbon::now())
            ->first()
        : OtpRegister::where('otp', $req->otp)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (! $otpRecord) {
            return response()->json(['message' => 'Không tìm thấy OTP hoặc OTP đã hết hạn.'], 400);
        }

        $user = User::create([
            'username'   => $otpRecord->username,
            'password'   => $otpRecord->password,
            'name'       => $otpRecord->name,
            'diachi'     => $otpRecord->diachi,
            'dienthoai'  => $otpRecord->phone,
            'email'      => $otpRecord->email,
            'role'       => $otpRecord->role,
            'is_blocked' => $otpRecord->is_blocked,
        ]);

        $otpRecord->delete();

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
        ], 201);
    }

    // Đăng nhập (username hoặc email)
    public function dangNhap(Request $req)
    {
        // Cho phép đăng nhập bằng username hoặc email
        $user = User::where('username', $req->username)
            ->orWhere('email', $req->username)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Tài khoản không tồn tại'], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'message' => "Tài khoản '{$user->username}' đã bị chặn. Vui lòng liên hệ quản trị viên.",
            ], 403);
        }
        if (! Hash::check($req->password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu không đúng'], 401);
        }

        $token = $user->createToken('authToken')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token'   => $token,
            'user'    => $user,
            'role'    => $user->role,
        ]);
    }

    // Đăng xuất
    public function dangXuat(Request $req)
    {
        $req->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    // Lấy thông tin user
    public function getUser()
    {
        $user = Auth::user();
        if ($user) {
            return response()->json(['user' => $user]);
        }
        return response()->json(['message' => 'Người dùng chưa được xác thực.'], 401);
    }
}