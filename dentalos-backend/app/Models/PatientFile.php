<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientFile extends Model
{
    protected $fillable = ['patient_id','uploaded_by','name','category','path','mime','size','notes'];
    public function patient() { return $this->belongsTo(Patient::class); }
}
