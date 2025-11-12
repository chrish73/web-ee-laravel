<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =======================================================
// --- Rute Publik (tanpa autentikasi) ---
// =======================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Post Publik (Dapat dilihat oleh non-logged in user)
Route::get('posts', [PostController::class, 'getPublicPosts']);
Route::post('posts/{postId}/view', [App\Http\Controllers\AnalyticsController::class, 'trackPostView']);

//streaming public
Route::prefix('public')->group(function () {
    Route::get('streams', [StreamController::class, 'getStreams']);
    Route::get('streams/{id}', [StreamController::class, 'getStream']);
});


// =======================================================
// --- Rute Terproteksi (Wajib Autentikasi) ---
// =======================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'user']);

    // --- ADMIN ROUTES (Hanya Admin) ---
    Route::prefix('admin')->middleware('role.check:admin')->group(function () {
        // User Management
        Route::get('users', [AdminController::class, 'getAllUsers']);
        Route::get('users/{id}', [AdminController::class, 'getUser']);
        Route::put('users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
        Route::post('users/{id}/promote', [AdminController::class, 'promoteToStaff']);
        Route::post('users/{id}/demote', [AdminController::class, 'demoteToMember']);

        // Schedule Management
        Route::get('schedules', [AdminController::class, 'getAllSchedules']);
        Route::get('staff/{staffId}/schedules', [AdminController::class, 'getStaffSchedules']);
        Route::post('staff/{staffId}/schedules', [AdminController::class, 'createSchedule']);
        Route::put('schedules/{scheduleId}', [AdminController::class, 'updateSchedule']);
        Route::delete('schedules/{scheduleId}', [AdminController::class, 'deleteSchedule']);

        // Post Management
        Route::delete('posts/{postId}', [PostController::class, 'deletePost']);

        // Analytics
        Route::get('analytics/stats', [App\Http\Controllers\AnalyticsController::class, 'getDashboardStats']);
    });

    // --- STAFF ROUTES (Hanya Staf/Admin) ---
    Route::prefix('staf')->middleware('role.check:staf,admin')->group(function () {
        Route::get('schedules', [AdminController::class, 'getMySchedules']);
        Route::get('posts', [PostController::class, 'getMyPosts']);
        Route::post('posts', [PostController::class, 'createPost']);
        Route::delete('posts/{postId}', [PostController::class, 'deletePost']);
    });

    // --- CHAT ROUTES (Semua Role - Pribadi) ---
    Route::post('chats/send', [ChatController::class, 'sendMessage']);
    Route::get('chats/contacts', [ChatController::class, 'getContacts']);
    Route::get('chats/users', [ChatController::class, 'getAllUsers']);
    Route::get('chats/conversation/{userId}', [ChatController::class, 'getConversation']);
    Route::delete('chats/{chatId}', [ChatController::class, 'deleteMessage']);
    Route::put('chats/read/{userId}', [ChatController::class, 'markAsRead']);
    Route::get('chats/unread', [ChatController::class, 'getUnreadCount']);

    // --- POST & COMMENT ROUTES (Semua Role) ---
    Route::post('posts/{postId}/comments', [PostController::class, 'createComment']);
    Route::delete('comments/{commentId}', [PostController::class, 'deleteComment']);
});


Route::middleware(['auth:sanctum', 'role.check:staf,admin'])->group(function () {
    Route::post('streams', [StreamController::class, 'createStream']);
    Route::delete('/streams/{id}', [StreamController::class, 'deleteStream']);
});


