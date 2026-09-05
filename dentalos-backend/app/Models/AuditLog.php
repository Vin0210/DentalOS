<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AuditLog extends Model
{
    protected $fillable = ['user_id','action','entity','entity_id','description','meta','ip'];
    protected $casts = ['meta' => 'array'];
    public function user() { return $this->belongsTo(User::class); }
    public static function record(?int $userId, string $action, ?string $entity = null, $entityId = null, ?string $description = null, array $meta = [], ?string $ip = null): void
    {
        static::create(['user_id' => $userId,'action' => $action,'entity' => $entity,'entity_id' => $entityId,'description' => $description,'meta' => $meta,'ip' => $ip]);
    }
}
