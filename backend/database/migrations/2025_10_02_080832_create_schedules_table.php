<?php

// backend/database/migrations/xxxx_xx_xx_create_schedules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            // Menghubungkan jadwal dengan pengguna (Staf)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('activity'); // Deskripsi kegiatan
            $table->dateTime('scheduled_start'); // Waktu mulai
            $table->dateTime('scheduled_end')->nullable(); // Waktu selesai (opsional)
            $table->string('location')->nullable(); // Lokasi kegiatan
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
