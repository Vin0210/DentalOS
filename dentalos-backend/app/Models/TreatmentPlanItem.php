<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TreatmentPlanItem extends Model
{
    protected $fillable = ['treatment_plan_id','procedure_id','diagnosis_id','tooth_number','priority','estimated_cost','estimated_duration','status','notes'];
    protected $casts = ['estimated_cost' => 'decimal:2'];
    public function plan() { return $this->belongsTo(TreatmentPlan::class, 'treatment_plan_id'); }
    public function procedure() { return $this->belongsTo(Procedure::class); }
}
