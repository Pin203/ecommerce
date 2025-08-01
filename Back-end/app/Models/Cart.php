<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;
    protected $table = 'cart';
    protected $primaryKey = 'id_cart';
    public $timestamps = false;
    protected $fillable = ['id_user', 'id_productdetail', 'name', 'img', 'quantity', 'price', 'dongia', 'thanhtien'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function productDetail()
    {
        return $this->belongsTo(ProductDetail::class, 'id_productdetail');
    }
}
