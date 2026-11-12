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

    // Accessor: trả về URL đầy đủ
    public function getMediaUrlAttribute($value)
    {
        // Nếu trong DB đã có "storage/" thì trả thẳng
        if (str_starts_with($value, '/storage/')) {
            return asset($value);
        }

        // Nếu chỉ lưu "review_media/..." thì thêm "storage/"
        return asset('storage/' . $value);
    }
}

