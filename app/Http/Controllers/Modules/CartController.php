<?php

namespace App\Http\Controllers\Modules;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = session('module_cart', []);
        $moduleIds = collect($cart)->pluck('module_id')->all();
        $modules = Module::whereIn('id', $moduleIds)->with(['addons' => function($q) {
            $q->where('is_active', true);
        }])->get();
        // Attach selected add-ons to each module
        foreach ($modules as $module) {
            $cartItem = collect($cart)->firstWhere('module_id', $module->id);
            $module->selected_addons = $cartItem['addons'] ?? [];
        }
        return Inertia::render('Modules/Cart', [
            'modules' => $modules,
        ]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
            'addons' => 'array',
            'addons.*' => 'exists:addons,id',
        ]);
        $cart = session('module_cart', []);
        // Prevent duplicate modules
        $cart = array_filter($cart, function($item) use ($request) {
            return $item['module_id'] != $request->module_id;
        });
        $cart[] = [
            'module_id' => $request->module_id,
            'addons' => $request->addons ?? [],
        ];
        session(['module_cart' => $cart]);
        return redirect()->back()->with('success', 'Module added to cart.');
    }

    public function remove(Request $request)
    {
        $request->validate([
            'module_id' => 'required|exists:modules,id',
        ]);
        $cart = session('module_cart', []);
        $cart = array_filter($cart, function($item) use ($request) {
            return $item['module_id'] != $request->module_id;
        });
        session(['module_cart' => $cart]);
        return redirect()->back()->with('success', 'Module removed from cart.');
    }

    public function clear()
    {
        session()->forget('module_cart');
        return redirect()->back()->with('success', 'Cart cleared.');
    }
}
