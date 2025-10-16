<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rute Publik (tanpa autentikasi)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('posts', [PostController::class, 'getPublicPosts']); // Postingan untuk Landing Page/Anggota

// Di luar middleware auth (untuk tracking view publik)
Route::post('posts/{postId}/view', [App\Http\Controllers\AnalyticsController::class, 'trackPostView']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'user']);

    // =======================================================
    // --- Rute KHUSUS ADMIN (Perlu Autentikasi & Role Admin) ---
    // =======================================================
    Route::prefix('admin')->middleware('role.check:admin')->group(function () {
        // Manajemen User
        Route::get('users', [AdminController::class, 'getAllUsers']);
        Route::get('users/{id}', [AdminController::class, 'getUser']);
        Route::put('users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);

        // Promosi/Demote
        Route::post('users/{id}/promote', [AdminController::class, 'promoteToStaff']);
        Route::post('users/{id}/demote', [AdminController::class, 'demoteToMember']);

        // Manajemen Jadwal (untuk semua staf)
        Route::get('schedules', [AdminController::class, 'getAllSchedules']);
        // Jadwal per staf
        Route::get('staff/{staffId}/schedules', [AdminController::class, 'getStaffSchedules']);
        Route::post('staff/{staffId}/schedules', [AdminController::class, 'createSchedule']);
        // Update & Delete jadwal
        Route::put('schedules/{scheduleId}', [AdminController::class, 'updateSchedule']);
        Route::delete('schedules/{scheduleId}', [AdminController::class, 'deleteSchedule']);
        Route::delete('posts/{postId}', [PostController::class, 'deletePost']);


        Route::get('analytics/stats', [App\Http\Controllers\AnalyticsController::class, 'getDashboardStats']);
    });

    // =======================================================
    // --- Rute KHUSUS STAF (Perlu Autentikasi & Role Staf) ---
    // =======================================================
    Route::prefix('staf')->middleware('role.check:staf')->group(function () {
        // Staf: Melihat Jadwalnya Sendiri
        // Menggunakan endpoint yang sudah ada, tapi memfilter berdasarkan user yang login
        // ASUMSI: AdminController memiliki method getMySchedules() yang mengembalikan jadwal user yang sedang login.
        // Jika tidak, Anda perlu membuat method baru di AdminController atau StaffController.
        // UNTUK SEMENTARA, KITA GUNAKAN ENDPOINT getStaffSchedules DENGAN ID USER SAAT INI (diambil dari token)
        Route::get('schedules', [AdminController::class, 'getMySchedules']); // Perlu modifikasi AdminController

        // Staf: Kelola Postingan
        Route::get('posts', [PostController::class, 'getMyPosts']); // Lihat post sendiri
        Route::post('posts', [PostController::class, 'createPost']); // Posting pengumuman (termasuk untuk landing page)
        Route::delete('posts/{postId}', [PostController::class, 'deletePost']); // Hapus post
    });

    // =======================================================
    // --- Rute UMUM (Anggota, Staf, Admin) untuk Interaksi Post ---
    // =======================================================
    // Komentar: Semua role yang terautentikasi dapat berkomentar
    Route::post('posts/{postId}/comments', [PostController::class, 'createComment']);
    // Hapus Komentar: Hanya user pembuat, staf pembuat post, atau admin yang bisa menghapus
    Route::delete('comments/{commentId}', [PostController::class, 'deleteComment']);

});
