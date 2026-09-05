<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function items(Request $r) {
        $q = InventoryItem::with(['category','supplier'])->orderBy('name');
        if ($s = $r->get('search')) $q->where(fn ($w) => $w->where('name','like',"%$s%")->orWhere('sku','like',"%$s%"));
        if ($r->get('low_stock')) $q->whereColumn('quantity', '<=', 'min_stock');
        if ($r->get('branch_id')) $q->where('branch_id', $r->get('branch_id'));
        return response()->json($q->paginate(25));
    }

    public function store(Request $r) {
        $d = $r->validate(['name' => 'required|string|max:160','sku' => 'required|string|max:64|unique:inventory_items,sku','branch_id' => 'nullable|exists:branches,id','category_id' => 'nullable|exists:inventory_categories,id','supplier_id' => 'nullable|exists:suppliers,id','unit' => 'nullable|string|max:24','quantity' => 'nullable|numeric|min:0','min_stock' => 'nullable|numeric|min:0','cost' => 'nullable|numeric|min:0','price' => 'nullable|numeric|min:0','expires_at' => 'nullable|date']);
        return response()->json(InventoryItem::create($d), 201);
    }

    public function adjust(Request $r, InventoryItem $item, InventoryService $svc) {
        $d = $r->validate(['type' => 'required|in:in,out,adjust','quantity' => 'required|numeric|min:0.01','notes' => 'nullable|string']);
        if ($d['type'] === 'adjust') { $item->quantity = $d['quantity']; $item->save(); }
        else $svc->adjust($item, $d['type'], (float) $d['quantity'], $d['notes'] ?? null, $r->user()?->id);
        return response()->json($item->fresh());
    }

    public function suppliers() { return response()->json(Supplier::orderBy('name')->get()); }
    public function storeSupplier(Request $r) {
        $d = $r->validate(['name' => 'required|string|max:160','contact_person' => 'nullable|string|max:120','email' => 'nullable|email','phone' => 'nullable|string|max:40','address' => 'nullable|string']);
        return response()->json(Supplier::create($d + ['is_active' => true]), 201);
    }

    public function purchaseOrders() { return response()->json(PurchaseOrder::with(['items','supplier'])->orderByDesc('created_at')->paginate(20)); }

    public function storePO(Request $r) {
        $d = $r->validate(['supplier_id' => 'required|exists:suppliers,id','branch_id' => 'nullable|exists:branches,id','expected_at' => 'nullable|date','items' => 'required|array|min:1','items.*.name' => 'required|string','items.*.quantity' => 'required|integer|min:1','items.*.unit_cost' => 'required|numeric|min:0','items.*.inventory_item_id' => 'nullable|exists:inventory_items,id']);
        $po = PurchaseOrder::create(['supplier_id' => $d['supplier_id'],'branch_id' => $d['branch_id'] ?? null,'po_no' => 'PO-' . str_pad((string) (PurchaseOrder::count() + 1), 6, '0', STR_PAD_LEFT),'status' => 'draft','total' => 0,'expected_at' => $d['expected_at'] ?? null,'created_by' => $r->user()?->id]);
        $total = 0;
        foreach ($d['items'] as $it) { $amt = $it['quantity'] * $it['unit_cost']; $total += $amt; $po->items()->create($it + ['amount' => $amt]); }
        $po->update(['total' => $total]);
        return response()->json($po->load(['items','supplier']), 201);
    }

    public function receivePO(Request $r, PurchaseOrder $po, InventoryService $svc) {
        $po->update(['status' => 'received']);
        foreach ($po->items as $it) {
            if ($it->inventory_item_id && ($item = InventoryItem::find($it->inventory_item_id))) {
                $svc->adjust($item, 'in', (float) $it->quantity, "PO {$po->po_no} received", $r->user()?->id);
            }
        }
        return response()->json($po->fresh()->load('items'));
    }
}
