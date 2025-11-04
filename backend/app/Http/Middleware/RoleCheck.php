<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleCheck
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Pastikan user sudah login
        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Periksa apakah role user termasuk dalam daftar role yang diizinkan
        if (! in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. Access restricted to roles: ' . implode(', ', $roles),
            ], 403);
        }

        return $next($request);
    }
}
