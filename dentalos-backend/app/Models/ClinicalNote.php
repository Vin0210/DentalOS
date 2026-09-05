<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicalNote extends Model
{
    protected $fillable = ['patient_id','dentist_id','appointment_id','chief_complaint','examination','diagnosis','treatment_performed','materials_used','dentist_notes','follow_up_instructions'];
    public function patient() { return $this->belongsTo(Patient::class); }
    public function dentist() { return $this->belongsTo(Dentist::class); }
}
