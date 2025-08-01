<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'vouchers';
    protected $primaryKey = 'id_voucher';

    public $timestamps = false;

    protected $fillable = [
        'code',
        'discount',
        'type',
        'active',
    ];

    /**
     * Một voucher có thể được dùng trong nhiều hóa đơn (bill)
     */
    public function bills()
    {
        return $this->hasMany(Bill::class, 'id_voucher', 'id_voucher');
    }
}
