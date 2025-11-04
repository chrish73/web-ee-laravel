<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    /**
     * Mengirim pesan baru ke pengguna lain.
     * Endpoint: POST /api/chats/send
     */
    public function sendMessage(Request $request)
    {
        $validatedData = $request->validate([
            // Memastikan receiver_id ada di tabel users dan bukan diri sendiri
            'receiver_id' => 'required|exists:users,id|not_in:' . $request->user()->id,
            'message' => 'required|string|max:1000',
        ]);

        $chat = Chat::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $validatedData['receiver_id'],
            'message' => $validatedData['message'],
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Pesan terkirim.', 'chat' => $chat], 201);
    }

    /**
     * Mendapatkan daftar kontak/percakapan yang pernah dilakukan.
     * Endpoint: GET /api/chats/contacts
     */
    public function getContacts(Request $request)
    {
        $userId = $request->user()->id;

        // 1. Dapatkan pesan terakhir untuk setiap pasangan user
        $latestMessages = Chat::select('id', 'sender_id', 'receiver_id', 'message', 'created_at')
            ->where(function ($query) use ($userId) {
                $query->where('sender_id', $userId)
                      ->orWhere('receiver_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            // Kelompokkan per pasangan user untuk menemukan pesan terbaru
            ->get()
            ->unique(function ($item) use ($userId) {
                // Membuat kunci unik yang tidak tergantung pada urutan sender/receiver
                return min($item->sender_id, $item->receiver_id) . '_' . max($item->sender_id, $item->receiver_id);
            })
            ->values();

        // 2. Dapatkan ID pengguna yang terlibat
        $participantIds = $latestMessages->pluck('sender_id')
            ->merge($latestMessages->pluck('receiver_id'))
            ->unique()
            ->filter(fn($id) => $id !== $userId);

        // 3. Muat detail kontak
        $contacts = User::whereIn('id', $participantIds)
            ->get(['id', 'name', 'email', 'role'])
            ->map(function ($contact) use ($userId, $latestMessages) {
                // Temukan pesan terakhir yang melibatkan kontak ini
                $lastMessage = $latestMessages->first(function ($msg) use ($userId, $contact) {
                    return ($msg->sender_id === $userId && $msg->receiver_id === $contact->id) ||
                           ($msg->sender_id === $contact->id && $msg->receiver_id === $userId);
                });

                // Mendapatkan jumlah pesan yang belum dibaca dari kontak ini
                $unreadCount = Chat::where('sender_id', $contact->id)
                    ->where('receiver_id', $userId)
                    ->where('is_read', false)
                    ->count();

                $contact->last_message = $lastMessage ? $lastMessage->message : null;
                $contact->unread_count = $unreadCount;
                $contact->last_message_time = $lastMessage ? $lastMessage->created_at : null;

                return $contact;
            })
            // Urutkan kontak berdasarkan waktu pesan terakhir
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json($contacts);
    }

    /**
     * Mendapatkan semua user untuk memulai chat baru (semua role yang login bisa akses).
     * Endpoint: GET /api/chats/users
     */
    public function getAllUsers(Request $request)
    {
        $users = User::where('id', '!=', $request->user()->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json($users);
    }

    /**
     * Mendapatkan riwayat percakapan dengan user tertentu.
     * Endpoint: GET /api/chats/conversation/{userId}
     */
    public function getConversation(Request $request, $userId)
    {
        User::findOrFail($userId); // Pastikan user lawan bicara ada
        $currentUserId = $request->user()->id;

        $messages = Chat::where(function ($query) use ($currentUserId, $userId) {
                // Pesan dari user saat ini ke user lawan
                $query->where('sender_id', $currentUserId)->where('receiver_id', $userId);
            })->orWhere(function ($query) use ($currentUserId, $userId) {
                // Pesan dari user lawan ke user saat ini
                $query->where('sender_id', $userId)->where('receiver_id', $currentUserId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Tandai pesan yang diterima sebagai sudah dibaca
        Chat::where('sender_id', $userId)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    /**
     * Menghapus pesan (hanya untuk pengirim).
     * Endpoint: DELETE /api/chats/{chatId}
     */
    public function deleteMessage(Request $request, $chatId)
    {
        $message = Chat::findOrFail($chatId);

        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Pesan berhasil dihapus.']);
    }

    /**
     * Menandai pesan dari user tertentu sebagai sudah dibaca (dipanggil oleh frontend setelah fetch conversation).
     * Endpoint: PUT /api/chats/read/{userId}
     */
    public function markAsRead(Request $request, $userId)
    {
        $currentUserId = $request->user()->id;

        Chat::where('sender_id', $userId)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Pesan ditandai sudah dibaca.']);
    }

    /**
     * Mendapatkan jumlah total pesan yang belum dibaca untuk notifikasi.
     * Endpoint: GET /api/chats/unread
     */
    public function getUnreadCount(Request $request)
    {
        $currentUserId = $request->user()->id;

        $unreadCount = Chat::where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $unreadCount]);
    }
}
