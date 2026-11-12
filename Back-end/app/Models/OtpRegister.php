<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpRegister extends Model
{
    protected $table = 'otp_registers'; // tên bảng

    protected $fillable = [
        'username',    // nếu cột này có trong bảng
        'password',
        'name',
        'diachi',
        'phone',
        'email',
        'role',
        'is_blocked',
        'otp',
        'expires_at'
    ];

    public $timestamps = true;
}
