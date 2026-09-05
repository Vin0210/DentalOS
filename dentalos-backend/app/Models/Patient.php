<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;
    protected $fillable = ['clinic_id','branch_id','patient_no','first_name','last_name','middle_name','date_of_birth','gender','phone','email','address','city','emergency_name','emergency_phone','blood_type','status','primary_dentist_id','notes','last_visit_at'];
    protected $casts = ['date_of_birth' => 'date', 'last_visit_at' => 'datetime'];
    protected $appends = ['full_name','age'];

    public function getFullNameAttribute(): string { return trim("{$this->first_name} {$this->middle_name} {$this->last_name}"); }
    public function getAgeAttribute(): ?int { return $this->date_of_birth ? now()->diffInYears($this->date_of_birth) : null; }

    public function medicalHistory() { return $this->hasOne(PatientMedicalHistory::class); }
    public function dentalHistory() { return $this->hasOne(PatientDentalHistory::class); }
    public function files() { return $this->hasMany(PatientFile::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function treatmentPlans() { return $this->hasMany(TreatmentPlan::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
    public function odontogram() { return $this->hasMany(OdontogramRecord::class); }
    public function clinicalNotes() { return $this->hasMany(ClinicalNote::class); }
    public function prescriptions() { return $this->hasMany(Prescription::class); }
    public function primaryDentist() { return $this->belongsTo(Dentist::class, 'primary_dentist_id'); }
}
