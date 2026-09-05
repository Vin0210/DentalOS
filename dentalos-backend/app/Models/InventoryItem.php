<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class InventoryItem extends Model
{
    use SoftDeletes;
    protected $fillable = ['branch_id','category_id','supplier_id','name','sku','unit','quantity','min_stock','cost','price','expires_at'];
    protected $casts = ['quantity' => 'decimal:2','min_stock' => 'decimal:2','cost' => 'decimal:2','price' => 'decimal:2','expires_at' => 'date'];
    protected $appends = ['is_low_stock'];
    public function getIsLowStockAttribute(): bool { return (float) $this->quantity <= (float) $this->min_stock; }
    public function transactions() { return $this->hasMany(InventoryTransaction::class); }
    public function category() { return $this->belongsTo(InventoryCategory::class, 'category_id'); }
    public function supplier() { return $this->belongsTo(Supplier::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
}
