<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dentist extends Model
{
    use SoftDeletes;
    protected $fillable = ['user_id','branch_id','license_no','specialization','commission_rate','bio','schedule','color','is_active'];
    protected $casts = ['schedule' => 'array', 'is_active' => 'boolean', 'commission_rate' => 'decimal:2'];
    protected $appends = ['name'];
    public function user() { return $this->belongsTo(User::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function getNameAttribute(): string { return $this->user?->name ?? 'Dentist'; }
}
