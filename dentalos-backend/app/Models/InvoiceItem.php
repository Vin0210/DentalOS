<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = ['invoice_id','procedure_id','description','tooth_number','quantity','unit_price','amount'];
    protected $casts = ['unit_price' => 'decimal:2', 'amount' => 'decimal:2'];
    public function invoice() { return $this->belongsTo(Invoice::class); }
}
