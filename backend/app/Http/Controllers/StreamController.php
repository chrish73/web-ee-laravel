<?php

namespace App\Http\Controllers;

use App\Models\Stream;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StreamController extends Controller
{
    // ✅ Membuat stream baru (YouTube embed)
    public function createStream(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'youtube_url' => 'required|url',
        ]);

        $stream = Stream::create([
            'user_id' => $request->user()->id ?? null,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'youtube_url' => $validated['youtube_url'],
            'status' => 'live',
        ]);

        return response()->json([
            'message' => 'Stream YouTube berhasil dibuat.',
            'stream' => $stream,
        ]);
    }

    // ✅ Menampilkan semua stream (publik)
    public function getStreams()
    {
        // Ambil semua stream dengan status 'live'
        $streams = Stream::where('status', 'live')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'description', 'youtube_url', 'status', 'created_at']);

        return response()->json($streams);
    }

    // ✅ Menampilkan detail stream berdasarkan ID
    public function getStream($id)
    {
        $stream = Stream::find($id);

        if (!$stream) {
            return response()->json(['message' => 'Stream tidak ditemukan'], 404);
        }

        return response()->json($stream);
    }

    public function deleteStream($id)
{
    $stream = Stream::find($id);

    if (!$stream) {
        return response()->json(['message' => 'Stream tidak ditemukan'], 404);
    }

    $stream->delete();

    return response()->json(['message' => 'Stream berhasil dihapus.']);
}

}
