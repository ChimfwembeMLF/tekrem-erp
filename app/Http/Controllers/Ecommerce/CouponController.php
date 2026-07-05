<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\ShopCoupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        return Inertia::render('Ecommerce/Admin/Coupons/Index', [
            'coupons' => ShopCoupon::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:shop_coupons,code',
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        ShopCoupon::create([
            ...$data,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return back()->with('success', 'Coupon created.');
    }

    public function update(Request $request, ShopCoupon $coupon)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:shop_coupons,code,'.$coupon->id,
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $coupon->update([
            ...$data,
            'is_active' => $data['is_active'] ?? $coupon->is_active,
        ]);

        return back()->with('success', 'Coupon updated.');
    }

    public function destroy(ShopCoupon $coupon)
    {
        $coupon->delete();

        return back()->with('success', 'Coupon deleted.');
    }
}
