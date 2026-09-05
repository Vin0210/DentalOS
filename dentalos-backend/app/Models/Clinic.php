<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Clinic extends Model
{
    use SoftDeletes;
    protected $fillable = ['name','code','email','phone','address','city','logo','currency','tax_rate','is_active','settings'];
    protected $casts = ['settings' => 'array', 'is_active' => 'boolean', 'tax_rate' => 'decimal:2'];
    public function branches() { return $this->hasMany(Branch::class); }
    public function users() { return $this->hasMany(User::class); }
    public function patients() { return $this->hasMany(Patient::class); }
}
