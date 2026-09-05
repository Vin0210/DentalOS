<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryTransaction;

class InventoryService
{
    public function adjust(InventoryItem $item, string $type, float $qty, ?string $notes, ?int $userId): InventoryItem
    {
        $qty = abs($qty);
        if ($type === 'in') $item->quantity += $qty;
        elseif ($type === 'out') $item->quantity = max(0, $item->quantity - $qty);
        $item->save();
        InventoryTransaction::create([
            'inventory_item_id' => $item->id, 'type' => $type,
            'quantity' => $qty, 'balance_after' => $item->quantity,
            'notes' => $notes, 'created_by' => $userId,
        ]);
        return $item;
    }
}
