<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\ShopSavedAddress;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopAddressController extends Controller
{
    public function index()
    {
        $addresses = ShopSavedAddress::query()
            ->where('user_id', auth()->id())
            ->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->get();

        return Inertia::render('Customer/Profile/Addresses', [
            'addresses' => $addresses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'address_line' => 'required|string|max:500',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default')) {
            ShopSavedAddress::where('user_id', auth()->id())->update(['is_default' => false]);
        }

        ShopSavedAddress::create([
            'user_id' => auth()->id(),
            ...$data,
            'is_default' => $request->boolean('is_default') || ShopSavedAddress::where('user_id', auth()->id())->count() === 0,
        ]);

        return back()->with('success', 'Address saved.');
    }

    public function update(Request $request, ShopSavedAddress $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);

        $data = $request->validate([
            'label' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'address_line' => 'required|string|max:500',
            'is_default' => 'boolean',
        ]);

        if ($request->boolean('is_default')) {
            ShopSavedAddress::where('user_id', auth()->id())->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update([
            ...$data,
            'is_default' => $request->boolean('is_default') || $address->is_default,
        ]);

        return back()->with('success', 'Address updated.');
    }

    public function destroy(ShopSavedAddress $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault) {
            ShopSavedAddress::where('user_id', auth()->id())
                ->latest('updated_at')
                ->first()
                ?->update(['is_default' => true]);
        }

        return back()->with('success', 'Address removed.');
    }

    public function setDefault(ShopSavedAddress $address)
    {
        abort_unless($address->user_id === auth()->id(), 403);

        ShopSavedAddress::where('user_id', auth()->id())->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return back()->with('success', 'Default address updated.');
    }
}
