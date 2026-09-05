<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PurchaseOrderItem extends Model
{
    protected $fillable = ['purchase_order_id','inventory_item_id','name','quantity','unit_cost','amount'];
    protected $casts = ['unit_cost' => 'decimal:2','amount' => 'decimal:2'];
    public function order() { return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id'); }
}
