<?php

namespace App\Http\Controllers\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Procurement\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('Procurement/Suppliers/Index', [
            'suppliers' => Supplier::latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:20|unique:suppliers,code',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'payment_terms' => 'nullable|string|max:100',
        ]);
        Supplier::create($data);
        return back()->with('success', 'Supplier created.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'code' => 'required|string|max:20|unique:suppliers,code,' . $supplier->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'payment_terms' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
        $supplier->update($data);
        return back()->with('success', 'Supplier updated.');
    }
}
