<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ModuleController extends Controller
{
    /**
     * Display a listing of the modules.
     */
    public function index(Request $request)
    {
        // Example: Fetch modules from config or database
        $modules = [
            ['name' => 'CRM', 'description' => 'Customer Relationship Management'],
            ['name' => 'Finance', 'description' => 'Finance and Accounting'],
            ['name' => 'HR', 'description' => 'Human Resources'],
            ['name' => 'CMS', 'description' => 'Content Management System'],
            ['name' => 'Support', 'description' => 'Support and Ticketing'],
            ['name' => 'AI', 'description' => 'AI and Automation'],
        ];
        // For real app, replace above with DB or config fetch
        return inertia('Admin/Modules/Index', [
            'modules' => $modules,
        ]);
    }
}
