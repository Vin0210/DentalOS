<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['invoice_id','patient_id','amount','method','reference','notes','received_by'];
    protected $casts = ['amount' => 'decimal:2'];
    public function invoice() { return $this->belongsTo(Invoice::class); }
    protected static function booted(): void
    {
        static::saved(fn ($p) => $p->invoice?->recalculate());
        static::deleted(fn ($p) => $p->invoice?->recalculate());
    }
}
