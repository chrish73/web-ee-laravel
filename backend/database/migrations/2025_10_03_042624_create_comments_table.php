<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) { 
            $table->id();
            // Relasi ke Post
            $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
            // Relasi ke Anggota (user_id)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content'); // Isi Komentar
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
