<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\TicketSource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class TicketSourceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sources = TicketSource::latest()->get();

        return Inertia::render('Support/Sources/Index', [
            'sources' => $sources
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ticket_sources',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        TicketSource::create($validated);

        return back()->with('success', 'Ticket Source created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TicketSource $source)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ticket_sources,name,' . $source->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $source->update($validated);

        return back()->with('success', 'Ticket Source updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TicketSource $source)
    {
        $source->delete();

        return back()->with('success', 'Ticket Source deleted successfully.');
    }

    /**
     * Generate a new API token for this source.
     */
    public function generateToken(TicketSource $source)
    {
        // Delete any existing tokens for this source
        $source->tokens()->delete();
        
        $token = $source->createToken('embed-token')->plainTextToken;
        
        return response()->json([
            'token' => $token
        ]);
    }
}
