<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class InventoryTransaction extends Model
{
    protected $fillable = ['inventory_item_id','type','quantity','balance_after','notes','created_by'];
    protected $casts = ['quantity' => 'decimal:2','balance_after' => 'decimal:2'];
    public function item() { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
}
