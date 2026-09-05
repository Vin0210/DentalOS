<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    protected $fillable = ['invoice_id','payment_id','amount','reason','created_by'];
    protected $casts = ['amount' => 'decimal:2'];
    protected static function booted(): void
    {
        static::saved(fn ($r) => $r->invoice?->recalculate());
    }
    public function invoice() { return $this->belongsTo(Invoice::class); }
}
