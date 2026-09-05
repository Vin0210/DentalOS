<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientDentalHistory extends Model
{
    protected $fillable = ['patient_id','history','oral_hygiene_notes','previous_treatments','current_conditions'];
    public function patient() { return $this->belongsTo(Patient::class); }
}
