<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class Voucher extends Model
// {
//     protected $table = 'vouchers';
//     protected $primaryKey = 'id_voucher';

//     public $timestamps = false;

//     protected $fillable = [
//         'code',
//         'discount',
//         'type',
//         'active',
//     ];

//     /**
//      * Một voucher có thể được dùng trong nhiều hóa đơn (bill)
//      */
//     public function bills()
//     {
//         return $this->hasMany(Bill::class, 'id_voucher', 'id_voucher');
//     }
// }


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    // Tên bảng
    protected $table = 'vouchers';

    // Khóa chính
    protected $primaryKey = 'id_voucher';

    // Không dùng created_at, updated_at
    public $timestamps = false;

    // Các cột cho phép insert/update
    protected $fillable = [
        'code',
        'discount',
        'type',
        'active',
    ];

    /**
     * Một voucher có thể được dùng trong nhiều hóa đơn
     */
    public function bills()
    {
        return $this->hasMany(\App\Models\Bill::class, 'id_voucher', 'id_voucher');
    }
}
