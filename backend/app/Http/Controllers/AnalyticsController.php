<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\PostView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get dashboard statistics (per hari atau per menit)
     */
   public function getDashboardStats(Request $request)
{
    $range = $request->input('range', 'day'); // default: per hari
    $days = $request->input('days', 30);
    $startDate = Carbon::now()->subDays($days)->startOfDay();

    // Total users berdasarkan role
    $usersByRole = User::select('role', DB::raw('count(*) as total'))
        ->groupBy('role')
        ->get()
        ->pluck('total', 'role');

    // Registrasi
    $registrations = User::select(
            DB::raw($range === 'minute'
                ? "TO_CHAR(created_at, 'HH24:MI') as label"
                : "TO_CHAR(created_at, 'YYYY-MM-DD') as label"),
            DB::raw('count(*) as total')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('label')
        ->orderBy('label', 'asc')
        ->get();

    // Login
    $logins = DB::table('personal_access_tokens')
        ->select(
            DB::raw($range === 'minute'
                ? "TO_CHAR(created_at, 'HH24:MI') as label"
                : "TO_CHAR(created_at, 'YYYY-MM-DD') as label"),
            DB::raw('count(*) as total')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('label')
        ->orderBy('label', 'asc')
        ->get();

    // Post views
    $postViews = PostView::select(
            DB::raw($range === 'minute'
                ? "TO_CHAR(created_at, 'HH24:MI') as label"
                : "TO_CHAR(created_at, 'YYYY-MM-DD') as label"),
            DB::raw('count(*) as total')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('label')
        ->orderBy('label', 'asc')
        ->get();

    // Top posts
    $topPosts = Post::select('posts.id', 'posts.title', DB::raw('count(post_views.id) as views'))
        ->leftJoin('post_views', 'posts.id', '=', 'post_views.post_id')
        ->groupBy('posts.id', 'posts.title')
        ->orderBy('views', 'desc')
        ->limit(5)
        ->get();

    $summary = [
        'total_users' => User::count(),
        'total_posts' => Post::count(),
        'total_views' => PostView::count(),
        'new_users_today' => User::whereDate('created_at', Carbon::today())->count(),
        'active_staff' => User::where('role', 'staf')->count(),
        'active_members' => User::where('role', 'anggota')->count(),
    ];

    return response()->json([
        'summary' => $summary,
        'users_by_role' => $usersByRole,
        'registrations' => $registrations,
        'logins' => $logins,
        'post_views' => $postViews,
        'top_posts' => $topPosts,
    ]);
}

    /**
     * Track post view
     */
public function trackPostView(Request $request, $postId)
{
    $userId = $request->user()->id ?? null;
    $ip = $request->ip();

    $alreadyViewed = PostView::where('post_id', $postId)
        ->when($userId, fn($q) => $q->where('user_id', $userId))
        ->when(!$userId, fn($q) => $q->where('ip_address', $ip))
        ->whereDate('created_at', now())
        ->exists();

    if (!$alreadyViewed) {
        PostView::create([
            'post_id' => $postId,
            'user_id' => $userId,
            'ip_address' => $ip,
        ]);
    }

    return response()->json(['message' => 'View tracked']);
}
}
