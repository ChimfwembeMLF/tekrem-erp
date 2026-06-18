<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockLevel;
use App\Models\Inventory\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Warehouses/Index', [
            'warehouses' => Warehouse::withCount('stockLevels')->latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:20|unique:warehouses,code',
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($data['is_default'] ?? false) {
            Warehouse::query()->update(['is_default' => false]);
        }

        Warehouse::create($data);
        return back()->with('success', 'Warehouse created.');
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'code' => 'required|string|max:20|unique:warehouses,code,' . $warehouse->id,
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($data['is_default'] ?? false) {
            Warehouse::where('id', '!=', $warehouse->id)->update(['is_default' => false]);
        }

        $warehouse->update($data);
        return back()->with('success', 'Warehouse updated.');
    }

    public function stock(Warehouse $warehouse)
    {
        return Inertia::render('Inventory/Warehouses/Stock', [
            'warehouse' => $warehouse,
            'stockLevels' => StockLevel::with('product')
                ->where('warehouse_id', $warehouse->id)
                ->paginate(20),
        ]);
    }
}
