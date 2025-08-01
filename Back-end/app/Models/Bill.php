<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;
    protected $table = 'bill';
    protected $primaryKey = 'id_bill';
    public $timestamps = false;
    // Thay 'trangthai' bằng 'order_status' trong fillable
    protected $fillable = ['id_user', 'hoten_nguoinhan', 'diachi_nguoinhan', 'dienthoai_nguoinhan', 'total', 'pttt', 'ngaydat', 'voucher', 'order_status'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function details()
    {
        return $this->hasMany(BillDetail::class, 'id_bill');
    }
}