<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Module;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        $packages = Package::with('modules')->get();
        return \Inertia\Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function create()
    {
        $modules = Module::all();
        return \Inertia\Inertia::render('Admin/Packages/Create', [
            'modules' => $modules,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:packages',
            'description' => 'nullable',
            'price' => 'nullable|numeric',
            'is_active' => 'boolean',
            'modules' => 'array',
        ]);
        $package = Package::create($data);
        $package->modules()->sync($request->modules);
        return redirect()->route('admin.packages.index');
    }

    public function edit(Package $package)
    {
        $modules = Module::all();
        $package->load('modules');
        return \Inertia\Inertia::render('Admin/Packages/Edit', [
            'package' => $package,
            'modules' => $modules,
        ]);
    }

    public function update(Request $request, Package $package)
    {
        $data = $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:packages,slug,' . $package->id,
            'description' => 'nullable',
            'price' => 'nullable|numeric',
            'is_active' => 'boolean',
            'modules' => 'array',
        ]);
        $package->update($data);
        $package->modules()->sync($request->modules);
        return redirect()->route('admin.packages.index');
    }

    public function destroy(Package $package)
    {
        $package->delete();
        return redirect()->route('admin.packages.index');
    }
}
