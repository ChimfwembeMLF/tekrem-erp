<?php

namespace App\Http\Controllers\Admin;


use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Module;

class ModuleController extends Controller
{
    /**
     * Display a listing of the modules.
     */
    public function index(Request $request)
    {
        $query = Module::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $modules = $query->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(function ($module) {
                return [
                    'id' => $module->id,
                    'name' => $module->name,
                    'description' => $module->description,
                    'created_at' => $module->created_at,
                    'updated_at' => $module->updated_at,
                ];
            });

        return inertia('Admin/Modules/Index', [
            'modules' => $modules,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new module.
     */
    public function create()
    {
        return inertia('Admin/Modules/Create');
    }

    /**
     * Store a newly created module in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name',
            'description' => 'nullable|string|max:255',
        ]);
        $module = Module::create($validated);
        return redirect()->route('admin.modules.index')->with('success', 'Module created successfully.');
    }

    /**
     * Show the form for editing the specified module.
     */
    public function edit(Module $module)
    {
        return inertia('Admin/Modules/Edit', [
            'module' => $module,
        ]);
    }

    /**
     * Update the specified module in storage.
     */
    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name,' . $module->id,
            'description' => 'nullable|string|max:255',
        ]);
        $module->update($validated);
        return redirect()->route('admin.modules.index')->with('success', 'Module updated successfully.');
    }

    /**
     * Remove the specified module from storage.
     */
    public function destroy(Module $module)
    {
        $module->delete();
        return redirect()->route('admin.modules.index')->with('success', 'Module deleted successfully.');
    }
}
