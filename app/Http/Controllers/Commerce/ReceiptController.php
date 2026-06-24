<?php

namespace App\Http\Controllers\Commerce;

use App\Http\Controllers\Controller;
use App\Models\POS\PosSale;
use App\Models\Sales\SalesOrder;
use App\Services\Commerce\ReceiptService;
use Inertia\Inertia;

class ReceiptController extends Controller
{
    public function __construct(private ReceiptService $receiptService)
    {
    }

    public function posSale(PosSale $sale)
    {
        $sale->load('session');

        abort_unless(
            auth()->check()
            && (
                auth()->user()->can('access pos')
                || $sale->session?->user_id === auth()->id()
            ),
            403
        );

        return Inertia::render('Commerce/Receipt/Print', [
            'receipt' => $this->receiptService->fromPosSale($sale),
            'backUrl' => $sale->session?->register_id
                ? route('pos.terminal', $sale->session->register_id)
                : route('pos.index'),
            'backLabel' => 'Back to Terminal',
        ]);
    }

    public function shopOrder(SalesOrder $order)
    {
        abort_unless($order->source === 'ecommerce', 404);

        $token = request()->query('token');
        $authorized = $token && hash_equals((string) $order->access_token, (string) $token);
        if (!$authorized && auth()->check()) {
            $user = auth()->user();
            $authorized = $order->user_id === $user->id
                || ($user->client_id && $order->client_id === $user->client_id)
                || (($order->metadata['customer_email'] ?? null) === $user->email);
        }
        abort_unless($authorized, 403);

        return Inertia::render('Commerce/Receipt/Print', [
            'receipt' => $this->receiptService->fromSalesOrder($order),
            'backUrl' => route('shop.order.confirmation', ['order' => $order->id, 'token' => $order->access_token]),
            'backLabel' => 'Back to Order',
        ]);
    }
}
