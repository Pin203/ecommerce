<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(Request $request)
    {
        $query = Feedback::with([
            'user:id_user,name',
            'productdetail', // Không chỉ định cụ thể cột để tránh lỗi 500
        ])->orderByDesc('created_at');

        if ($request->has('id_user')) {
            $query->where('id_user', $request->id_user);
        }

        if ($request->has('id_productdetail')) {
            $query->where('id_productdetail', $request->id_productdetail);
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $feedback = Feedback::with([
            'user:id_user,name',
            'productdetail',
        ])->findOrFail($id);

        return response()->json($feedback);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'comment'     => 'required|string|max:1000',
            'store_reply' => 'nullable|string|max:1000',
        ]);

        $feedback = Feedback::findOrFail($id);
        $feedback->update($request->only(['comment', 'store_reply']));

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data'    => $feedback,
        ]);
    }

    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json([
            'message' => 'Xoá feedback thành công',
        ]);
    }

    public function approve($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Phê duyệt thành công',
        ]);
    }

    public function hide($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->update(['status' => 'hidden']);

        return response()->json([
            'message' => 'Đã ẩn đánh giá',
        ]);
    }
}