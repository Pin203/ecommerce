<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index($productId)
    {
        return Comment::where('id_product', $productId)
            ->with('user')
            ->orderByDesc('date') // mới nhất lên đầu
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'id_user'    => 'required|exists:user,id_user',
            'id_product' => 'required|exists:product,id_product',
            'noidung'    => 'required|string|max:500',
        ]);

        $comment = Comment::create([
            'id_user'    => $request->id_user,
            'id_product' => $request->id_product,
            'noidung'    => $request->noidung,
            'date'       => now(),
        ]);

        return response()->json($comment, 201);
    }

    public function update(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update([
            'noidung' => $request->noidung,
        ]);

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $comment]);
    }

    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Đã xoá bình luận']);
    }
}
