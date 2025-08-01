<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class FeedbackMedia extends Model
{
    use HasFactory;

    protected $table = 'review_medias';

    protected $fillable = [
        'review_id',
        'media_url',
        'type'
    ];

    public function review()
    {
        return $this->belongsTo(Feedback::class, 'review_id');
    }

    // Accessor trả về URL đầy đủ của media
    public function getMediaUrlAttribute($value)
    {
        return Storage::url($value);
    }
}
