<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use App\Models\FeedbackMedia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FeedbackController extends Controller
{
    public function index()
    {
        return response()->json(Feedback::all());
    }

    public function feedback($id_productdetail)
    {
        $reviews = Feedback::with(['user', 'media'])
            ->where('id_productdetail', $id_productdetail)
            ->where('status', '!=', 'hidden')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_user' => 'required|exists:user,id_user',
            'id_productdetail' => 'required|numeric',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        // Tìm đơn hàng chứa sản phẩm
        $billDetail = DB::table('billdetail')
            ->join('bill', 'billdetail.id_bill', '=', 'bill.id_bill')
            ->where('bill.id_user', $request->id_user)
            ->where('billdetail.id_productdetail', $request->id_productdetail)
            ->select('bill.id_bill', 'billdetail.id_productdetail')
            ->first();

        if (!$billDetail) {
            return response()->json(['message' => 'Bạn chưa mua sản phẩm này.'], 403);
        }

        // Kiểm tra đã đánh giá sản phẩm trong đơn hàng này chưa
        $exists = Feedback::where('id_user', $request->id_user)
            ->where('id_productdetail', $request->id_productdetail)
            ->where('id_bill', $billDetail->id_bill)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.'], 409);
        }

        $review = Feedback::create([
            'id_user' => $request->id_user,
            'id_productdetail' => $request->id_productdetail,
            'id_bill' => $billDetail->id_bill,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'approved'
        ]);

        return response()->json($review, 201);
    }

    public function update(Request $request, $id)
    {
        $review = Feedback::findOrFail($id);

        $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        if ($review->id_user != $request->id_user) {
            return response()->json(['message' => 'Không được phép sửa đánh giá này.'], 403);
        }

        $review->update($request->only(['rating', 'comment']));
        return response()->json($review);
    }

    public function destroy(Request $request, $id)
    {
        $review = Feedback::findOrFail($id);

        if ($review->id_user != $request->id_user) {
            return response()->json(['message' => 'Không được xoá đánh giá này.'], 403);
        }

        if ($review->status != 'pending') {
            return response()->json(['message' => 'Không thể xoá đánh giá đã duyệt.'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Đã xoá đánh giá.']);
    }

   public function checkFeedback(Request $request)
{
    $validated = $request->validate([
        'id_user' => 'required|numeric',
        'id_productdetail' => 'required|numeric'
    ]);

    $id_bill = DB::table('billdetail')
        ->join('bill', 'billdetail.id_bill', '=', 'bill.id_bill')
        ->where('bill.id_user', $request->id_user)
        ->where('billdetail.id_productdetail', $request->id_productdetail)
        ->value('bill.id_bill');

    if (!$id_bill) {
        return response()->json(['exists' => false]);
    }

    $feedback = Feedback::where('id_user', $request->id_user)
        ->where('id_productdetail', $request->id_productdetail)
        ->where('id_bill', $id_bill)
        ->first();

    return response()->json([
        'exists' => !!$feedback,
        'id_feedback' => optional($feedback)->id
    ]);
}


    public function hide($id)
    {
        $review = Feedback::findOrFail($id);
        $review->status = 'hidden';
        $review->save();

        return response()->json(['message' => 'Đã ẩn đánh giá.']);
    }

    public function approve($id)
    {
        $review = Feedback::findOrFail($id);
        $review->status = 'approved';
        $review->save();

        return response()->json(['message' => 'Đã mở lại đánh giá.']);
    }

    public function reply(Request $request, $id)
    {
        $review = Feedback::findOrFail($id);

        $request->validate([
            'store_reply' => 'required|string|max:1000'
        ]);

        $review->store_reply = $request->store_reply;
        $review->save();

        return response()->json(['message' => 'Đã phản hồi đánh giá.']);
    }

    public function uploadMedia(Request $request, $id)
    {
        $request->validate([
            'media' => 'required|array',
            'media.*' => 'file|mimes:jpg,jpeg,png,mp4|max:10240',
        ]);

        foreach ($request->file('media') as $file) {
            $path = $file->store('public/review_media');

            FeedbackMedia::create([
                'review_id' => $id,
                'media_url' => $path,
                'type' => $file->getClientOriginalExtension() === 'mp4' ? 'video' : 'image',
            ]);
        }

        return response()->json(['message' => 'Đã tải lên media.']);
    }

    public function average($id_productdetail)
    {
        $avg = Feedback::where('id_productdetail', $id_productdetail)
            ->where('status', '!=', 'hidden')
            ->avg('rating');

        return response()->json(['average_rating' => round($avg, 1)]);
    }

    public function filterByStar($id_productdetail, Request $request)
    {
        $stars = $request->query('stars');

        $query = Feedback::with(['user', 'media'])
            ->where('id_productdetail', $id_productdetail)
            ->where('status', '!=', 'hidden');

        if ($stars) {
            $query->where('rating', $stars);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }
}
