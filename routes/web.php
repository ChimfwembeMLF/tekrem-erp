<?php

use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WebsiteController;
use Illuminate\Support\Facades\Route;


// Public Website Routes
Route::get('/', [WebsiteController::class, 'index'])->name('home');

Route::get('/about', [WebsiteController::class, 'about'])->name('about');

Route::get('/services', [WebsiteController::class, 'services'])->name('services');

// Individual Service Detail Pages
Route::get('/services/web-development', [WebsiteController::class, 'webDevelopment'])->name('services.web-development');
Route::get('/services/mobile-apps', [WebsiteController::class, 'mobileApps'])->name('services.mobile-apps');
Route::get('/services/ai-solutions', [WebsiteController::class, 'aiSolutions'])->name('services.ai-solutions');
Route::get('/services/cloud-services', [WebsiteController::class, 'cloudServices'])->name('services.cloud-services');

Route::get('/portfolio', [WebsiteController::class, 'portfolio'])->name('portfolio');

Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');

// Guest Help & FAQ Routes
Route::get('/help', [WebsiteController::class, 'help'])->name('help');
Route::get('/faq', [WebsiteController::class, 'faq'])->name('faq');

// Direct Quote Request Route (alias to guest.quote.create)
Route::get('/quote-request', function () {
    return redirect()->route('guest.quote.create');
})->name('quote-request');

// Guest Chat Routes (no authentication required)
Route::prefix('guest-chat')->name('guest-chat.')->group(function () {
    Route::post('/initialize', [App\Http\Controllers\GuestChatController::class, 'initializeSession'])->name('initialize');
    Route::post('/update-info', [App\Http\Controllers\GuestChatController::class, 'updateGuestInfo'])->name('update-info');
    Route::post('/send', [App\Http\Controllers\GuestChatController::class, 'sendMessage'])->name('send');
    Route::get('/messages', [App\Http\Controllers\GuestChatController::class, 'getMessages'])->name('messages');
    Route::post('/typing', [App\Http\Controllers\GuestChatController::class, 'typingEvent'])->name('typing');
    Route::post('/read', [App\Http\Controllers\GuestChatController::class, 'markMessagesRead'])->name('read');
    Route::post('/rate', [App\Http\Controllers\GuestChatController::class, 'rateConversation'])->name('rate');
    Route::post('/transcript', [App\Http\Controllers\GuestChatController::class, 'sendTranscript'])->name('transcript');
    Route::post('/push-token', [App\Http\Controllers\GuestChatController::class, 'registerPushToken'])->name('push-token');
});

// Guest Feature Routes (no authentication required)
Route::prefix('guest')->name('guest.')->group(function () {
    // General Inquiries
    Route::get('/inquiry', [\App\Http\Controllers\Guest\InquiryController::class, 'create'])->name('inquiry.create');
    Route::post('/inquiry', [\App\Http\Controllers\Guest\InquiryController::class, 'store'])->name('inquiry.store');
    Route::get('/inquiry/status', [\App\Http\Controllers\Guest\InquiryController::class, 'statusForm'])->name('inquiry.status-form');
    Route::post('/inquiry/status', [\App\Http\Controllers\Guest\InquiryController::class, 'status'])->name('inquiry.status');

    // Quote Requests
    Route::get('/quote', [\App\Http\Controllers\Guest\QuoteController::class, 'create'])->name('quote.create');
    Route::post('/quote', [\App\Http\Controllers\Guest\QuoteController::class, 'store'])->name('quote.store');
    Route::get('/quote/status', [\App\Http\Controllers\Guest\QuoteController::class, 'statusForm'])->name('quote.status-form');
    Route::post('/quote/status', [\App\Http\Controllers\Guest\QuoteController::class, 'status'])->name('quote.status');
    Route::post('/quote/accept', [\App\Http\Controllers\Guest\QuoteController::class, 'accept'])->name('quote.accept');

    // Project Inquiries
    Route::get('/project', [\App\Http\Controllers\Guest\ProjectController::class, 'create'])->name('project.create');
    Route::post('/project', [\App\Http\Controllers\Guest\ProjectController::class, 'store'])->name('project.store');
    Route::get('/project/status', [\App\Http\Controllers\Guest\ProjectController::class, 'statusForm'])->name('project.status-form');
    Route::post('/project/status', [\App\Http\Controllers\Guest\ProjectController::class, 'status'])->name('project.status');

    // Support
    Route::get('/support', [\App\Http\Controllers\Guest\SupportController::class, 'index'])->name('support.index');
    Route::get('/support/knowledge-base', [\App\Http\Controllers\Guest\SupportController::class, 'knowledgeBase'])->name('support.knowledge-base');
    Route::get('/support/article/{slug}', [\App\Http\Controllers\Guest\SupportController::class, 'article'])->name('support.article');
    Route::post('/support/article/{slug}/rate', [\App\Http\Controllers\Guest\SupportController::class, 'rateArticle'])->name('support.article.rate');
    Route::get('/support/ticket', [\App\Http\Controllers\Guest\SupportController::class, 'createTicket'])->name('support.ticket.create');
    Route::post('/support/ticket', [\App\Http\Controllers\Guest\SupportController::class, 'storeTicket'])->name('support.ticket.store');
    Route::get('/support/ticket/status', [\App\Http\Controllers\Guest\SupportController::class, 'ticketStatusForm'])->name('support.ticket.status-form');
    Route::post('/support/ticket/status', [\App\Http\Controllers\Guest\SupportController::class, 'ticketStatus'])->name('support.ticket.status');

    // Portfolio (Placeholder)
});

// Embeddable Ticket Form
Route::get('/support/embed/ticket', function (\Illuminate\Http\Request $request) {
    return \Inertia\Inertia::render('Support/Embed/TicketForm', [
        'source' => $request->query('source', 'External System'),
        'token' => $request->query('token', ''),
        'theme' => $request->query('theme', 'light'),
        'primary_color' => $request->query('primary_color', ''),
        'categories' => \App\Models\Support\TicketCategory::all(['id', 'name']),
    ]);
})->name('support.embed.ticket')->middleware(\App\Http\Middleware\AllowIframe::class);

// AI Service Test Route (for development/testing)
Route::post('/test-ai-service', function (\Illuminate\Http\Request $request) {
    $aiService = new \App\Services\AIService;
    $response = $aiService->generateGuestChatResponse(
        $request->input('message', 'Hello, I need help with web development services.'),
        []
    );

    return response()->json(['response' => $response]);
})->name('test-ai-service');

/*
|--------------------------------------------------------------------------
| Central Admin Routes
|--------------------------------------------------------------------------
|
| These routes are for the platform super admin, accessible only on the
| central domain. They allow managing all tenants, billing, and plans.
|
*/

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->prefix('central-admin')->name('central-admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Central\AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/tenants', [\App\Http\Controllers\Central\TenantController::class, 'index'])->name('tenants.index');
    Route::get('/tenants/create', [\App\Http\Controllers\Central\TenantController::class, 'create'])->name('tenants.create');
    Route::post('/tenants', [\App\Http\Controllers\Central\TenantController::class, 'store'])->name('tenants.store');
    Route::get('/tenants/{tenant}', [\App\Http\Controllers\Central\TenantController::class, 'show'])->name('tenants.show');
    Route::patch('/tenants/{tenant}/suspend', [\App\Http\Controllers\Central\TenantController::class, 'suspend'])->name('tenants.suspend');
    Route::patch('/tenants/{tenant}/activate', [\App\Http\Controllers\Central\TenantController::class, 'activate'])->name('tenants.activate');
    Route::delete('/tenants/{tenant}', [\App\Http\Controllers\Central\TenantController::class, 'destroy'])->name('tenants.destroy');
    Route::get('/plans', [\App\Http\Controllers\Central\SubscriptionPlanController::class, 'index'])->name('plans.index');
    Route::post('/plans', [\App\Http\Controllers\Central\SubscriptionPlanController::class, 'store'])->name('plans.store');
    Route::put('/plans/{plan}', [\App\Http\Controllers\Central\SubscriptionPlanController::class, 'update'])->name('plans.update');
    Route::get('/billing', [\App\Http\Controllers\Central\BillingController::class, 'index'])->name('billing.index');
    Route::get('/billing/transactions', [\App\Http\Controllers\Central\BillingController::class, 'transactions'])->name('billing.transactions');
});

/*
|--------------------------------------------------------------------------
| Tenant Registration / Onboarding (Central Domain)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/register-company', [\App\Http\Controllers\Central\OnboardingController::class, 'showRegistration'])->name('register-company');
    Route::post('/register-company', [\App\Http\Controllers\Central\OnboardingController::class, 'register'])->name('register-company.store');
});

// PawaPay Billing Webhook (Central — no auth required)
Route::post('/billing/pawapay/webhook', [\App\Http\Controllers\Central\BillingController::class, 'pawapayWebhook'])->name('billing.pawapay.webhook');

/*
 * Note: All ERP application routes (dashboard, CRM, HR, Finance, Projects,
 * Support, AI, CMS, Social Media, etc.) are served in tenant context via
 * routes/web_erp.php, which is included by routes/tenant.php.
 *
 * Central domain (this file) only serves:
 *  - Public marketing website
 *  - Tenant registration / company onboarding
 *  - Central admin panel (/central-admin/*)
 *  - PawaPay billing webhook
 */
