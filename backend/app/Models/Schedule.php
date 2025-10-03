<?php

// backend/app/Models/Schedule.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity',
        'scheduled_start',
        'scheduled_end',
        'location',
    ];

    protected $casts = [
        'scheduled_start' => 'datetime',
        'scheduled_end' => 'datetime',
    ];

    // Relasi ke Model User (staff yang memiliki jadwal)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
