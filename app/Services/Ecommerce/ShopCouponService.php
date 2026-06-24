<?php

namespace App\Services\Ecommerce;

use App\Models\Ecommerce\ShopCoupon;
use Illuminate\Validation\ValidationException;

class ShopCouponService
{
    public function validate(string $code, float $subtotal): ShopCoupon
    {
        $coupon = ShopCoupon::query()
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (!$coupon || !$coupon->is_active) {
            throw ValidationException::withMessages(['coupon_code' => 'Invalid coupon code.']);
        }

        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon is not active yet.']);
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon has expired.']);
        }

        if ($coupon->max_uses !== null && $coupon->used_count >= $coupon->max_uses) {
            throw ValidationException::withMessages(['coupon_code' => 'This coupon has reached its usage limit.']);
        }

        if ($coupon->min_order_amount !== null && $subtotal < (float) $coupon->min_order_amount) {
            throw ValidationException::withMessages([
                'coupon_code' => 'Minimum order amount of K '.number_format((float) $coupon->min_order_amount, 2).' required.',
            ]);
        }

        return $coupon;
    }

    public function discountAmount(ShopCoupon $coupon, float $subtotal): float
    {
        if ($coupon->type === 'fixed') {
            return min((float) $coupon->value, $subtotal);
        }

        return round($subtotal * ((float) $coupon->value / 100), 2);
    }

    public function incrementUsage(ShopCoupon $coupon): void
    {
        $coupon->increment('used_count');
    }
}
