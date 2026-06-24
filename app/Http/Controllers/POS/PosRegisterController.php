<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Warehouse;
use App\Models\POS\PosRegister;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PosRegisterController extends Controller
{
    public function index()
    {
        return Inertia::render('POS/Registers', [
            'registers' => PosRegister::with('warehouse')->orderBy('name')->get(),
            'warehouses' => Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'selectedWarehouseId' => session('new_warehouse_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'warehouse_id' => 'required|exists:warehouses,id',
            'is_active' => 'boolean',
            'pin' => 'nullable|string|min:4|max:20',
        ]);

        PosRegister::create([
            'name' => $data['name'],
            'warehouse_id' => $data['warehouse_id'],
            'is_active' => $data['is_active'] ?? true,
            'access_pin' => !empty($data['pin']) ? Hash::make($data['pin']) : null,
        ]);

        return back()->with('success', 'Terminal created.');
    }

    public function update(Request $request, PosRegister $register)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'warehouse_id' => 'required|exists:warehouses,id',
            'is_active' => 'boolean',
            'pin' => 'nullable|string|min:4|max:20',
            'clear_pin' => 'boolean',
        ]);

        $payload = [
            'name' => $data['name'],
            'warehouse_id' => $data['warehouse_id'],
            'is_active' => $data['is_active'] ?? $register->is_active,
        ];

        if ($data['clear_pin'] ?? false) {
            $payload['access_pin'] = null;
        } elseif (!empty($data['pin'])) {
            $payload['access_pin'] = Hash::make($data['pin']);
        }

        $register->update($payload);

        return back()->with('success', 'Terminal updated.');
    }

    public function destroy(PosRegister $register)
    {
        if ($register->sessions()->where('status', 'open')->exists()) {
            throw ValidationException::withMessages([
                'register' => 'Close all open sessions on this terminal before deactivating it.',
            ]);
        }

        $register->update(['is_active' => false]);

        return back()->with('success', 'Terminal deactivated.');
    }
}
