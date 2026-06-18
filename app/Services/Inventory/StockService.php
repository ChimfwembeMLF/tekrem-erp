<?php

namespace App\Services\Inventory;

use App\Exceptions\InsufficientStockException;
use App\Models\Inventory\Product;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\StockMovement;
use App\Models\Inventory\Warehouse;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function adjust(
        Product $product,
        Warehouse $warehouse,
        float $quantity,
        string $type,
        ?string $notes = null,
        $reference = null,
        ?int $userId = null,
    ): StockMovement {
        return $this->transaction(function () use ($product, $warehouse, $quantity, $type, $notes, $reference, $userId) {
            $level = StockLevel::query()
                ->where('product_id', $product->id)
                ->where('warehouse_id', $warehouse->id)
                ->lockForUpdate()
                ->first();

            if (!$level) {
                $level = StockLevel::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'quantity' => 0,
                    'reserved_quantity' => 0,
                    'reorder_level' => 0,
                ]);

                $level = StockLevel::query()
                    ->whereKey($level->id)
                    ->lockForUpdate()
                    ->firstOrFail();
            }

            $before = (float) $level->quantity;
            $after = $before + $quantity;

            if ($after < 0) {
                throw InsufficientStockException::forProduct($product->name, $before, abs($quantity));
            }

            $level->update(['quantity' => $after]);

            return StockMovement::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'type' => $type,
                'quantity' => $quantity,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference?->id,
                'notes' => $notes,
                'user_id' => $userId ?? auth()->id(),
            ]);
        });
    }

    public function receive(Product $product, Warehouse $warehouse, float $quantity, $reference = null, ?string $notes = null): StockMovement
    {
        return $this->adjust($product, $warehouse, $quantity, 'purchase_receipt', $notes, $reference);
    }

    public function issue(Product $product, Warehouse $warehouse, float $quantity, $reference = null, ?string $notes = null): StockMovement
    {
        return $this->adjust($product, $warehouse, -abs($quantity), 'sale', $notes, $reference);
    }

    public function onHandQuantity(Product $product, Warehouse $warehouse): float
    {
        $level = StockLevel::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        return $level ? (float) $level->quantity : 0.0;
    }

    public function availableQuantity(Product $product, Warehouse $warehouse): float
    {
        $level = StockLevel::query()
            ->where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        return $level ? (float) $level->available_quantity : 0.0;
    }

    public function reserve(Product $product, Warehouse $warehouse, float $quantity): void
    {
        $level = StockLevel::firstOrCreate(
            ['product_id' => $product->id, 'warehouse_id' => $warehouse->id],
            ['quantity' => 0, 'reserved_quantity' => 0, 'reorder_level' => 0]
        );

        if ($level->available_quantity < $quantity) {
            throw InsufficientStockException::forProduct(
                $product->name,
                (float) $level->available_quantity,
                $quantity,
            );
        }

        $level->increment('reserved_quantity', $quantity);
    }

    public function release(Product $product, Warehouse $warehouse, float $quantity): void
    {
        $level = StockLevel::where('product_id', $product->id)
            ->where('warehouse_id', $warehouse->id)
            ->first();

        if ($level) {
            $level->decrement('reserved_quantity', min($quantity, (float) $level->reserved_quantity));
        }
    }

    private function transaction(callable $callback): mixed
    {
        return DB::transactionLevel() > 0
            ? $callback()
            : DB::transaction($callback);
    }
}
