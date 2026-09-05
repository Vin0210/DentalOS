<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = ['branch_id','name','code','type','is_active'];
    protected $casts = ['is_active' => 'boolean'];
    public function branch() { return $this->belongsTo(Branch::class); }
}
