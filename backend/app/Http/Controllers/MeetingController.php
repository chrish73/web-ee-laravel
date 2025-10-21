<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;
use Carbon\Carbon;

class MeetingController extends Controller
{
    // Admin/Staf: Membuat meeting baru
    public function createMeeting(Request $request)
    {
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'duration' => 'required|integer|min:15|max:480',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $meeting = Meeting::create([
            'host_id' => $request->user()->id,
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'scheduled_at' => $validatedData['scheduled_at'],
            'duration' => $validatedData['duration'],
            'status' => 'scheduled',
        ]);

        // Tambahkan participants jika ada
        if (!empty($validatedData['participant_ids'])) {
            $meeting->participants()->attach($validatedData['participant_ids']);
        }

        return response()->json([
            'message' => 'Meeting berhasil dibuat.',
            'meeting' => $meeting->load('host:id,name,role', 'participants:id,name,email,role')
        ], 201);
    }

    // Admin/Staf: Memulai meeting
    public function startMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);

        if ($meeting->host_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $meeting->update(['status' => 'ongoing']);

        return response()->json([
            'message' => 'Meeting dimulai.',
            'meeting' => $meeting
        ]);
    }

    // Admin/Staf: Mengakhiri meeting
    public function endMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);

        if ($meeting->host_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $meeting->update(['status' => 'ended']);

        return response()->json([
            'message' => 'Meeting berakhir.',
            'meeting' => $meeting
        ]);
    }

    // Semua: Melihat daftar meeting
    public function getMeetings(Request $request)
    {
        $userId = $request->user()->id;
        $role = $request->user()->role;

        $meetings = Meeting::with('host:id,name,role', 'participants:id,name,role')
            ->when($role !== 'admin', function($query) use ($userId) {
                // Tampilkan meeting yang user adalah host atau participant
                return $query->where('host_id', $userId)
                    ->orWhereHas('participants', function($q) use ($userId) {
                        $q->where('user_id', $userId);
                    });
            })
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json($meetings);
    }

    // Semua: Melihat detail meeting
    public function getMeeting($meetingId)
    {
        $meeting = Meeting::with('host:id,name,role', 'participants:id,name,email,role')
            ->findOrFail($meetingId);

        return response()->json($meeting);
    }

    // User: Join meeting
    public function joinMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $userId = $request->user()->id;

        // Check if user is already a participant
        if (!$meeting->participants->contains($userId)) {
            $meeting->participants()->attach($userId, [
                'joined_at' => Carbon::now()
            ]);
        } else {
            // Update joined_at
            $meeting->participants()->updateExistingPivot($userId, [
                'joined_at' => Carbon::now()
            ]);
        }

        return response()->json([
            'message' => 'Berhasil join meeting.',
            'meeting' => $meeting->load('participants')
        ]);
    }

    // User: Leave meeting
    public function leaveMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);
        $userId = $request->user()->id;

        $meeting->participants()->updateExistingPivot($userId, [
            'left_at' => Carbon::now()
        ]);

        return response()->json(['message' => 'Berhasil meninggalkan meeting.']);
    }

    // Admin/Staf: Menghapus meeting
    public function deleteMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);

        if ($meeting->host_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $meeting->delete();

        return response()->json(['message' => 'Meeting berhasil dihapus.']);
    }

    // Update meeting
    public function updateMeeting(Request $request, $meetingId)
    {
        $meeting = Meeting::findOrFail($meetingId);

        if ($meeting->host_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration' => 'required|integer|min:15|max:480',
            'participant_ids' => 'nullable|array',
            'participant_ids.*' => 'exists:users,id',
        ]);

        $meeting->update([
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'scheduled_at' => $validatedData['scheduled_at'],
            'duration' => $validatedData['duration'],
        ]);

        // Update participants jika ada
        if (isset($validatedData['participant_ids'])) {
            $meeting->participants()->sync($validatedData['participant_ids']);
        }

        return response()->json([
            'message' => 'Meeting berhasil diupdate.',
            'meeting' => $meeting->load('host:id,name,role', 'participants:id,name,email,role')
        ]);
    }
}
