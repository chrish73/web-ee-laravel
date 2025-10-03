<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rute Publik (tanpa autentikasi)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Grup Rute Admin. Proteksi berlapis:
    // 1. auth:sanctum (memastikan login)
    // 2. role.check:admin (memastikan role admin)
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
    });
});
