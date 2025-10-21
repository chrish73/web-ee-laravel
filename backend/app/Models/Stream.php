<?php
// app/Models/Stream.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Stream extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'stream_key',
        'stream_url',
        'status',
        'scheduled_at',
        'started_at',
        'ended_at',
        'viewers_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($stream) {
            if (empty($stream->stream_key)) {
                $stream->stream_key = Str::random(32);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
