<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // GET: Danh sách danh mục
    public function index()
    {
        return Category::all();
    }

    // POST: Thêm danh mục
    public function store(Request $request)
    {
        $request->validate(['name' => 'required']);
        return Category::create(['name' => $request->name]);
    }
    // GET: Lấy 1 danh mục theo id
    public function show($id)
    {
    return Category::findOrFail($id);
   }

    // PUT: Sửa danh mục
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update(['name' => $request->name]);
        return $category;
    }
}
