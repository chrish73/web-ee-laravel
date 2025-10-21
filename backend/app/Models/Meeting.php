<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'host_id',
        'title',
        'description',
        'meeting_id',
        'meeting_password',
        'scheduled_at',
        'duration',
        'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($meeting) {
            if (empty($meeting->meeting_id)) {
                $meeting->meeting_id = Str::random(10);
            }
            if (empty($meeting->meeting_password)) {
                $meeting->meeting_password = Str::random(6);
            }
        });
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'meeting_participants')
                    ->withPivot('joined_at', 'left_at')
                    ->withTimestamps();
    }
}
