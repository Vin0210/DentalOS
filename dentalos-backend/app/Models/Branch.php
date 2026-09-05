<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;
    protected $fillable = ['clinic_id','name','code','phone','address','city','is_active','opens_at','closes_at'];
    protected $casts = ['is_active' => 'boolean'];
    public function clinic() { return $this->belongsTo(Clinic::class); }
    public function rooms() { return $this->hasMany(Room::class); }
    public function dentists() { return $this->hasMany(Dentist::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
}
