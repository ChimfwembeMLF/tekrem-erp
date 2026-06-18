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
        abort_unless(in_array($order->source, ['ecommerce', 'pos'], true), 404);

        if ($order->source === 'ecommerce') {
            return Inertia::render('Commerce/Receipt/Print', [
                'receipt' => $this->receiptService->fromSalesOrder($order),
                'backUrl' => route('shop.order.confirmation', $order),
                'backLabel' => 'Back to Order',
            ]);
        }

        abort(404);
    }
}
