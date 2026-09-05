<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AppNotification extends Model
{
    protected $table = 'notifications';
    protected $fillable = ['user_id','type','title','body','link','read_at'];
    protected $casts = ['read_at' => 'datetime'];
}
