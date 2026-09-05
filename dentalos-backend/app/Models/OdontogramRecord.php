<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OdontogramRecord extends Model
{
    protected $fillable = ['patient_id','tooth_number','condition','surfaces','notes','dentist_id'];
    protected $casts = ['surfaces' => 'array'];
    public function patient() { return $this->belongsTo(Patient::class); }
    public const CONDITIONS = ['healthy','caries','filled','missing','extracted','crown','root_canal','implant','fractured','impacted','veneer','bridge'];
}
