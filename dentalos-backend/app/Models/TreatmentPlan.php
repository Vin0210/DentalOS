<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TreatmentPlan extends Model
{
    use SoftDeletes;
    protected $fillable = ['patient_id','dentist_id','title','status','discount','notes'];
    protected $casts = ['discount' => 'decimal:2'];
    protected $appends = ['total'];
    public function items() { return $this->hasMany(TreatmentPlanItem::class); }
    public function patient() { return $this->belongsTo(Patient::class); }
    public function dentist() { return $this->belongsTo(Dentist::class); }
    public function getTotalAttribute(): float
    {
        $sum = $this->items->sum('estimated_cost');
        return max(0, $sum - (float) $this->discount);
    }
}
