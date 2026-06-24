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
            $users = User::role(['admin', 'super_user', 'manager', 'staff'])->get();
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
}
