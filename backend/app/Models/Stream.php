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
        'youtube_url',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
