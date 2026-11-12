<?php
namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'nullable|string|max:20',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $contact = Contact::create($request->only('name', 'email', 'phone', 'message'));

        return response()->json([
            'status'  => true,
            'message' => 'Liên hệ đã được gửi thành công.',
            'data'    => $contact,
        ], 201);
    }

    public function index()
    {
        $contacts = Contact::orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => true,
            'data'   => $contacts,
        ]);
    }

    public function show($id)
    {
        $contact = Contact::find($id);
        if (! $contact) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy liên hệ',
            ], 404);
        }
        return response()->json([
            'status' => true,
            'data'   => $contact,
        ]);
    }
}