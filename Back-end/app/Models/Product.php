<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
class Product extends Model
{
    use HasFactory;

    protected $table = 'product'; // Đảm bảo đúng tên bảng

    protected $primaryKey = 'id_product'; // Đảm bảo đúng khóa chính

    // Thêm 'discount' và 'is_featured' vào fillable
    protected $fillable = [
        'id_category',
        'id_brand',
        'name',
        'price',
        'img',
        'img_phu',
        'discount',
        'is_featured',
        'status'
    ];
       protected static function booted()
    {
        static::addGlobalScope('visible', function (Builder $builder) {
            $builder->where('status', 0);
        });
    }
    // Quan hệ với Category
    public function category()
    {
        return $this->belongsTo(Category::class, 'id_category', 'id_category');
    }

    // Quan hệ với Brand
    public function brand()
    {
        return $this->belongsTo(Brand::class, 'id_brand', 'id_brand');
    }

    // Quan hệ với ProductDetail (một sản phẩm có thể có nhiều chi tiết/biến thể)
    public function productDetails()
    {
        return $this->hasMany(ProductDetail::class, 'id_product', 'id_product');
    }
     protected $casts = [
        'img_phu' => 'array', // <--- Laravel sẽ tự động cast JSON string thành PHP array
    ];
}