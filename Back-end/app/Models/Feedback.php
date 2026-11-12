<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    protected $table = 'product_reviews'; // bảng bạn đang dùng
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'id_user',
        'id_productdetail',
        'id_bill',        // 🔹 thêm dòng này
         'id_orderdetail', // thêm cái này
        'rating',
        'comment',
        'status',
        'store_reply',
        'helpful_count',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function media()
    {
        return $this->hasMany(FeedbackMedia::class, 'review_id', 'id');
    }
    
}
