<?php
namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index()
    {
        return response()->json(News::orderBy('created_at', 'desc')->get());
    }

    public function show($id)
    {
        $news = News::with('creator')->findOrFail($id);

        // Tăng lượt xem
        $news->increment('views');

        // Gợi ý các tin tức liên quan (ngẫu nhiên)
        $related = News::where('id', '!=', $id)
            ->orderByRaw('RAND()')
            ->limit(3)
            ->get(['id', 'title', 'image']);

        return response()->json([
            'news'    => $news,
            'related' => $related,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'required',
            'image'   => 'nullable|string',
        ]);

        $news = News::create($request->only(['title', 'content', 'image']));

        return response()->json($news, 201);
    }

    public function update(Request $request, $id)
    {
        $news = News::findOrFail($id);

        $news->update($request->only(['title', 'content', 'image']));

        return response()->json(['message' => 'Cập nhật thành công', 'data' => $news]);
    }

    public function destroy($id)
    {
        $news = News::findOrFail($id);
        $news->delete();

        return response()->json(['message' => 'Đã xoá tin tức']);
    }
}
