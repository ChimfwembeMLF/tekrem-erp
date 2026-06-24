<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\ShopCoupon;
use App\Models\Ecommerce\ShopShippingMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingController extends Controller
{
    public function index()
    {
        return Inertia::render('Ecommerce/Admin/Shipping/Index', [
            'methods' => ShopShippingMethod::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shop_shipping_methods,code',
            'description' => 'nullable|string|max:500',
            'base_cost' => 'required|numeric|min:0',
            'estimated_days_min' => 'required|integer|min:0',
            'estimated_days_max' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        ShopShippingMethod::create($data);

        return back()->with('success', 'Shipping method created.');
    }

    public function update(Request $request, ShopShippingMethod $method)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shop_shipping_methods,code,'.$method->id,
            'description' => 'nullable|string|max:500',
            'base_cost' => 'required|numeric|min:0',
            'estimated_days_min' => 'required|integer|min:0',
            'estimated_days_max' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $method->update($data);

        return back()->with('success', 'Shipping method updated.');
    }
}
