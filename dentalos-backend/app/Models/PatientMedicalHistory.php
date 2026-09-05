<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientMedicalHistory extends Model
{
    protected $fillable = ['patient_id','allergies','conditions','medications','surgeries','notes'];
    protected $casts = ['allergies' => 'array', 'conditions' => 'array', 'medications' => 'array'];
    public function patient() { return $this->belongsTo(Patient::class); }
}
