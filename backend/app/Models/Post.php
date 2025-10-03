<?php
// backend/app/Models/Post.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'image_path',
        'is_public',
    ];

    // Staf yang membuat post
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Komentar-komentar pada post ini
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
