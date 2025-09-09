<?php

use Illuminate\Foundation\Inspiring;
// use Illuminate\Support\Facades\Artisan;
// use App\Console\Commands\MomoReconcileCommand;
// use App\Console\Commands\MomoCheckStatusCommand;
// use App\Console\Commands\ZraCheckStatusCommand;
// use App\Console\Commands\ZraHealthCheckCommand;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Register MoMo commands
// Artisan::command('momo:reconcile', MomoReconcileCommand::class);
// Artisan::command('momo:check-status', MomoCheckStatusCommand::class);

// // Register ZRA commands
// Artisan::command('zra:check-status', ZraCheckStatusCommand::class);
// Artisan::command('zra:health-check', ZraHealthCheckCommand::class);
