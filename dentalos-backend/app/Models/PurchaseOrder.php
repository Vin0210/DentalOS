<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PurchaseOrder extends Model
{
    protected $fillable = ['supplier_id','branch_id','po_no','status','total','expected_at','created_by'];
    protected $casts = ['total' => 'decimal:2','expected_at' => 'date'];
    public function items() { return $this->hasMany(PurchaseOrderItem::class); }
    public function supplier() { return $this->belongsTo(Supplier::class); }
}
