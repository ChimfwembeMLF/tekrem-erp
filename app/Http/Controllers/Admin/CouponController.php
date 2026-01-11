<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::latest()->paginate(20);
        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Coupons/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|unique:coupons',
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'max_uses' => 'nullable|integer',
            'active' => 'boolean',
        ]);
        Coupon::create($data);
        return redirect()->route('admin.coupons.index');
    }

    public function edit(Coupon $coupon)
    {
        return Inertia::render('Admin/Coupons/Edit', [
            'coupon' => $coupon,
        ]);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $request->validate([
            'code' => 'required|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:percent,fixed',
            'value' => 'required|numeric',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'max_uses' => 'nullable|integer',
            'active' => 'boolean',
        ]);
        $coupon->update($data);
        return redirect()->route('admin.coupons.index');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return redirect()->route('admin.coupons.index');
    }
}
