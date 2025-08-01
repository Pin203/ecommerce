<?php
namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    // ✅ Trỏ đúng bảng 'user'
    protected $table = 'user';

    // ✅ Khóa chính
    protected $primaryKey = 'id_user';

    // ✅ Gán giá trị hàng loạt
    protected $fillable = [
        'username',
        'password',
        'name',
        'diachi',
        'dienthoai',
        'email',
        'role',
        'is_blocked',
        'email_verified_at',
        'remember_token',
    ];

    // ✅ Ẩn khi trả về JSON
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ✅ Ép kiểu datetime
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_blocked'        => 'boolean',
    ];

    // ❌ Đã xóa setPasswordAttribute để tránh mã hóa 2 lần
}
