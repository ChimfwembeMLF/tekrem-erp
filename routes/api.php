<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MomoWebhookController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\UserStoryController;
use App\Http\Controllers\EpicController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// MoMo Webhook Routes (No authentication required for provider callbacks)
Route::prefix('momo')->name('api.momo.')->group(function () {
    Route::post('webhook/{provider}', [MomoWebhookController::class, 'handle'])->name('webhook');

    // Authenticated webhook management routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('webhook/{webhook}/retry', [MomoWebhookController::class, 'retry'])->name('webhook.retry');
        Route::get('webhook/{webhook}/status', [MomoWebhookController::class, 'status'])->name('webhook.status');
    });
});
Route::apiResource('sprints', SprintController::class);
Route::apiResource('user-stories', UserStoryController::class);
Route::apiResource('epics', EpicController::class);
