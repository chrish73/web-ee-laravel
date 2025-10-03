<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke staf (user_id) yang membuat pengumuman
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title'); // Judul Pengumuman
            $table->text('content'); // Isi Pengumuman
            $table->string('image_path')->nullable(); // Path untuk foto (opsional)
            $table->boolean('is_public')->default(true); // Apakah tampil di landing page
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
