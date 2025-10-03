<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Rule;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    // HAPUS KONSTRUKTOR YANG BERMASALAH
    // Logika Role Check akan dipindahkan ke routes/api.php
    // public function __construct() { ... }

    // --- Manajemen User (Anggota & Staf) ---
    public function getAllUsers()
    {
        // Mengambil semua user, diurutkan berdasarkan role
        $users = User::orderBy('role')->get(['id', 'name', 'email', 'role']);

        return response()->json($users);
    }

    public function getUser($id)
    {
        $user = User::findOrFail($id, ['id', 'name', 'email', 'role', 'created_at']);
        return response()->json($user);
    }

    // Admin dapat menghapus user (Anggota/Staf)
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        // Mencegah Admin menghapus dirinya sendiri
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Admin cannot delete their own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    // Admin dapat mengedit data user (kecuali password dan role)
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validatedData);

        return response()->json(['message' => 'User updated successfully.', 'user' => $user->only(['id', 'name', 'email', 'role'])]);
    }

    // --- Mengangkat Anggota sebagai Staf ---
    public function promoteToStaff($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot change Admin role via this route.'], 403);
        }

        if ($user->role === 'staf') {
            return response()->json(['message' => 'User is already a Staff member.'], 400);
        }

        $user->role = 'staf';
        $user->save();

        return response()->json(['message' => 'User promoted to Staff successfully.', 'user' => $user->only(['id', 'name', 'email', 'role'])]);
    }

    // Opsional: Menurunkan Staf menjadi Anggota
    public function demoteToMember($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot change Admin role via this route.'], 403);
        }

        if ($user->role === 'anggota') {
            return response()->json(['message' => 'User is already a regular member.'], 400);
        }

        $user->role = 'anggota';
        $user->save();

        $user->schedules()->delete();

        return response()->json(['message' => 'Staff demoted to Member successfully.', 'user' => $user->only(['id', 'name', 'email', 'role'])]);
    }

    // --- Manajemen Jadwal (Khusus untuk Staf) ---

    public function getAllSchedules()
    {
        $schedules = Schedule::with('user:id,name,role')->orderBy('scheduled_start', 'desc')->get();
        return response()->json($schedules);
    }

    public function getStaffSchedules($staffId)
    {
        $staff = User::where('id', $staffId)->whereIn('role', ['staf', 'admin'])->firstOrFail();

        $schedules = $staff->schedules()->orderBy('scheduled_start', 'asc')->get();
        return response()->json(['staff' => $staff->only(['id', 'name', 'role']), 'schedules' => $schedules]);
    }

    public function createSchedule(Request $request, $staffId)
    {
        $staff = User::where('id', $staffId)->whereIn('role', ['staf', 'admin'])->firstOrFail();

        $validatedData = $request->validate([
            'activity' => 'required|string|max:255',
            'scheduled_start' => 'required|date',
            'scheduled_end' => 'nullable|date|after_or_equal:scheduled_start',
            'location' => 'nullable|string|max:255',
        ]);

        $schedule = $staff->schedules()->create($validatedData);

        return response()->json(['message' => 'Schedule created successfully.', 'schedule' => $schedule], 201);
    }

    public function updateSchedule(Request $request, $scheduleId)
    {
        $schedule = Schedule::findOrFail($scheduleId);

        $validatedData = $request->validate([
            'activity' => 'required|string|max:255',
            'scheduled_start' => 'required|date',
            'scheduled_end' => 'nullable|date|after_or_equal:scheduled_start',
            'location' => 'nullable|string|max:255',
        ]);

        $schedule->update($validatedData);

        return response()->json(['message' => 'Schedule updated successfully.', 'schedule' => $schedule]);
    }

    public function deleteSchedule($scheduleId)
    {
        Schedule::findOrFail($scheduleId)->delete();

        return response()->json(['message' => 'Schedule deleted successfully.']);
    }
}
