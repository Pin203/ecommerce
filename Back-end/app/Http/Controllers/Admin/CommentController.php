<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index()
    {
        $comments = Comment::with(['user:id_user,name', 'product:id_product,name'])
            ->orderByDesc('date')
            ->get();

        return response()->json($comments);
    }

    public function show($id)
    {
        $comment = Comment::with(['user:id_user,name', 'product:id_product,name'])
            ->findOrFail($id);

        return response()->json($comment);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'noidung' => 'required|string|max:500',
        ]);

        $comment = Comment::findOrFail($id);
        $comment->update(['noidung' => $request->noidung]);

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $comment]);
    }

    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Xoá bình luận thành công']);
    }
    public function toggleHidden($id)
{
    $comment = Comment::findOrFail($id);

    // Đảo trạng thái ẩn/hiện
    $comment->is_hidden = $comment->is_hidden ? 0 : 1;
    $comment->save();

    return response()->json([
        'message' => $comment->is_hidden ? 'Bình luận đã bị ẩn' : 'Bình luận đã được hiển thị',
        'data' => $comment
    ]);
}

}
