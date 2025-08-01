<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;
    protected $table = 'product_reviews';

    protected $fillable = [
        'id_user',
        'id_productdetail',
        'rating',
        'comment',
        'status',
        'store_reply'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function media()
    {
        return $this->hasMany(FeedbackMedia::class, 'review_id');
    }
}
