<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillDetail extends Model
{
    use HasFactory;
    protected $table = 'billdetail';
    protected $primaryKey = 'id_billdetail';
    public $timestamps = false;
    protected $fillable = ['id_bill', 'id_productdetail', 'quantity', 'price', 'created_at','updated_at'];

    public function bill()
    {
        return $this->belongsTo(Bill::class, 'id_bill');
    }
    public function productDetail()
    {
        return $this->belongsTo(ProductDetail::class, 'id_productdetail');
    }
    public function product()
    {
        return $this->belongsTo(Product::class, 'id_product');
    }
}
