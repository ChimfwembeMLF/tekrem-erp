<?php

namespace App\Services\Procurement;

use App\Models\Procurement\GoodsReceipt;
use App\Models\Procurement\GoodsReceiptItem;
use App\Models\Procurement\PurchaseOrder;
use App\Services\Inventory\StockService;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function __construct(private StockService $stockService) {}

    public function approve(PurchaseOrder $po, int $userId): PurchaseOrder
    {
        $po->update([
            'status' => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);

        return $po->fresh();
    }

    public function receive(PurchaseOrder $po, array $items, int $userId): GoodsReceipt
    {
        return DB::transaction(function () use ($po, $items, $userId) {
            $receipt = GoodsReceipt::create([
                'purchase_order_id' => $po->id,
                'warehouse_id' => $po->warehouse_id,
                'received_date' => now()->toDateString(),
                'status' => 'completed',
                'received_by' => $userId,
            ]);

            foreach ($items as $item) {
                $poItem = $po->items()->findOrFail($item['purchase_order_item_id']);
                $qty = (float) $item['quantity_received'];

                GoodsReceiptItem::create([
                    'goods_receipt_id' => $receipt->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'quantity_received' => $qty,
                ]);

                $poItem->increment('quantity_received', $qty);

                if ($poItem->product_id) {
                    $this->stockService->receive(
                        $poItem->product,
                        $po->warehouse,
                        $qty,
                        $receipt,
                        "Received via {$receipt->gr_number}"
                    );
                }
            }

            $allReceived = $po->items->every(fn ($i) => (float) $i->quantity_received >= (float) $i->quantity);
            $po->update(['status' => $allReceived ? 'received' : 'partially_received']);

            return $receipt->load('items');
        });
    }
}
