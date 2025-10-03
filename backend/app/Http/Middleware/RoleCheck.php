<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleCheck
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Pastikan pengguna sudah terautentikasi (seharusnya sudah dijamin oleh auth:sanctum, tapi kita cek lagi)
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 2. Periksa apakah role pengguna cocok dengan role yang diperlukan
        // Perhatian: Properti 'role' harus ada di objek user Anda.
        if ($request->user()->role !== $role) {
            return response()->json(['message' => 'Forbidden. Access restricted to ' . $role . ' role.'], 403);
        }

        return $next($request);
    }
}
