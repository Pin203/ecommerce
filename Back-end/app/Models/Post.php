<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    /**
     * Tên bảng liên kết với Model.
     * Mặc định Eloquent sẽ tìm bảng có tên số nhiều của tên Model (ví dụ: 'posts' cho Model 'Post').
     * Nếu tên bảng của bạn không phải là 'posts', bạn cần chỉ định rõ ràng.
     * Ví dụ: nếu bảng của bạn là 'bai_viet', thì protected $table = 'bai_viet';
     *
     * @var string
     */
    protected $table = 'posts'; // ✅ Rất quan trọng: Đảm bảo tên bảng này khớp với tên bảng bài viết trong database của bạn

    /**
     * Khóa chính của bảng.
     * Mặc định Eloquent sẽ giả định khóa chính là 'id'.
     * Nếu khóa chính của bạn có tên khác (ví dụ: 'post_id'), bạn cần chỉ định rõ ràng.
     *
     * @var string
     */
    protected $primaryKey = 'id'; // ✅ Đảm bảo khóa chính này khớp với khóa chính trong bảng bài viết của bạn

    /**
     * Các thuộc tính có thể được gán hàng loạt (mass assignable).
     * Đây là các cột bạn cho phép được gán giá trị thông qua create() hoặc update() với mảng.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',    // Tiêu đề bài viết
        'slug',     // Slug (URL thân thiện), thường là duy nhất
        'content',  // Nội dung bài viết
        'image',    // Đường dẫn ảnh đại diện (nếu có)
        'author_id', // ID của tác giả (nếu có quan hệ với bảng users)
        'published_at', // Ngày xuất bản (nếu có)
        // Thêm các cột khác mà bạn có trong bảng 'posts' của mình
    ];

    /**
     * Các thuộc tính nên được chuyển đổi sang kiểu dữ liệu cụ thể.
     * Ví dụ: 'published_at' có thể là kiểu datetime.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'published_at' => 'datetime',
    ];

    // ✅ Định nghĩa các mối quan hệ (nếu có)
    // Ví dụ: Một bài viết thuộc về một tác giả (User)
    // public function author()
    // {
    //     return $this->belongsTo(User::class, 'author_id');
    // }

    // Ví dụ: Một bài viết có thể thuộc về nhiều danh mục (nếu có bảng trung gian)
    // public function categories()
    // {
    //     return $this->belongsToMany(Category::class, 'post_category', 'post_id', 'category_id');
    // }
}