<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_comment';
    public $timestamps = false;

    protected $fillable = [
        'id_user',
        'id_product',
        'date',
        'noidung',
    ];

    // Quan hệ với bảng users
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    // Quan hệ với bảng products
    public function product()
    {
        return $this->belongsTo(Product::class, 'id_product', 'id_product');
    }
}
