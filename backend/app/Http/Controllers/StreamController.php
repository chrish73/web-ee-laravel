<?php

namespace App\Http\Controllers;

use App\Models\Stream;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StreamController extends Controller
{
    // Admin/Staf: Membuat live stream baru
    public function createStream(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $stream = Stream::create([
            'user_id' => $request->user()->id,
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'scheduled_at' => $validatedData['scheduled_at'] ?? null,
            'status' => 'scheduled',
        ]);

        return response()->json([
            'message' => 'Stream berhasil dibuat.',
            'stream' => $stream->load('user:id,name,role')
        ], 201);
    }

    // Admin/Staf: Memulai live stream
    public function startStream(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        if ($stream->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($stream->status === 'live') {
            return response()->json(['message' => 'Stream sudah dimulai.'], 400);
        }

        $stream->update([
            'status' => 'live',
            'started_at' => Carbon::now(),
            'stream_url' => 'rtmp://your-server-ip:1935/live/' . $stream->stream_key, // Sesuaikan dengan server RTMP Anda
        ]);

        return response()->json([
            'message' => 'Stream dimulai.',
            'stream' => $stream
        ]);
    }

    // Admin/Staf: Mengakhiri live stream
    public function endStream(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        if ($stream->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $stream->update([
            'status' => 'ended',
            'ended_at' => Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Stream berakhir.',
            'stream' => $stream
        ]);
    }

    // Semua: Melihat daftar stream yang live atau scheduled
    public function getStreams(Request $request)
    {
        $status = $request->query('status', 'live'); // live, scheduled, ended, all

        $streams = Stream::with('user:id,name,role')
            ->when($status !== 'all', function($query) use ($status) {
                return $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($streams);
    }

    // Semua: Melihat detail stream
    public function getStream($streamId)
    {
        $stream = Stream::with('user:id,name,role')->findOrFail($streamId);
        return response()->json($stream);
    }

    // Semua: Update viewers count
    public function updateViewers(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        $validated = $request->validate([
            'viewers_count' => 'required|integer|min:0'
        ]);

        $stream->update([
            'viewers_count' => $validated['viewers_count']
        ]);

        return response()->json([
            'message' => 'Viewers updated.',
            'viewers_count' => $stream->viewers_count
        ]);
    }

    // Admin/Staf: Menghapus stream
    public function deleteStream(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        if ($stream->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $stream->delete();

        return response()->json(['message' => 'Stream berhasil dihapus.']);
    }

    // Admin/Staf: Update stream
    public function updateStream(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        if ($stream->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
        ]);

        $stream->update([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'scheduled_at' => $validatedData['scheduled_at'] ?? null,
        ]);

        return response()->json([
            'message' => 'Stream berhasil diupdate.',
            'stream' => $stream->load('user:id,name,role')
        ]);
    }

    // Semua: Get my streams (untuk staf melihat stream mereka sendiri)
    public function getMyStreams(Request $request)
    {
        $userId = $request->user()->id;

        $streams = Stream::where('user_id', $userId)
            ->with('user:id,name,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($streams);
    }

    // Admin: Get all streams with stats
    public function getStreamStats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $stats = [
            'total_streams' => Stream::count(),
            'live_streams' => Stream::where('status', 'live')->count(),
            'scheduled_streams' => Stream::where('status', 'scheduled')->count(),
            'ended_streams' => Stream::where('status', 'ended')->count(),
            'total_viewers' => Stream::sum('viewers_count'),
            'average_viewers' => Stream::where('status', 'ended')->avg('viewers_count'),
            'top_streams' => Stream::where('status', 'ended')
                ->orderBy('viewers_count', 'desc')
                ->limit(5)
                ->with('user:id,name,role')
                ->get(['id', 'title', 'viewers_count', 'user_id', 'started_at', 'ended_at']),
        ];

        return response()->json($stats);
    }

    // Increment viewer (dipanggil ketika user join stream)
    public function incrementViewer(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        $stream->increment('viewers_count');

        return response()->json([
            'message' => 'Viewer count incremented.',
            'viewers_count' => $stream->viewers_count
        ]);
    }

    // Decrement viewer (dipanggil ketika user leave stream)
    public function decrementViewer(Request $request, $streamId)
    {
        $stream = Stream::findOrFail($streamId);

        if ($stream->viewers_count > 0) {
            $stream->decrement('viewers_count');
        }

        return response()->json([
            'message' => 'Viewer count decremented.',
            'viewers_count' => $stream->viewers_count
        ]);
    }
}
