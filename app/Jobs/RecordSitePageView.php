<?php

namespace App\Jobs;

use App\Services\Analytics\VisitorTrackingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecordSitePageView implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(public array $context) {}

    public function handle(VisitorTrackingService $tracking): void
    {
        $tracking->trackFromContext($this->context);
    }
}
