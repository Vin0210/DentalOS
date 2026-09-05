<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;
    protected $fillable = ['clinic_id','branch_id','patient_id','invoice_no','status','subtotal','discount','tax','total','paid','balance','due_date','notes','created_by'];
    protected $casts = ['due_date' => 'date', 'subtotal' => 'decimal:2', 'discount' => 'decimal:2', 'tax' => 'decimal:2', 'total' => 'decimal:2', 'paid' => 'decimal:2', 'balance' => 'decimal:2'];
    public function items() { return $this->hasMany(InvoiceItem::class); }
    public function payments() { return $this->hasMany(Payment::class); }
    public function patient() { return $this->belongsTo(Patient::class); }
    public function recalculate(): void
    {
        $subtotal = $this->items()->sum('amount');
        $total = max(0, $subtotal - (float) $this->discount + (float) $this->tax);
        $paid = (float) $this->payments()->sum('amount') - (float) $this->refunds()->sum('amount');
        $this->subtotal = $subtotal;
        $this->total = $total;
        $this->paid = max(0, $paid);
        $this->balance = max(0, $total - $this->paid);
        $this->status = $this->balance <= 0 && $total > 0 ? 'paid' : ($this->paid > 0 ? 'partial' : ($total <= 0 ? 'paid' : 'unpaid'));
        $this->save();
    }
    public function refunds() { return $this->hasMany(Refund::class); }
}
