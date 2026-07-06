<?php

namespace App\Services\Ecommerce;

use App\Models\Sales\SalesOrder;
use App\Models\User;
use App\Services\CRM\LeadCaptureService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ShopOrderNotificationService
{
    public function notifyOrderPlaced(SalesOrder $order): void
    {
        $order->loadMissing('shipment');
        $email = $order->metadata['customer_email'] ?? null;
        $name = $order->metadata['customer_name'] ?? 'Customer';

        if ($email) {
            try {
                Mail::raw(
                    "Hi {$name},\n\nThank you for your order {$order->order_number}.\n".
                    "Total: K ".number_format((float) $order->total, 2)."\n\n".
                    "Track your shipment at: ".route('shop.tracking.show', $order->shipment?->tracking_number ?? '')."\n",
                    fn ($message) => $message->to($email)->subject("Order confirmation — {$order->order_number}")
                );
            } catch (\Throwable $e) {
                Log::warning('Shop order email failed: '.$e->getMessage());
            }
        }

        try {
            $users = User::role(['admin', 'super_user', 'manager', 'staff'])
                ->when($order->organization_id, function ($query) use ($order) {
                    $query->where(function ($inner) use ($order) {
                        $inner->whereHas(
                            'organizations',
                            fn ($org) => $org->where('organizations.id', $order->organization_id)
                        )->orWhereHas('roles', fn ($role) => $role->where('name', 'super_user'));
                    });
                })
                ->get();
            NotificationService::notifyUsers(
                $users,
                'shop_order',
                "New shop order {$order->order_number} — K ".number_format((float) $order->total, 2),
                route('ecommerce.orders.show', $order->id),
                $order
            );
        } catch (\Throwable $e) {
            Log::warning('Shop order notification failed: '.$e->getMessage());
        }
    }

    public function captureLead(SalesOrder $order): void
    {
        try {
            app(LeadCaptureService::class)->fromShopOrder($order);
        } catch (\Throwable $e) {
            Log::warning('Shop lead capture failed: '.$e->getMessage());
        }
    }

    public function notifyShipmentCheckpoint(\App\Models\Ecommerce\ShopShipment $shipment, \App\Models\Ecommerce\ShopShipmentEvent $event): void
    {
        $shipment->loadMissing('salesOrder');
        $order = $shipment->salesOrder;

        if (! $order) {
            return;
        }

        $email = $order->metadata['customer_email'] ?? null;
        $name = $order->metadata['customer_name'] ?? 'Customer';

        if (! $email) {
            return;
        }

        $statusLabel = config("shop.shipment_statuses.{$event->status}", ucfirst(str_replace('_', ' ', $event->status)));
        $trackingUrl = route('shop.tracking.show', $shipment->tracking_number);
        $locationLine = $event->location ? "\nLocation: {$event->location}" : '';

        try {
            Mail::raw(
                "Hi {$name},\n\n".
                "Update on your order {$order->order_number}:\n".
                "{$statusLabel}\n".
                ($event->description ? "{$event->description}\n" : '').
                $locationLine."\n\n".
                "Track your shipment: {$trackingUrl}\n",
                fn ($message) => $message->to($email)->subject("Shipment update — {$order->order_number}")
            );
        } catch (\Throwable $e) {
            Log::warning('Shop shipment checkpoint email failed: '.$e->getMessage());
        }

        try {
            $customer = $order->user_id ? \App\Models\User::find($order->user_id) : null;
            if ($customer) {
                NotificationService::create(
                    $customer,
                    'shop_shipment',
                    "{$statusLabel} — order {$order->order_number}",
                    $trackingUrl,
                    $order
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Shop shipment in-app notification failed: '.$e->getMessage());
        }
    }

    public function notifyPaymentReceived(SalesOrder $order): void
    {
        $email = $order->metadata['customer_email'] ?? null;
        $name = $order->metadata['customer_name'] ?? 'Customer';

        if ($email) {
            try {
                Mail::raw(
                    "Hi {$name},\n\n".
                    "Payment received for order {$order->order_number}.\n".
                    'Total: K '.number_format((float) $order->total, 2)."\n\n".
                    'Thank you for your purchase!',
                    fn ($message) => $message->to($email)->subject("Payment confirmed — {$order->order_number}")
                );
            } catch (\Throwable $e) {
                Log::warning('Shop payment email failed: '.$e->getMessage());
            }
        }
    }

    public function notifyOrderCancelled(SalesOrder $order, bool $refunded = false): void
    {
        $email = $order->metadata['customer_email'] ?? null;
        $name = $order->metadata['customer_name'] ?? 'Customer';

        if (! $email) {
            return;
        }

        $refundLine = $refunded
            ? "\nA refund has been initiated for your mobile money payment.\n"
            : '';

        try {
            Mail::raw(
                "Hi {$name},\n\n".
                "Your order {$order->order_number} has been cancelled.\n".
                ($order->metadata['cancellation_reason'] ?? '').
                $refundLine,
                fn ($message) => $message->to($email)->subject("Order cancelled — {$order->order_number}")
            );
        } catch (\Throwable $e) {
            Log::warning('Shop cancellation email failed: '.$e->getMessage());
        }

        if ($order->user_id) {
            try {
                $user = User::find($order->user_id);
                if ($user) {
                    NotificationService::create(
                        $user,
                        'shop_order',
                        "Order {$order->order_number} was cancelled",
                        route('shop.orders.show', $order->id),
                        $order
                    );
                }
            } catch (\Throwable $e) {
                Log::warning('Shop cancellation notification failed: '.$e->getMessage());
            }
        }
    }
}
