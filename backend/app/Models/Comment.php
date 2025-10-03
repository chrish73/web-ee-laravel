<?php
// backend/app/Models/Comment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
    ];

    // Post yang dikomentari
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    // User yang membuat komentar
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
