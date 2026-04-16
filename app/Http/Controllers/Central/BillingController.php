<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    public function index()
    {
        $stats = [
            'total_revenue' => BillingTransaction::where('status', 'completed')->sum('amount'),
            'this_month'    => BillingTransaction::where('status', 'completed')
                ->whereMonth('paid_at', now()->month)
                ->sum('amount'),
            'pending'       => BillingTransaction::where('status', 'pending')->count(),
        ];

        return inertia('Central/Billing/Index', compact('stats'));
    }

    public function transactions()
    {
        $transactions = BillingTransaction::with('tenant')
            ->latest()
            ->paginate(50);

        return inertia('Central/Billing/Transactions', compact('transactions'));
    }

    /**
     * Handle PawaPay payment callback webhook.
     * PawaPay sends a POST with JSON payload containing depositId, status, etc.
     */
    public function pawapayWebhook(Request $request)
    {
        $payload = $request->all();

        Log::info('PawaPay webhook received', ['payload' => $payload]);

        // PawaPay sends depositId in payload
        $depositId = $payload['depositId'] ?? null;

        if (! $depositId) {
            return response()->json(['error' => 'Missing depositId'], 422);
        }

        $transaction = BillingTransaction::where('pawapay_transaction_id', $depositId)->first();

        if (! $transaction) {
            Log::warning('PawaPay webhook: transaction not found', ['depositId' => $depositId]);
            // Return 200 to prevent PawaPay retrying for unknown transactions
            return response()->json(['status' => 'ok']);
        }

        $status = strtoupper($payload['status'] ?? '');

        if ($status === 'COMPLETED') {
            $transaction->markCompleted($payload);
        } elseif (in_array($status, ['FAILED', 'REJECTED', 'CANCELLED', 'TIMED_OUT', 'DUPLICATE_IGNORED'])) {
            $transaction->markFailed($payload['rejectionReason']['rejectionMessage'] ?? $status);
        }

        return response()->json(['status' => 'ok']);
    }
}
