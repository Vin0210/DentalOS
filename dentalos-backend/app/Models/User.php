<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'role', 'avatar',
        'is_active', 'clinic_id', 'branch_id',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public const ROLES = ['super_admin','clinic_admin','dentist','receptionist','accountant','patient'];

    public function dentist() { return $this->hasOne(Dentist::class); }
    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function branch() { return $this->belongsTo(Branch::class); }

    public function hasRole(string ...$roles): bool { return in_array($this->role, $roles); }
    public function isStaff(): bool { return in_array($this->role, ['super_admin','clinic_admin','dentist','receptionist','accountant']); }
}
