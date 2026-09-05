<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    protected $fillable = ['category_id','name','code','description','default_price','duration_minutes','is_active'];
    protected $casts = ['default_price' => 'decimal:2', 'is_active' => 'boolean'];
    public function category() { return $this->belongsTo(ProcedureCategory::class, 'category_id'); }
}
