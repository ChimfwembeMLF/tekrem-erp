<?php

namespace App\Services\Ecommerce;

use App\Models\Ecommerce\ShopWishlistItem;
use App\Models\Sales\SalesOrder;
use App\Models\User;

class ShopAccountMergeService
{
    public function mergeOnLogin(User $user): void
    {
        $this->linkGuestOrders($user);
    }

    public function mergeWishlist(User $user, array $productIds): int
    {
        $merged = 0;

        foreach (array_unique(array_filter($productIds)) as $productId) {
            $created = ShopWishlistItem::firstOrCreate([
                'user_id' => $user->id,
                'product_id' => (int) $productId,
            ]);

            if ($created->wasRecentlyCreated) {
                $merged++;
            }
        }

        return $merged;
    }

    private function linkGuestOrders(User $user): void
    {
        $clientId = $user->shopClientId();

        SalesOrder::query()
            ->where('source', 'ecommerce')
            ->whereNull('user_id')
            ->where('metadata->customer_email', $user->email)
            ->update(array_filter([
                'user_id' => $user->id,
                'client_id' => $clientId,
            ], fn ($value) => $value !== null));
    }
}
