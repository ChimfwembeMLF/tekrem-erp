<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use Carbon\Carbon;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'Expire or cancel subscriptions that have ended';

    public function handle()
    {
        $now = Carbon::now();
        $expired = Subscription::where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', $now)
            ->get();

        foreach ($expired as $subscription) {
            $subscription->status = 'expired';
            $subscription->save();
            $this->info("Subscription #{$subscription->id} expired.");
        }
    }
}
