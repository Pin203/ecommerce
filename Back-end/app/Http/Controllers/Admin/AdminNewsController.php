<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;

class AdminNewsController extends Controller
{
    public function index()
    {
        return response()->json(News::orderBy('created_at', 'desc')->paginate(10));
    }

    public function show($id)
    {
        return response()->json(News::findOrFail($id));
    }

    public function store(Request $request)
{
    $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'required|string',
        'image'   => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Yêu cầu có ảnh và validation
    ]);

    // Xử lý việc tải ảnh lên
    $imageFile = $request->file('image');
    $imageName = time() . '_' . $imageFile->getClientOriginalName();
    $imageFile->move(public_path('uploads/news'), $imageName);

    // Tạo bản ghi tin tức mới trong cơ sở dữ liệu
    $news = News::create([
        'title'   => $request->input('title'),
        'content' => $request->input('content'),
        'image'   => asset('uploads/news/' . $imageName), // Lưu đường dẫn ảnh
    ]);

    return response()->json($news, 201);
}

public function update(Request $request, $id)
{
    $news = News::findOrFail($id);

    $request->validate([
        'title'   => 'required|string|max:255',
        'content' => 'required|string',
        'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Quy tắc validation cho file ảnh
    ]);

    // Xử lý việc tải ảnh lên
    if ($request->hasFile('image')) {
        // Xóa ảnh cũ nếu nó tồn tại
        if ($news->image) {
            // Lấy tên file từ đường dẫn
            $oldImageName = basename(parse_url($news->image, PHP_URL_PATH));
            $oldImagePath = public_path('uploads/news/' . $oldImageName);
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        // Tải ảnh mới lên
        $imageFile = $request->file('image');
        $imageName = time() . '_' . $imageFile->getClientOriginalName();
        $imageFile->move(public_path('uploads/news'), $imageName);

        // Cập nhật đường dẫn ảnh mới vào cơ sở dữ liệu
        $news->image = asset('uploads/news/' . $imageName);
    }
    
    // Cập nhật các trường còn lại
    $news->title = $request->input('title');
    $news->content = $request->input('content');
    $news->save();

    return response()->json($news);
}
    public function destroy($id)
    {
        $news = News::findOrFail($id);
        $news->delete();

        return response()->json(['message' => 'Deleted successfully']);
    }
}
