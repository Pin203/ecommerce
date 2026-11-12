<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminContactController extends Controller
{
    // ✅ Danh sách liên hệ
    public function index()
    {
        return response()->json(
            Contact::orderBy('created_at', 'desc')->paginate(10)
        );
    }

    // ✅ Xem chi tiết
    public function show($id)
    {
        $contact = Contact::findOrFail($id);
        return response()->json($contact);
    }

    // ✅ Admin phản hồi và gửi mail
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string|max:2000',
        ]);

        $contact = Contact::findOrFail($id);

        // Lưu phản hồi vào DB
        $contact->reply = $request->reply;
        $contact->save();

        // Gửi email phản hồi
        Mail::raw($request->reply, function ($message) use ($contact) {
            $message->to($contact->email)
                    ->subject('Phản hồi từ Admin - Liên hệ của bạn');
        });

        return response()->json([
            'status'  => true,
            'message' => 'Đã phản hồi và gửi email thành công.',
            'data'    => $contact,
        ]);
    }
}
