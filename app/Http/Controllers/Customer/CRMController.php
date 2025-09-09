<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CRMController extends Controller
{
    /**
     * Display customer CRM dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Check if user is a client
        $client = Client::where('email', $user->email)->first();
        
        // Get recent communications
        $recentCommunications = Communication::where(function ($query) use ($user, $client) {
                // Communications where user is the communicable
                $query->where('communicable_type', User::class)
                      ->where('communicable_id', $user->id);
                
                // If user is also a client, include client communications
                if ($client) {
                    $query->orWhere(function ($subQuery) use ($client) {
                        $subQuery->where('communicable_type', Client::class)
                                 ->where('communicable_id', $client->id);
                    });
                }
            })
            ->with(['user', 'communicable'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get client profile if exists
        $clientProfile = $client ? $client->load(['communications', 'projects']) : null;

        // Get communication stats
        $stats = [
            'total_communications' => Communication::where(function ($query) use ($user, $client) {
                $query->where('communicable_type', User::class)
                      ->where('communicable_id', $user->id);
                if ($client) {
                    $query->orWhere(function ($subQuery) use ($client) {
                        $subQuery->where('communicable_type', Client::class)
                                 ->where('communicable_id', $client->id);
                    });
                }
            })->count(),
            'recent_communications' => $recentCommunications->count(),
            'client_status' => $client ? $client->status : 'not_registered',
        ];

        return Inertia::render('Customer/CRM/Index', [
            'client_profile' => $clientProfile,
            'recent_communications' => $recentCommunications,
            'stats' => $stats,
        ]);
    }

    /**
     * Display customer's client profile.
     */
    public function profile(): Response
    {
        $user = Auth::user();
        
        // Find client record by email
        $client = Client::where('email', $user->email)
            ->with(['communications', 'projects', 'invoices', 'quotations'])
            ->first();

        if (!$client) {
            // If no client record exists, show a message
            return Inertia::render('Customer/CRM/Profile', [
                'client' => null,
                'message' => 'No client profile found. Please contact support if you believe this is an error.',
            ]);
        }

        return Inertia::render('Customer/CRM/Profile', [
            'client' => $client,
        ]);
    }

    /**
     * Display customer's communication history.
     */
    public function communications(Request $request): Response
    {
        $user = Auth::user();
        $client = Client::where('email', $user->email)->first();
        
        $query = Communication::where(function ($q) use ($user, $client) {
            // Communications where user is the communicable
            $q->where('communicable_type', User::class)
              ->where('communicable_id', $user->id);
            
            // If user is also a client, include client communications
            if ($client) {
                $q->orWhere(function ($subQ) use ($client) {
                    $subQ->where('communicable_type', Client::class)
                         ->where('communicable_id', $client->id);
                });
            }
        })->with(['user', 'communicable', 'attachments']);

        // Apply filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('subject', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $communications = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Customer/CRM/Communications', [
            'communications' => $communications,
            'client' => $client,
            'filters' => $request->only(['type', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display a specific communication.
     */
    public function showCommunication(Communication $communication): Response
    {
        $user = Auth::user();
        $client = Client::where('email', $user->email)->first();
        
        // Ensure user can access this communication
        $canAccess = false;
        
        if ($communication->communicable_type === User::class && $communication->communicable_id === $user->id) {
            $canAccess = true;
        } elseif ($client && $communication->communicable_type === Client::class && $communication->communicable_id === $client->id) {
            $canAccess = true;
        }

        if (!$canAccess) {
            abort(403, 'Access denied.');
        }

        $communication->load(['user', 'communicable', 'attachments']);

        return Inertia::render('Customer/CRM/ShowCommunication', [
            'communication' => $communication,
            'client' => $client,
        ]);
    }

    /**
     * Update customer's client profile information.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $client = Client::where('email', $user->email)->first();

        if (!$client) {
            return redirect()->back()->withErrors(['error' => 'Client profile not found.']);
        }

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'company' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:255'],
            'industry' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $client->update($validated);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Profile updated successfully!'
        ]);

        return redirect()->route('customer.crm.profile');
    }
}
