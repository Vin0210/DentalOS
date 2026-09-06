<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AppNotification extends Model
{
    protected $table = 'notifications';
    protected $fillable = ['user_id','type','title','body','link','read_at'];
    protected $casts = ['read_at' => 'datetime'];

    public static function notify(string $title, ?string $body = null, string $type = 'info', ?int $userId = null, ?string $link = null): self
    {
        return static::create(['user_id' => $userId, 'type' => $type, 'title' => $title, 'body' => $body, 'link' => $link]);
    }
}
