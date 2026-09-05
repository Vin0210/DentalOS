<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Diagnosis extends Model
{
    protected $fillable = ['patient_id','dentist_id','tooth_number','code','title','description','severity'];
    public function patient() { return $this->belongsTo(Patient::class); }
}
