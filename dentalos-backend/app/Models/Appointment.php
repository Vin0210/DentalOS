<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;
    protected $fillable = ['clinic_id','branch_id','patient_id','dentist_id','room_id','procedure_id','date','start_time','end_time','status','notes','created_by'];
    protected $casts = ['date' => 'date'];
    protected $with = [];

    public const STATUSES = ['scheduled','confirmed','checked_in','in_progress','completed','cancelled','no_show'];
    public const FLOW = ['scheduled' => 'confirmed','confirmed' => 'checked_in','checked_in' => 'in_progress','in_progress' => 'completed'];

    public function patient() { return $this->belongsTo(Patient::class); }
    public function dentist() { return $this->belongsTo(Dentist::class); }
    public function room() { return $this->belongsTo(Room::class); }
    public function procedure() { return $this->belongsTo(Procedure::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
}
