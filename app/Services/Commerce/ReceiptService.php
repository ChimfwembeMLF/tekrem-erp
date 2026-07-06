<?php

namespace App\Services\Commerce;

use App\Models\POS\PosSale;
use App\Models\Sales\SalesOrder;

class ReceiptService
{
    public function company(): array
    {
        $logo = config('company.logo');
        if (!$logo || !is_string($logo)) {
            $logo = asset('logo-blue.png');
        }

        return [
            'name' => config('company.name', config('app.name')),
            'tagline' => config('company.tagline', 'INNOVATION CREATIVITY VALUE'),
            'address' => config('company.address', ''),
            'city' => config('company.city', ''),
            'country' => config('company.country', ''),
            'phone' => config('company.phone', ''),
            'phones' => array_values(array_filter(array_map('trim', explode('/', (string) config('company.phone', ''))))),
            'email' => config('company.email', ''),
            'website' => config('company.website', ''),
            'logoUrl' => $logo,
        ];
    }

    public function fromPosSale(PosSale $sale): array
    {
        $sale->loadMissing(['salesOrder.items', 'client', 'session.user', 'session.register']);

        $items = $sale->salesOrder?->items ?? collect();
        $paymentMethod = $sale->payment_method;
        $pgn = $sale->metadata['pawapay_payment_id']
            ?? $sale->metadata['momo_transaction_id']
            ?? $sale->sale_number;

        return [
            'type' => 'pos',
            'id' => $sale->id,
            'receiptNumber' => $sale->sale_number,
            'pgn' => (string) $pgn,
            'date' => $sale->created_at?->format('d/m/Y') ?? now()->format('d/m/Y'),
            'currency' => 'ZMW',
            'receivedFrom' => $sale->client?->name ?? 'Walk-in Customer',
            'amount' => (float) $sale->total,
            'amountInWords' => $this->amountInWords((float) $sale->total),
            'inRespectOf' => $this->summarizeItems($items, "POS sale {$sale->sale_number}"),
            'payment' => $this->paymentFlags($paymentMethod),
            'paymentMethodLabel' => $this->paymentLabel($paymentMethod),
            'cashier' => $sale->session?->user?->name,
            'register' => $sale->session?->register?->name,
            'items' => $items->map(fn ($item) => [
                'description' => $item->description,
                'quantity' => (float) $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])->values()->all(),
            'totals' => [
                'subtotal' => (float) $sale->subtotal,
                'tax' => (float) $sale->tax_amount,
                'discount' => (float) $sale->discount_amount,
                'total' => (float) $sale->total,
            ],
            'company' => $this->company(),
            'verifyUrl' => route('pos.sales.receipt', $sale),
        ];
    }

    public function fromSalesOrder(SalesOrder $order): array
    {
        $order->loadMissing('items.product');

        $metadata = $order->metadata ?? [];

        return [
            'type' => 'ecommerce',
            'id' => $order->id,
            'receiptNumber' => $order->order_number,
            'pgn' => $order->order_number,
            'date' => optional($order->order_date)->format('d/m/Y') ?? $order->created_at?->format('d/m/Y'),
            'currency' => 'ZMW',
            'receivedFrom' => $metadata['customer_name'] ?? 'Online Customer',
            'amount' => (float) $order->total,
            'amountInWords' => $this->amountInWords((float) $order->total),
            'inRespectOf' => $this->summarizeItems($order->items, "Online order {$order->order_number}"),
            'payment' => $this->paymentFlags($metadata['payment_method'] ?? 'online'),
            'paymentMethodLabel' => $this->paymentLabel($metadata['payment_method'] ?? 'online'),
            'cashier' => null,
            'register' => null,
            'items' => $order->items->map(fn ($item) => [
                'description' => $item->description,
                'quantity' => (float) $item->quantity,
                'unitPrice' => (float) $item->unit_price,
                'total' => (float) $item->total,
            ])->values()->all(),
            'totals' => [
                'subtotal' => (float) $order->subtotal,
                'tax' => (float) $order->tax_amount,
                'discount' => (float) $order->discount_amount,
                'total' => (float) $order->total,
            ],
            'company' => $this->company(),
            'verifyUrl' => route('shop.order.receipt', [
                'order' => $order->id,
                'token' => $order->access_token,
            ]),
        ];
    {
        $whole = (int) floor($amount);
        $ngwee = (int) round(($amount - $whole) * 100);

        if ($ngwee === 100) {
            $whole += 1;
            $ngwee = 0;
        }

        $words = $this->numberToWords($whole) . ' Kwacha';

        if ($ngwee > 0) {
            $words .= ' and ' . $this->numberToWords($ngwee) . ' Ngwee';
        }

        return $words . ' only';
    }

    protected function paymentFlags(?string $method): array
    {
        $method = strtolower((string) $method);

        return [
            'cash' => in_array($method, ['cash'], true),
            'mobile_money' => in_array($method, ['momo', 'mobile_money', 'mobile money'], true),
            'card' => in_array($method, ['card'], true),
            'cheque' => in_array($method, ['cheque', 'check'], true),
            'online' => in_array($method, ['online', 'ecommerce', ''], true),
        ];
    }

    protected function paymentLabel(?string $method): string
    {
        return match (strtolower((string) $method)) {
            'cash' => 'Cash',
            'momo', 'mobile_money', 'mobile money' => 'Mobile Money',
            'card' => 'Card',
            'cheque', 'check' => 'Cheque',
            default => 'Online Order',
        };
    }

    protected function summarizeItems($items, string $fallback): string
    {
        if ($items->isEmpty()) {
            return $fallback;
        }

        $names = $items->take(3)->pluck('description')->filter()->implode(', ');

        if ($items->count() > 3) {
            $names .= ' and ' . ($items->count() - 3) . ' more item(s)';
        }

        return $names ?: $fallback;
    }

    protected function numberToWords(int $number): string
    {
        if ($number === 0) {
            return 'Zero';
        }

        $ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen',
        ];
        $tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        $scales = ['', 'Thousand', 'Million', 'Billion'];

        $words = [];
        $scaleIndex = 0;

        while ($number > 0) {
            $chunk = $number % 1000;

            if ($chunk > 0) {
                $chunkWords = [];

                $hundreds = intdiv($chunk, 100);
                $remainder = $chunk % 100;

                if ($hundreds > 0) {
                    $chunkWords[] = $ones[$hundreds] . ' Hundred';
                }

                if ($remainder > 0) {
                    if ($remainder < 20) {
                        $chunkWords[] = $ones[$remainder];
                    } else {
                        $chunkWords[] = trim($tens[intdiv($remainder, 10)] . ' ' . $ones[$remainder % 10]);
                    }
                }

                $segment = implode(' ', array_filter($chunkWords));

                if ($scales[$scaleIndex] !== '') {
                    $segment .= ' ' . $scales[$scaleIndex];
                }

                array_unshift($words, trim($segment));
            }

            $number = intdiv($number, 1000);
            $scaleIndex++;
        }

        return implode(' ', $words);
    }
}
