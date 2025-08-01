<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDetail extends Model
{
    use HasFactory;

    protected $table = 'productdetail'; // Đảm bảo đúng tên bảng của chi tiết sản phẩm

    protected $primaryKey = 'id_product_detail'; // Giả sử đây là khóa chính của bảng chi tiết

    // Thêm các trường 'mota', 'sl', 'id_size', 'id_color', 'gia' vào fillable
    protected $fillable = [
        'id_product',
        'gia', // Giá riêng cho chi tiết (nếu có, nếu không thì lấy giá từ Product)
        'sl',  // Số lượng
        'mota', // Mô tả chi tiết
        'id_size',
        'id_color'
    ];

    // Quan hệ với Product
    public function product()
    {
        return $this->belongsTo(Product::class, 'id_product', 'id_product');
    }

    // Quan hệ với Size
    public function size()
    {
        return $this->belongsTo(Size::class, 'id_size', 'id_size');
    }

    // Quan hệ với Color
    public function color()
    {
        return $this->belongsTo(Color::class, 'id_color', 'id_color');
    }
}