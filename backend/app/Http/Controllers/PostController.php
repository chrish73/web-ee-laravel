<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    // --- Rute Publik (Landing Page) ---
    public function getPublicPosts()
    {
        // Ambil semua post yang ditandai sebagai 'is_public'
        $posts = Post::with(['user:id,name,role', 'comments.user:id,name,role'])
            ->where('is_public', true)
            ->withCount('views')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    // --- Rute Staf (Buat/Kelola Post) ---
    public function getMyPosts(Request $request)
    {
        // Hanya menampilkan post yang dibuat oleh staf yang sedang login
        $posts = Post::with(['user:id,name,role', 'comments.user:id,name,role'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    public function createPost(Request $request)
    {
        // Hanya Staf dan Admin yang bisa memposting (diatur di route middleware)
        $validatedData = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:32000',
            'is_public' => 'boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // Store file di storage/app/public/posts
            // Dan simpan path relatifnya (posts/filename.jpg)
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        $post = Post::create([
            'user_id' => $request->user()->id,
            'title' => $validatedData['title'],
            'content' => $validatedData['content'],
            'image_path' => $imagePath, // Simpan: "posts/filename.jpg"
            'is_public' => $validatedData['is_public'] ?? true,
        ]);

        // Load relasi untuk response
        $post->load(['user:id,name,role', 'comments']);

        return response()->json(['message' => 'Pengumuman berhasil diposting.', 'post' => $post], 201);
    }

    public function deletePost(Request $request, $postId)
    {
        $post = Post::findOrFail($postId);

        // Memastikan hanya staf yang membuat post atau Admin yang bisa menghapus
        if ($post->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus post ini.'], 403);
        }

        // Hapus file gambar jika ada
        if ($post->image_path && Storage::disk('public')->exists($post->image_path)) {
            Storage::disk('public')->delete($post->image_path);
        }

        $post->delete();

        return response()->json(['message' => 'Pengumuman berhasil dihapus.']);
    }

    // --- Rute Anggota (Komentar) ---
    public function createComment(Request $request, $postId)
    {
        $post = Post::findOrFail($postId);

        $validatedData = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $validatedData['content'],
        ]);

        return response()->json(['message' => 'Komentar berhasil ditambahkan.', 'comment' => $comment->load('user:id,name,role')], 201);
    }

    public function deleteComment(Request $request, $commentId)
    {
        $comment = Comment::findOrFail($commentId);

        // Memastikan hanya user yang membuat komentar atau Admin/Staf yang membuat Post yang bisa menghapus
        $post = $comment->post;

        $isPostCreator = $post->user_id === $request->user()->id;
        $isCommentCreator = $comment->user_id === $request->user()->id;
        $isAdmin = $request->user()->role === 'admin';

        if (!$isAdmin && !$isPostCreator && !$isCommentCreator) {
            return response()->json(['message' => 'Forbidden. Anda tidak memiliki akses untuk menghapus komentar ini.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Komentar berhasil dihapus.']);
    }
}

