<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $table = 'news';

    protected $fillable = [
        'title', 'content', 'image', 'created_by', 'views',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
