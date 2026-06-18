<?php

use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\WebsiteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Legal pages
Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService', [
        'terms' => Str::markdown(
            file_get_contents(
                resource_path('markdown/terms.md')
            )
        ),
    ]);
})->name('terms.show');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy', [
        'policy' => Str::markdown(
            file_get_contents(
                resource_path('markdown/policy.md')
            )
        ),
    ]);
})->name('privacy-policy.show');

Route::get('/refund-policy', function () {
    return Inertia::render('RefundPolicy', [
        'refund' => Str::markdown(
            file_get_contents(
                resource_path('markdown/refund-policy.md')
            )
        ),
    ]);
})->name('refund-policy.show');

// Public Website Routes
Route::get('/', [WebsiteController::class, 'index'])->name('home');

Route::get('/about', [WebsiteController::class, 'about'])->name('about');

Route::get('/services', [WebsiteController::class, 'services'])->name('services');

// Individual Service Detail Pages
Route::get('/services/web-development', [WebsiteController::class, 'webDevelopment'])->name('services.web-development');
Route::get('/services/mobile-apps', [WebsiteController::class, 'mobileApps'])->name('services.mobile-apps');
Route::get('/services/ai-solutions', [WebsiteController::class, 'aiSolutions'])->name('services.ai-solutions');
Route::get('/services/cloud-services', [WebsiteController::class, 'cloudServices'])->name('services.cloud-services');

Route::get('/pricing', [WebsiteController::class, 'pricing'])->name('pricing');

Route::get('/contact', [WebsiteController::class, 'contact'])->name('contact');

Route::get('/careers', [\App\Http\Controllers\CareerController::class, 'index'])->name('careers.index');
Route::get('/careers/{slug}', [\App\Http\Controllers\CareerController::class, 'show'])->name('careers.show');
Route::post('/careers/{slug}/apply', [\App\Http\Controllers\CareerController::class, 'apply'])->name('careers.apply');

// FAQ (help content consolidated here)
Route::redirect('/help', '/faq');
Route::get('/faq', [WebsiteController::class, 'faq'])->name('faq');

// Public Ecommerce Shop
Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Ecommerce\ShopController::class, 'index'])->name('index');
    Route::get('/cart', [\App\Http\Controllers\Ecommerce\ShopController::class, 'cart'])->name('cart');
    Route::patch('/cart/items/{cartItem}', [\App\Http\Controllers\Ecommerce\ShopController::class, 'updateCartItem'])->name('cart.update');
    Route::delete('/cart/items/{cartItem}', [\App\Http\Controllers\Ecommerce\ShopController::class, 'removeCartItem'])->name('cart.remove');
    Route::get('/checkout', [\App\Http\Controllers\Ecommerce\ShopController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [\App\Http\Controllers\Ecommerce\ShopController::class, 'placeOrder'])->name('checkout.store');
    Route::get('/order/{order}/confirmation', [\App\Http\Controllers\Ecommerce\ShopController::class, 'confirmation'])->name('order.confirmation');
    Route::get('/order/{order}/receipt', [\App\Http\Controllers\Commerce\ReceiptController::class, 'shopOrder'])->name('order.receipt');
    Route::get('/{product}', [\App\Http\Controllers\Ecommerce\ShopController::class, 'show'])->name('show');
    Route::post('/{product}/cart', [\App\Http\Controllers\Ecommerce\ShopController::class, 'addToCart'])->name('cart.add');
});

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

// Authentication & Dashboard Routes
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/session/ping', fn () => response()->json(['ok' => true]))->name('session.ping');

    // Support chatbot API — any authenticated user (floating widget)
    Route::prefix('support/chatbot')->name('support.chatbot.')->group(function () {
        Route::post('chat', [\App\Http\Controllers\Support\ChatbotController::class, 'chat'])->name('chat');
        Route::get('conversation', [\App\Http\Controllers\Support\ChatbotController::class, 'getConversation'])->name('conversation');
        Route::get('suggest-ticket-title', [\App\Http\Controllers\Support\ChatbotController::class, 'suggestTicketTitle'])->name('suggest-ticket-title');
        Route::post('create-ticket', [\App\Http\Controllers\Support\ChatbotController::class, 'createTicketFromChat'])->name('create-ticket');
        Route::get('suggestions', [\App\Http\Controllers\Support\ChatbotController::class, 'getSuggestions'])->name('suggestions');
        Route::post('rate', [\App\Http\Controllers\Support\ChatbotController::class, 'rateResponse'])->name('rate');
        Route::post('escalate', [\App\Http\Controllers\Support\ChatbotController::class, 'escalateToHuman'])->name('escalate');
    });

    // Notification routes
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
        Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    // Profile Notification Preferences Routes
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/notifications', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'show'])->name('notifications.show');
        Route::put('/notifications', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'update'])->name('notifications.update');
        Route::put('/notifications/reset', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'reset'])->name('notifications.reset');
        Route::get('/notifications/api', [\App\Http\Controllers\Profile\NotificationPreferenceController::class, 'getPreferences'])->name('notifications.api');
    });

    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware('role:admin|super_user')->group(function () {
        // Modules Management
        Route::resource('modules', \App\Http\Controllers\Admin\ModuleController::class);
        // Settings routes
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');

        // User Management
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);

        // Role Management
        Route::resource('roles', \App\Http\Controllers\Admin\RoleController::class);
        Route::get('roles-matrix', [\App\Http\Controllers\Admin\RoleController::class, 'permissionMatrix'])->name('roles.matrix');
        Route::post('roles-matrix', [\App\Http\Controllers\Admin\RoleController::class, 'updatePermissionMatrix'])->name('roles.matrix.update');
        Route::get('user-assignment', [\App\Http\Controllers\Admin\RoleController::class, 'userAssignment'])->name('roles.user-assignment');
        Route::post('bulk-assign-users', [\App\Http\Controllers\Admin\RoleController::class, 'bulkAssignUsers'])->name('roles.bulk-assign-users');
        Route::get('user-role-history/{user}', [\App\Http\Controllers\Admin\RoleController::class, 'userRoleHistory'])->name('roles.user-history');

        // Permission Management
        Route::resource('permissions', \App\Http\Controllers\Admin\PermissionController::class);
        Route::post('permissions/bulk-assign-roles', [\App\Http\Controllers\Admin\PermissionController::class, 'bulkAssignRoles'])->name('permissions.bulk-assign-roles');
        Route::delete('permissions/bulk-delete', [\App\Http\Controllers\Admin\PermissionController::class, 'bulkDelete'])->name('permissions.bulk-delete');
        Route::post('permissions/generate-module', [\App\Http\Controllers\Admin\PermissionController::class, 'generateModulePermissions'])->name('permissions.generate-module');

        // Integration Verification
        Route::prefix('integration-verification')->name('integration-verification.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\IntegrationVerificationController::class, 'index'])->name('index');
            Route::post('/test-all', [\App\Http\Controllers\Admin\IntegrationVerificationController::class, 'testAllIntegrations'])->name('test-all');
            Route::post('/test-integration', [\App\Http\Controllers\Admin\IntegrationVerificationController::class, 'testIntegration'])->name('test-integration');
            Route::get('/configuration-status', [\App\Http\Controllers\Admin\IntegrationVerificationController::class, 'getConfigurationStatus'])->name('configuration-status');
        });

        // Guest Management
        Route::prefix('guest')->name('guest.')->group(function () {
            // Guest Inquiries
            Route::resource('inquiries', \App\Http\Controllers\Admin\GuestInquiryController::class, [
                'names' => [
                    'index' => 'guest-inquiries.index',
                    'show' => 'guest-inquiries.show',
                    'update' => 'guest-inquiries.update',
                    'destroy' => 'guest-inquiries.destroy',
                ],
            ])->except(['create', 'store', 'edit']);
            Route::post('inquiries/{guestInquiry}/assign', [\App\Http\Controllers\Admin\GuestInquiryController::class, 'assign'])->name('guest-inquiries.assign');
            Route::post('inquiries/{guestInquiry}/mark-responded', [\App\Http\Controllers\Admin\GuestInquiryController::class, 'markResponded'])->name('guest-inquiries.mark-responded');
            Route::post('inquiries/bulk-update', [\App\Http\Controllers\Admin\GuestInquiryController::class, 'bulkUpdate'])->name('guest-inquiries.bulk-update');
            Route::get('inquiries/export', [\App\Http\Controllers\Admin\GuestInquiryController::class, 'export'])->name('guest-inquiries.export');
        });
    });

    // CRM routes
    Route::prefix('crm')->name('crm.')->middleware('permission:view crm')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\CRM\DashboardController::class, 'index'])->name('dashboard');

        // Clients
        Route::resource('clients', \App\Http\Controllers\CRM\ClientController::class);
        Route::get('clients/{client}/health-analysis', [\App\Http\Controllers\CRM\ClientController::class, 'healthAnalysis'])->name('clients.health-analysis');

        // Leads
        Route::resource('leads', \App\Http\Controllers\CRM\LeadController::class);
        Route::post('leads/{lead}/convert', [\App\Http\Controllers\CRM\LeadController::class, 'convertToClient'])->name('leads.convert');
        Route::post('leads/ai-insights', [\App\Http\Controllers\CRM\LeadController::class, 'aiInsights'])->name('leads.ai-insights');
        Route::post('leads/generate-email', [\App\Http\Controllers\CRM\LeadController::class, 'generateEmail'])->name('leads.generate-email');
        Route::get('leads/{lead}/follow-up-recommendations', [\App\Http\Controllers\CRM\LeadController::class, 'followUpRecommendations'])->name('leads.follow-up-recommendations');
        Route::get('leads/{lead}/conversion-prediction', [\App\Http\Controllers\CRM\LeadController::class, 'conversionPrediction'])->name('leads.conversion-prediction');

        // Communications
        Route::resource('communications', \App\Http\Controllers\CRM\CommunicationController::class);
        Route::post('communications/analyze-sentiment', [\App\Http\Controllers\CRM\CommunicationController::class, 'analyzeSentiment'])->name('communications.analyze-sentiment');
        Route::post('communications/generate-email-template', [\App\Http\Controllers\CRM\CommunicationController::class, 'generateEmailTemplate'])->name('communications.generate-email-template');

        // TekRem LiveChat
        Route::prefix('livechat')->name('livechat.')->group(function () {
            Route::get('/', [\App\Http\Controllers\CRM\LiveChatController::class, 'index'])->name('index');
            Route::get('/conversations/{conversation}', [\App\Http\Controllers\CRM\LiveChatController::class, 'show'])->name('show');
            Route::post('/conversations', [\App\Http\Controllers\CRM\LiveChatController::class, 'store'])->name('store');
            Route::post('/find-or-create', [\App\Http\Controllers\CRM\LiveChatController::class, 'findOrCreateConversation'])->name('find-or-create');
            Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\CRM\LiveChatController::class, 'sendMessage'])->name('send-message');
            Route::post('/conversations/{conversation}/mark-as-read', [\App\Http\Controllers\CRM\LiveChatController::class, 'markAsRead'])->name('mark-as-read');
            Route::post('/conversations/{conversation}/typing', [\App\Http\Controllers\CRM\LiveChatController::class, 'typing'])->name('typing');
            Route::post('/conversations/{conversation}/archive', [\App\Http\Controllers\CRM\LiveChatController::class, 'archive'])->name('archive');
            Route::post('/conversations/{conversation}/restore', [\App\Http\Controllers\CRM\LiveChatController::class, 'restore'])->name('restore');

            // Message interactions
            Route::post('/messages/{message}/react', [\App\Http\Controllers\CRM\LiveChatController::class, 'addReaction'])->name('messages.react');
            Route::delete('/messages/{message}/react', [\App\Http\Controllers\CRM\LiveChatController::class, 'removeReaction'])->name('messages.unreact');
            Route::post('/messages/{message}/pin', [\App\Http\Controllers\CRM\LiveChatController::class, 'pinMessage'])->name('messages.pin');
            Route::delete('/messages/{message}/pin', [\App\Http\Controllers\CRM\LiveChatController::class, 'unpinMessage'])->name('messages.unpin');
            Route::post('/messages/reorder-pins', [\App\Http\Controllers\CRM\LiveChatController::class, 'reorderPinnedMessages'])->name('messages.reorder-pins');
            Route::put('/messages/{message}/edit', [\App\Http\Controllers\CRM\LiveChatController::class, 'editMessage'])->name('messages.edit');
            Route::get('/messages/{message}/edit-history', [\App\Http\Controllers\CRM\LiveChatController::class, 'getEditHistory'])->name('messages.edit-history');
            Route::post('/messages/{message}/comments', [\App\Http\Controllers\CRM\LiveChatController::class, 'addComment'])->name('messages.comments.store');
            Route::delete('/comments/{comment}', [\App\Http\Controllers\CRM\LiveChatController::class, 'deleteComment'])->name('comments.destroy');
        });

        // Analytics routes
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [\App\Http\Controllers\CRM\AnalyticsController::class, 'index'])->name('dashboard');
            Route::get('/reports', [\App\Http\Controllers\CRM\AnalyticsController::class, 'reports'])->name('reports');
            Route::post('/export', [\App\Http\Controllers\CRM\AnalyticsController::class, 'export'])->name('export');
            Route::post('/generate-report', [\App\Http\Controllers\CRM\AnalyticsController::class, 'generateReport'])->name('generate-report');
        });

        // AI Conversation Export routes (Admin only)
        Route::prefix('ai-conversations')->name('ai-conversations.')->middleware('role:admin|super_user')->group(function () {
            Route::get('/export', function () {
                return \Inertia\Inertia::render('Settings/AIConversationExport');
            })->name('export.index');
            Route::post('/export', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'export'])->name('export');
            Route::get('/statistics', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'statistics'])->name('statistics');
            Route::post('/preview', [\App\Http\Controllers\CRM\AIConversationExportController::class, 'preview'])->name('preview');
        });
    });

    // Projects routes
    Route::prefix('projects')->name('projects.')->middleware('permission:view projects')->group(function () {
        Route::get('/{project}/users', [\App\Http\Controllers\ProjectController::class, 'users'])->name('project.users');
        // Dashboard
        Route::get('/', [\App\Http\Controllers\ProjectController::class, 'dashboard'])->name('dashboard');
        Route::get('/analytics', [\App\Http\Controllers\ProjectController::class, 'analytics'])->name('analytics');

        // My Tasks (global route for current user's tasks)
        Route::get('/my-tasks', [\App\Http\Controllers\ProjectTaskController::class, 'myTasks'])->name('my-tasks');

        // Project Setup/Settings (must be before /{project} catch-all)
        Route::prefix('setup')->name('setup.')->middleware('permission:manage-project-settings')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectSetupController::class, 'index'])->name('index');
            Route::post('/update-general', [\App\Http\Controllers\ProjectSetupController::class, 'updateGeneral'])->name('update-general');
            Route::post('/update-tasks', [\App\Http\Controllers\ProjectSetupController::class, 'updateTasks'])->name('update-tasks');
            Route::post('/update-time-tracking', [\App\Http\Controllers\ProjectSetupController::class, 'updateTimeTracking'])->name('update-time-tracking');
            Route::post('/update-milestones', [\App\Http\Controllers\ProjectSetupController::class, 'updateMilestones'])->name('update-milestones');
            Route::post('/update-collaboration', [\App\Http\Controllers\ProjectSetupController::class, 'updateCollaboration'])->name('update-collaboration');
            Route::post('/update-ai', [\App\Http\Controllers\ProjectSetupController::class, 'updateAI'])->name('update-ai');
        });

        // Templates (must be before /{project} catch-all)
        Route::prefix('templates')->name('templates.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectTemplateController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\ProjectTemplateController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\ProjectTemplateController::class, 'store'])->name('store');
            Route::get('/{template}', [\App\Http\Controllers\ProjectTemplateController::class, 'show'])->name('show');
            Route::get('/{template}/edit', [\App\Http\Controllers\ProjectTemplateController::class, 'edit'])->name('edit');
            Route::put('/{template}', [\App\Http\Controllers\ProjectTemplateController::class, 'update'])->name('update');
            Route::delete('/{template}', [\App\Http\Controllers\ProjectTemplateController::class, 'destroy'])->name('destroy');
            Route::post('/{template}/duplicate', [\App\Http\Controllers\ProjectTemplateController::class, 'duplicate'])->name('duplicate');
        });

        // Tags (must be before /{project} catch-all)
        Route::prefix('tags')->name('tags.')->group(function () {
            Route::get('/', [\App\Http\Controllers\TagController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\TagController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\TagController::class, 'store'])->name('store');
            Route::get('/search', [\App\Http\Controllers\TagController::class, 'search'])->name('search');
            Route::get('/{tag}', [\App\Http\Controllers\TagController::class, 'show'])->name('show');
            Route::get('/{tag}/edit', [\App\Http\Controllers\TagController::class, 'edit'])->name('edit');
            Route::put('/{tag}', [\App\Http\Controllers\TagController::class, 'update'])->name('update');
            Route::delete('/{tag}', [\App\Http\Controllers\TagController::class, 'destroy'])->name('destroy');
        });

        // Projects CRUD
        Route::get('/list', [\App\Http\Controllers\ProjectController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\ProjectController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\ProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('show');
        Route::get('/{project}/edit', [\App\Http\Controllers\ProjectController::class, 'edit'])->name('edit');
        Route::put('/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [\App\Http\Controllers\ProjectController::class, 'destroy'])->name('destroy');

        // Kanban Board
        Route::get('/{project}/kanban', [\App\Http\Controllers\ProjectController::class, 'kanban'])->name('kanban');

        // Generate project insights
        Route::post('/{project}/ai-milestones', [\App\Http\Controllers\ProjectController::class, 'generateAIMilestonesApi'])
            ->name('ai-milestones');

        Route::post('/{project}/ai-insights', [\App\Http\Controllers\ProjectController::class, 'aiInsights'])
            ->name('ai-insights');

        // Milestones
        Route::prefix('{project}/milestones')->name('milestones.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectMilestoneController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\ProjectMilestoneController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\ProjectMilestoneController::class, 'store'])->name('store');
            Route::get('/{milestone}', [\App\Http\Controllers\ProjectMilestoneController::class, 'show'])->name('show');
            Route::get('/{milestone}/edit', [\App\Http\Controllers\ProjectMilestoneController::class, 'edit'])->name('edit');
            Route::put('/{milestone}', [\App\Http\Controllers\ProjectMilestoneController::class, 'update'])->name('update');
            Route::delete('/{milestone}', [\App\Http\Controllers\ProjectMilestoneController::class, 'destroy'])->name('destroy');
            Route::patch('/{milestone}/status', [\App\Http\Controllers\ProjectMilestoneController::class, 'updateStatus'])->name('update-status');
        });

        // Files
        Route::prefix('{project}/files')->name('files.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectFileController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\ProjectFileController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\ProjectFileController::class, 'store'])->name('store');
            Route::get('/{file}', [\App\Http\Controllers\ProjectFileController::class, 'show'])->name('show');
            Route::get('/{file}/download', [\App\Http\Controllers\ProjectFileController::class, 'download'])->name('download');
            Route::delete('/{file}', [\App\Http\Controllers\ProjectFileController::class, 'destroy'])->name('destroy');
            Route::post('/{file}/new-version', [\App\Http\Controllers\ProjectFileController::class, 'newVersion'])->name('new-version');
        });

        // Time Logs
        Route::prefix('{project}/time-logs')->name('time-logs.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectTimeLogController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\ProjectTimeLogController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\ProjectTimeLogController::class, 'store'])->name('store');
            Route::get('/{timeLog}', [\App\Http\Controllers\ProjectTimeLogController::class, 'show'])->name('show');
            Route::get('/{timeLog}/edit', [\App\Http\Controllers\ProjectTimeLogController::class, 'edit'])->name('edit');
            Route::put('/{timeLog}', [\App\Http\Controllers\ProjectTimeLogController::class, 'update'])->name('update');
            Route::delete('/{timeLog}', [\App\Http\Controllers\ProjectTimeLogController::class, 'destroy'])->name('destroy');
            Route::patch('/{timeLog}/submit', [\App\Http\Controllers\ProjectTimeLogController::class, 'submit'])->name('submit');
            Route::patch('/{timeLog}/approve', [\App\Http\Controllers\ProjectTimeLogController::class, 'approve'])->name('approve');
        });

        // Tasks
        Route::prefix('{project}/tasks')->name('tasks.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProjectTaskController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\ProjectTaskController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\ProjectTaskController::class, 'store'])->name('store');
            Route::get('/{task}', [\App\Http\Controllers\ProjectTaskController::class, 'show'])->name('show');
            Route::get('/{task}/edit', [\App\Http\Controllers\ProjectTaskController::class, 'edit'])->name('edit');
            Route::put('/{task}', [\App\Http\Controllers\ProjectTaskController::class, 'update'])->name('update');
            Route::delete('/{task}', [\App\Http\Controllers\ProjectTaskController::class, 'destroy'])->name('destroy');
            Route::patch('/{task}/status', [\App\Http\Controllers\ProjectTaskController::class, 'updateStatus'])->name('update-status');
        });

        // LiveChat Integration
        Route::get('/{project}/livechat', [\App\Http\Controllers\CRM\LiveChatController::class, 'projectChat'])->name('livechat');
    });

    // Agile/PM routes
    Route::prefix('agile')->name('agile.')->middleware('permission:view projects')->group(function () {
        // Boards
        Route::prefix('boards')->name('boards.')->group(function () {
            Route::get('/{project}/create', [\App\Http\Controllers\Agile\BoardController::class, 'create'])->name('create');
            Route::post('/{project}', [\App\Http\Controllers\Agile\BoardController::class, 'store'])->name('store');
        });

        Route::prefix('board')->name('board.')->group(function () {
            Route::get('/{board}', [\App\Http\Controllers\Agile\BoardController::class, 'show'])->name('show');
            Route::get('/{board}/edit', [\App\Http\Controllers\Agile\BoardController::class, 'edit'])->name('edit');
            Route::put('/{board}', [\App\Http\Controllers\Agile\BoardController::class, 'update'])->name('update');
            Route::delete('/{board}', [\App\Http\Controllers\Agile\BoardController::class, 'destroy'])->name('destroy');
            Route::get('/{board}/settings', [\App\Http\Controllers\Agile\BoardController::class, 'settings'])->name('settings');
        });

        // Board Columns
        Route::prefix('columns')->name('columns.')->group(function () {
            Route::post('/{board}', [\App\Http\Controllers\Agile\BoardColumnController::class, 'store'])->name('create');
            Route::put('/{column}', [\App\Http\Controllers\Agile\BoardColumnController::class, 'update'])->name('update');
            Route::delete('/{column}', [\App\Http\Controllers\Agile\BoardColumnController::class, 'destroy'])->name('destroy');
        });

        // Board Cards
        Route::prefix('cards')->name('cards.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Agile\BoardCardController::class, 'index'])->name('index');
            Route::get('/', [\App\Http\Controllers\Agile\BoardCardController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Agile\BoardCardController::class, 'create'])->name('create');
            Route::post('/{board}', [\App\Http\Controllers\Agile\BoardCardController::class, 'store'])->name('store');
            Route::get('/{card}', [\App\Http\Controllers\Agile\BoardCardController::class, 'show'])->name('show');
            Route::get('/{card}/edit', [\App\Http\Controllers\Agile\BoardCardController::class, 'edit'])->name('edit');
            Route::put('/{card}', [\App\Http\Controllers\Agile\BoardCardController::class, 'update'])->name('update');
            Route::put('/{card}/move', [\App\Http\Controllers\Agile\BoardCardController::class, 'move'])->name('move');
            Route::post('/{card}/comments', [\App\Http\Controllers\Agile\BoardCardController::class, 'storeComment'])->name('comments.store');
            Route::delete('/{card}/comments/{comment}', [\App\Http\Controllers\Agile\BoardCardController::class, 'destroyComment'])->name('comments.destroy');

            Route::post('/{card}/attachments', [\App\Http\Controllers\Agile\BoardCardController::class, 'storeAttachment'])->name('attachments.store');
            Route::delete('/{card}/attachments/{attachment}', [\App\Http\Controllers\Agile\BoardCardController::class, 'destroyAttachment'])->name('attachments.destroy');
            Route::delete('/{card}', [\App\Http\Controllers\Agile\BoardCardController::class, 'destroy'])->name('destroy');

            // Card Votes
            Route::post('/{card}/votes', [\App\Http\Controllers\CardVoteController::class, 'store'])->name('votes.store');
            Route::delete('/{card}/votes/{vote}', [\App\Http\Controllers\CardVoteController::class, 'destroy'])->name('votes.destroy');

            // Card Checklists
            Route::post('/{card}/checklists', [\App\Http\Controllers\CardChecklistController::class, 'store'])->name('checklists.store');
            Route::delete('/{card}/checklists/{checklist}', [\App\Http\Controllers\CardChecklistController::class, 'destroy'])->name('checklists.destroy');
            Route::post('/{card}/checklists/{checklist}/items', [\App\Http\Controllers\CardChecklistController::class, 'storeItem'])->name('checklists.items.store');
            Route::put('/{card}/checklists/{checklist}/items/{item}', [\App\Http\Controllers\CardChecklistController::class, 'updateItem'])->name('checklists.items.update');

            // Card Subscribers
            Route::post('/{card}/subscribers', [\App\Http\Controllers\CardSubscriberController::class, 'store'])->name('subscribers.store');
            Route::delete('/{card}/subscribers/{subscriber}', [\App\Http\Controllers\CardSubscriberController::class, 'destroy'])->name('subscribers.destroy');

            // Card Watchers
            Route::post('/{card}/watchers', [\App\Http\Controllers\CardWatcherController::class, 'store'])->name('watchers.store');
            Route::delete('/{card}/watchers/{watcher}', [\App\Http\Controllers\CardWatcherController::class, 'destroy'])->name('watchers.destroy');

            // Card Time Tracking
            // Route removed: CardTimeController does not exist
        });

        // Sprints
        Route::prefix('sprints')->name('sprints.')->group(function () {
            Route::get('/{project}', [\App\Http\Controllers\Agile\SprintController::class, 'index'])->name('index');
            Route::get('/{project}/create', [\App\Http\Controllers\Agile\SprintController::class, 'create'])->name('create');
            Route::post('/{project}/create', [\App\Http\Controllers\Agile\SprintController::class, 'store'])->name('store');
            Route::get('/{sprint}/show', [\App\Http\Controllers\Agile\SprintController::class, 'show'])->name('show');
            Route::put('/{sprint}', [\App\Http\Controllers\Agile\SprintController::class, 'update'])->name('update');
            Route::get('/{sprint}/edit', [\App\Http\Controllers\Agile\SprintController::class, 'edit'])->name('edit');
            Route::post('/{sprint}/start', [\App\Http\Controllers\Agile\SprintController::class, 'start'])->name('start');
            Route::post('/{sprint}/complete', [\App\Http\Controllers\Agile\SprintController::class, 'complete'])->name('complete');
            Route::delete('/{sprint}', [\App\Http\Controllers\Agile\SprintController::class, 'destroy'])->name('destroy');
        });

        // Backlog
        Route::prefix('backlog')->name('backlog.')->group(function () {
            Route::get('/{project}', [\App\Http\Controllers\Agile\BacklogController::class, 'index'])->name('index');
            Route::get('/{project}/create', [\App\Http\Controllers\Agile\BacklogController::class, 'create'])->name('create');
            Route::post('/{project}', [\App\Http\Controllers\Agile\BacklogController::class, 'store'])->name('store');

            // ✅ show MUST include backlog id
            Route::get('/{backlog}/project/{project}', [\App\Http\Controllers\Agile\BacklogController::class, 'show'])->name('show');

            // edit already fine
            Route::get('/{backlog}/project/{project}/edit', [\App\Http\Controllers\Agile\BacklogController::class, 'edit'])->name('edit');

            // update should include project too (recommended for consistency)
            Route::put('/{project}/{backlog}', [\App\Http\Controllers\Agile\BacklogController::class, 'update'])->name('update');

            Route::put('/{backlog}/move', [\App\Http\Controllers\Agile\BacklogController::class, 'move'])->name('move');

            // ✅ these 3 are fine (no project param)
            Route::patch('/{backlog}/assign', [\App\Http\Controllers\Agile\BacklogController::class, 'assign'])->name('assign');
            Route::patch('/{backlog}/priority', [\App\Http\Controllers\Agile\BacklogController::class, 'updatePriority'])->name('priority');
            Route::patch('/{backlog}/status', [\App\Http\Controllers\Agile\BacklogController::class, 'updateStatus'])->name('status');

            // ✅ destroy should take project too (recommended)
            Route::delete('/{project}/{backlog}', [\App\Http\Controllers\Agile\BacklogController::class, 'destroy'])->name('destroy');
        });

        // Releases
        Route::prefix('releases')->name('releases.')->group(function () {
            Route::get('/{project}', [\App\Http\Controllers\Agile\ReleaseController::class, 'index'])->name('index');
            Route::get('/{project}/create', [\App\Http\Controllers\Agile\ReleaseController::class, 'create'])->name('create');
            Route::post('/{project}', [\App\Http\Controllers\Agile\ReleaseController::class, 'store'])->name('store');
            Route::get('/{release}/show', [\App\Http\Controllers\Agile\ReleaseController::class, 'show'])->name('show');
            Route::get('/{release}/edit', [\App\Http\Controllers\Agile\ReleaseController::class, 'edit'])->name('edit');
            Route::put('/{release}', [\App\Http\Controllers\Agile\ReleaseController::class, 'update'])->name('update');
            Route::post('/{release}/publish', [\App\Http\Controllers\Agile\ReleaseController::class, 'publish'])->name('publish');
            Route::delete('/{release}', [\App\Http\Controllers\Agile\ReleaseController::class, 'destroy'])->name('destroy');
        });

        // Epics
        Route::prefix('epics')->name('epics.')->group(function () {
            Route::get('/{project}', [\App\Http\Controllers\Agile\EpicController::class, 'index'])->name('index');
            Route::post('/{project}', [\App\Http\Controllers\Agile\EpicController::class, 'store'])->name('store');
            Route::get('/{epic}/show', [\App\Http\Controllers\Agile\EpicController::class, 'show'])->name('show');
            Route::put('/{epic}', [\App\Http\Controllers\Agile\EpicController::class, 'update'])->name('update');
            Route::delete('/{epic}', [\App\Http\Controllers\Agile\EpicController::class, 'destroy'])->name('destroy');
        });

        // Hybrid Mode Sync
        Route::prefix('hybrid')->name('hybrid.')->group(function () {
            Route::post('/link/task-to-card/{task}', [\App\Http\Controllers\Agile\HybridSyncController::class, 'linkTaskToCard'])->name('link.task-to-card');
            Route::post('/link/card-to-task/{card}', [\App\Http\Controllers\Agile\HybridSyncController::class, 'linkCardToTask'])->name('link.card-to-task');
            Route::delete('/unlink/task/{task}', [\App\Http\Controllers\Agile\HybridSyncController::class, 'unlinkTask'])->name('unlink.task');
            Route::delete('/unlink/card/{card}', [\App\Http\Controllers\Agile\HybridSyncController::class, 'unlinkCard'])->name('unlink.card');
        });
    });

    // Finance routes
    Route::prefix('finance')->name('finance.')->middleware('permission:view finance')->group(function () {
        Route::get('/', [\App\Http\Controllers\Finance\DashboardController::class, 'index'])->name('dashboard');

        // Accounts
        Route::resource('accounts', \App\Http\Controllers\Finance\AccountController::class);

        // Chart of Accounts
        Route::prefix('chart-of-accounts')->name('chart-of-accounts.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'store'])->name('store');
            Route::get('/tree', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'tree'])->name('tree');
            Route::get('/{account}', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'show'])->name('show');
            Route::get('/{account}/edit', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'edit'])->name('edit');
            Route::put('/{account}', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'update'])->name('update');
            Route::delete('/{account}', [\App\Http\Controllers\Finance\ChartOfAccountsController::class, 'destroy'])->name('destroy');
        });

        // Bank Statements
        Route::prefix('bank-statements')->name('bank-statements.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\BankStatementController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Finance\BankStatementController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Finance\BankStatementController::class, 'store'])->name('store');
            Route::post('/import', [\App\Http\Controllers\Finance\BankStatementController::class, 'import'])->name('import');
            Route::post('/preview', [\App\Http\Controllers\Finance\BankStatementController::class, 'preview'])->name('preview');
            Route::get('/{bankStatement}', [\App\Http\Controllers\Finance\BankStatementController::class, 'show'])->name('show');
            Route::get('/{bankStatement}/edit', [\App\Http\Controllers\Finance\BankStatementController::class, 'edit'])->name('edit');
            Route::put('/{bankStatement}', [\App\Http\Controllers\Finance\BankStatementController::class, 'update'])->name('update');
            Route::delete('/{bankStatement}', [\App\Http\Controllers\Finance\BankStatementController::class, 'destroy'])->name('destroy');
            Route::get('/{bankStatement}/download', [\App\Http\Controllers\Finance\BankStatementController::class, 'downloadFile'])->name('download');
            Route::post('/{bankStatement}/reprocess', [\App\Http\Controllers\Finance\BankStatementController::class, 'reprocess'])->name('reprocess');
        });

        // Bank Reconciliation
        Route::prefix('bank-reconciliation')->name('bank-reconciliation.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'store'])->name('store');
            Route::get('/{bankReconciliation}', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'show'])->name('show');
            Route::delete('/{bankReconciliation}', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'destroy'])->name('destroy');
            Route::post('/{bankReconciliation}/auto-match', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'autoMatch'])->name('auto-match');
            Route::post('/{bankReconciliation}/manual-match', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'manualMatch'])->name('manual-match');
            Route::post('/{bankReconciliation}/unmatch', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'unmatch'])->name('unmatch');
            Route::post('/{bankReconciliation}/complete', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'complete'])->name('complete');
            Route::post('/{bankReconciliation}/review', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'review'])->name('review');
            Route::post('/{bankReconciliation}/approve', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'approve'])->name('approve');
            Route::get('/{bankReconciliation}/suggested-matches', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'getSuggestedMatches'])->name('suggested-matches');
            Route::get('/{bankReconciliation}/export', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'export'])->name('export');
        });

        // Transactions
        Route::resource('transactions', \App\Http\Controllers\Finance\TransactionController::class);
        Route::post('transactions/ai-suggestions', [\App\Http\Controllers\Finance\TransactionController::class, 'aiSuggestions'])->name('transactions.ai-suggestions');

        // Invoices
        Route::resource('invoices', \App\Http\Controllers\Finance\InvoiceController::class);
        Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Finance\InvoiceController::class, 'send'])->name('invoices.send');
        Route::get('invoices/{invoice}/pdf', [\App\Http\Controllers\Finance\InvoiceController::class, 'pdf'])->name('invoices.pdf');
        Route::post('invoices/generate-items', [\App\Http\Controllers\Finance\InvoiceController::class, 'generateItems'])->name('invoices.generate-items');

        // Payments
        Route::resource('payments', \App\Http\Controllers\Finance\PaymentController::class);

        // Quotations
        Route::resource('quotations', \App\Http\Controllers\Finance\QuotationController::class);
        Route::post('quotations/{quotation}/send', [\App\Http\Controllers\Finance\QuotationController::class, 'send'])->name('quotations.send');
        Route::post('quotations/{quotation}/accept', [\App\Http\Controllers\Finance\QuotationController::class, 'accept'])->name('quotations.accept');
        Route::post('quotations/{quotation}/reject', [\App\Http\Controllers\Finance\QuotationController::class, 'reject'])->name('quotations.reject');
        Route::post('quotations/{quotation}/convert-to-invoice', [\App\Http\Controllers\Finance\QuotationController::class, 'convertToInvoice'])->name('quotations.convert-to-invoice');
        Route::get('quotations/{quotation}/pdf', [\App\Http\Controllers\Finance\QuotationController::class, 'pdf'])->name('quotations.pdf');
        Route::get('quotations/{quotation}/print', [\App\Http\Controllers\Finance\QuotationController::class, 'print'])->name('quotations.print');

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Finance\AnalyticsController::class, 'dashboard'])->name('dashboard');
            Route::get('quotations', [\App\Http\Controllers\Finance\AnalyticsController::class, 'quotations'])->name('quotations');
            Route::get('invoices', [\App\Http\Controllers\Finance\AnalyticsController::class, 'invoices'])->name('invoices');
            Route::get('revenue', [\App\Http\Controllers\Finance\AnalyticsController::class, 'revenue'])->name('revenue');
            Route::get('export', [\App\Http\Controllers\Finance\AnalyticsController::class, 'export'])->name('export');
        });

        // Templates (Commented out - Controller not implemented yet)
        // Route::resource('templates', \App\Http\Controllers\Finance\TemplateController::class);
        // Route::post('templates/{template}/duplicate', [\App\Http\Controllers\Finance\TemplateController::class, 'duplicate'])->name('templates.duplicate');
        // Route::post('templates/{template}/set-default', [\App\Http\Controllers\Finance\TemplateController::class, 'setDefault'])->name('templates.set-default');

        // Email Management (Commented out - Controller not implemented yet)
        // Route::prefix('emails')->name('emails.')->group(function () {
        //     Route::post('quotations/{quotation}/send', [\App\Http\Controllers\Finance\EmailController::class, 'sendQuotation'])->name('quotations.send');
        //     Route::post('quotations/{quotation}/reminder', [\App\Http\Controllers\Finance\EmailController::class, 'sendQuotationReminder'])->name('quotations.reminder');
        //     Route::post('invoices/{invoice}/send', [\App\Http\Controllers\Finance\EmailController::class, 'sendInvoice'])->name('invoices.send');
        //     Route::post('invoices/{invoice}/followup', [\App\Http\Controllers\Finance\EmailController::class, 'sendInvoiceFollowUp'])->name('invoices.followup');
        //     Route::get('preview/{type}/{id}', [\App\Http\Controllers\Finance\EmailController::class, 'preview'])->name('preview');
        // });

        // Approval Workflows (Commented out - Controllers not implemented yet)
        // Route::prefix('approvals')->name('approvals.')->group(function () {
        //     Route::resource('workflows', \App\Http\Controllers\Finance\ApprovalWorkflowController::class);
        //     Route::resource('requests', \App\Http\Controllers\Finance\ApprovalRequestController::class)->only(['index', 'show']);
        //     Route::post('requests/{request}/approve', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'approve'])->name('requests.approve');
        //     Route::post('requests/{request}/reject', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'reject'])->name('requests.reject');
        //     Route::post('requests/{request}/cancel', [\App\Http\Controllers\Finance\ApprovalRequestController::class, 'cancel'])->name('requests.cancel');
        // });

        // Expenses
        Route::resource('expenses', \App\Http\Controllers\Finance\ExpenseController::class);
        Route::post('expenses/{expense}/approve', [\App\Http\Controllers\Finance\ExpenseController::class, 'approve'])->name('expenses.approve');
        Route::post('expenses/{expense}/reject', [\App\Http\Controllers\Finance\ExpenseController::class, 'reject'])->name('expenses.reject');
        Route::post('expenses/process-receipt', [\App\Http\Controllers\Finance\ExpenseController::class, 'processReceipt'])->name('expenses.process-receipt');

        // Budgets
        Route::resource('budgets', \App\Http\Controllers\Finance\BudgetController::class);

        // Categories
        Route::resource('categories', \App\Http\Controllers\Finance\CategoryController::class);

        // Reports
        Route::resource('reports', \App\Http\Controllers\Finance\ReportController::class);
        Route::get('reports/{report}/download', [\App\Http\Controllers\Finance\ReportController::class, 'download'])->name('reports.download');
        Route::get('reports/{report}/export/{format}', [\App\Http\Controllers\Finance\ReportController::class, 'export'])->name('reports.export');

        // Specific Report Types
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('chart-of-accounts', [\App\Http\Controllers\Finance\ReportController::class, 'chartOfAccounts'])->name('chart-of-accounts');
            Route::get('trial-balance', [\App\Http\Controllers\Finance\ReportController::class, 'trialBalance'])->name('trial-balance');
            Route::get('reconciliation-summary', [\App\Http\Controllers\Finance\ReportController::class, 'reconciliationSummary'])->name('reconciliation-summary');
        });

        // Bank Reconciliation
        Route::prefix('reconciliation')->name('reconciliation.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'store'])->name('store');
            Route::get('/{reconciliation}', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'show'])->name('show');
            Route::put('/{reconciliation}', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'update'])->name('update');
            Route::delete('/{reconciliation}', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'destroy'])->name('destroy');
            Route::post('/import', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'import'])->name('import');
            Route::post('/{reconciliation}/finalize', [\App\Http\Controllers\Finance\BankReconciliationController::class, 'finalize'])->name('finalize');
        });

        // Mobile Money (MoMo) Integration
        Route::prefix('momo')->name('momo.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\MomoController::class, 'index'])->name('index');
            Route::get('/dashboard', [\App\Http\Controllers\Finance\MomoController::class, 'dashboard'])->name('dashboard');
            Route::get('/create', [\App\Http\Controllers\Finance\MomoController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Finance\MomoController::class, 'store'])->name('store');
            Route::get('/{transaction}', [\App\Http\Controllers\Finance\MomoController::class, 'show'])->name('show');

            // Payment and Payout Operations
            Route::post('/payout', [\App\Http\Controllers\Finance\MomoController::class, 'payout'])->name('payout');
            Route::post('/{transaction}/check-status', [\App\Http\Controllers\Finance\MomoController::class, 'checkStatus'])->name('check-status');

            // Reconciliation
            Route::get('/reconciliation/dashboard', [\App\Http\Controllers\Finance\MomoController::class, 'reconciliation'])->name('reconciliation');
            Route::post('/reconciliation/auto', [\App\Http\Controllers\Finance\MomoController::class, 'autoReconcile'])->name('reconciliation.auto');
            Route::post('/reconciliation/manual', [\App\Http\Controllers\Finance\MomoController::class, 'manualReconcile'])->name('reconciliation.manual');

            // Audit and Reporting
            Route::get('/audit', [\App\Http\Controllers\Finance\MomoController::class, 'audit'])->name('audit');
            Route::get('/audit/export', [\App\Http\Controllers\Finance\MomoController::class, 'exportAudit'])->name('audit.export');

            // Provider management removed — payments use PawaPay (see Settings → Finance → Payments)
            Route::redirect('/providers', '/settings/finance/payments/pawapay')->name('providers');

            // Statistics and Analytics
            Route::get('/statistics', [\App\Http\Controllers\Finance\MomoController::class, 'statistics'])->name('statistics');
        });

        // ZRA Smart Invoice routes
        Route::prefix('zra')->name('zra.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Finance\ZraController::class, 'index'])->name('index');
            Route::get('/dashboard', [\App\Http\Controllers\Finance\ZraController::class, 'dashboard'])->name('dashboard');
            Route::get('/dashboard', [\App\Http\Controllers\Finance\ZraController::class, 'dashboard'])->name('dashboard');
            Route::get('invoices/{zraInvoice}', [\App\Http\Controllers\Finance\ZraController::class, 'show'])->name('show');
            Route::post('invoices/{invoice}/submit', [\App\Http\Controllers\Finance\ZraController::class, 'submit'])->name('submit');
            Route::post('invoices/{zraInvoice}/check-status', [\App\Http\Controllers\Finance\ZraController::class, 'checkStatus'])->name('check-status');
            Route::post('invoices/{zraInvoice}/cancel', [\App\Http\Controllers\Finance\ZraController::class, 'cancel'])->name('cancel');
            Route::post('invoices/{zraInvoice}/retry', [\App\Http\Controllers\Finance\ZraController::class, 'retry'])->name('retry');
            Route::get('invoices/{zraInvoice}/qr-code', [\App\Http\Controllers\Finance\ZraController::class, 'downloadQrCode'])->name('qr-code');

            // Configuration
            Route::get('configuration', [\App\Http\Controllers\Finance\ZraController::class, 'configuration'])->name('configuration');
            Route::post('configuration', [\App\Http\Controllers\Finance\ZraController::class, 'updateConfiguration'])->name('configuration.update');
            Route::post('test-connection', [\App\Http\Controllers\Finance\ZraController::class, 'testConnection'])->name('test-connection');

            // Audit & Reporting
            Route::get('audit-logs', [\App\Http\Controllers\Finance\ZraController::class, 'auditLogs'])->name('audit-logs');
            Route::get('audit-logs/export', [\App\Http\Controllers\Finance\ZraController::class, 'exportAuditLogs'])->name('audit-logs.export');
            Route::get('statistics', [\App\Http\Controllers\Finance\ZraController::class, 'statistics'])->name('statistics');
        });
    });

    // Inventory routes
    Route::prefix('inventory')->name('inventory.')->middleware('permission:view inventory')->group(function () {
        Route::get('/', [\App\Http\Controllers\Inventory\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('products', \App\Http\Controllers\Inventory\ProductController::class);
        Route::get('warehouses', [\App\Http\Controllers\Inventory\WarehouseController::class, 'index'])->name('warehouses.index');
        Route::post('warehouses', [\App\Http\Controllers\Inventory\WarehouseController::class, 'store'])->name('warehouses.store');
        Route::put('warehouses/{warehouse}', [\App\Http\Controllers\Inventory\WarehouseController::class, 'update'])->name('warehouses.update');
        Route::get('warehouses/{warehouse}/stock', [\App\Http\Controllers\Inventory\WarehouseController::class, 'stock'])->name('warehouses.stock');
    });

    // Procurement routes
    Route::prefix('procurement')->name('procurement.')->middleware('permission:view procurement')->group(function () {
        Route::get('/', [\App\Http\Controllers\Procurement\DashboardController::class, 'index'])->name('dashboard');
        Route::get('suppliers', [\App\Http\Controllers\Procurement\SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('suppliers', [\App\Http\Controllers\Procurement\SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('suppliers/{supplier}', [\App\Http\Controllers\Procurement\SupplierController::class, 'update'])->name('suppliers.update');
        Route::resource('purchase-orders', \App\Http\Controllers\Procurement\PurchaseOrderController::class)->only(['index', 'create', 'store', 'show']);
        Route::post('purchase-orders/{purchaseOrder}/approve', [\App\Http\Controllers\Procurement\PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
        Route::post('purchase-orders/{purchaseOrder}/receive', [\App\Http\Controllers\Procurement\PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive');
    });

    // Sales / Order Management routes
    Route::prefix('sales')->name('sales.')->middleware('permission:view sales orders')->group(function () {
        Route::get('/', [\App\Http\Controllers\Sales\DashboardController::class, 'index'])->name('dashboard');
        Route::resource('orders', \App\Http\Controllers\Sales\SalesOrderController::class)->only(['index', 'create', 'store', 'show']);
        Route::post('orders/{order}/confirm', [\App\Http\Controllers\Sales\SalesOrderController::class, 'confirm'])->name('orders.confirm');
        Route::post('orders/{order}/fulfill', [\App\Http\Controllers\Sales\SalesOrderController::class, 'fulfill'])->name('orders.fulfill');
    });

    // POS routes
    Route::prefix('pos')->name('pos.')->middleware('permission:access pos')->group(function () {
        Route::get('/', [\App\Http\Controllers\POS\PosController::class, 'index'])->name('index');
        Route::get('registers/{register}/terminal', [\App\Http\Controllers\POS\PosController::class, 'terminal'])->name('terminal');
        Route::post('registers/{register}/open', [\App\Http\Controllers\POS\PosController::class, 'openSession'])->name('sessions.open');
        Route::post('sessions/{session}/close', [\App\Http\Controllers\POS\PosController::class, 'closeSession'])->name('sessions.close');
        Route::post('sessions/{session}/sale', [\App\Http\Controllers\POS\PosController::class, 'sale'])->name('sale');
        Route::post('sessions/{session}/momo-sale', [\App\Http\Controllers\POS\PosController::class, 'momoSale'])->name('momo-sale');
        Route::post('momo/{transaction}/status', [\App\Http\Controllers\POS\PosController::class, 'momoStatus'])->name('momo.status');
        Route::get('sales/{sale}/receipt', [\App\Http\Controllers\Commerce\ReceiptController::class, 'posSale'])->name('sales.receipt');

        Route::middleware('permission:manage pos registers')->group(function () {
            Route::get('terminals', [\App\Http\Controllers\POS\PosRegisterController::class, 'index'])->name('registers.index');
            Route::post('terminals', [\App\Http\Controllers\POS\PosRegisterController::class, 'store'])->name('registers.store');
            Route::put('terminals/{register}', [\App\Http\Controllers\POS\PosRegisterController::class, 'update'])->name('registers.update');
            Route::delete('terminals/{register}', [\App\Http\Controllers\POS\PosRegisterController::class, 'destroy'])->name('registers.destroy');
        });
    });

    // Ecommerce admin routes
    Route::prefix('ecommerce')->name('ecommerce.')->middleware('permission:view ecommerce')->group(function () {
        Route::get('/', [\App\Http\Controllers\Ecommerce\AdminController::class, 'index'])->name('dashboard');
    });

    // HR routes
    Route::prefix('hr')->name('hr.')->middleware('permission:view hr')->group(function () {
        // Teams Management
        Route::resource('teams', \App\Http\Controllers\HR\TeamController::class);
        // Dashboard
        Route::get('/', [\App\Http\Controllers\HR\DashboardController::class, 'index'])->name('dashboard');

        // Employees
        Route::resource('employees', \App\Http\Controllers\HR\EmployeeController::class);
        Route::post('employees/{employee}/activate', [\App\Http\Controllers\HR\EmployeeController::class, 'activate'])->name('employees.activate');
        Route::post('employees/{employee}/deactivate', [\App\Http\Controllers\HR\EmployeeController::class, 'deactivate'])->name('employees.deactivate');
        Route::get('employees/{employee}/documents', [\App\Http\Controllers\HR\EmployeeController::class, 'documents'])->name('employees.documents');
        Route::post('employees/{employee}/documents', [\App\Http\Controllers\HR\EmployeeController::class, 'uploadDocument'])->name('employees.documents.upload');

        // Departments
        Route::resource('departments', \App\Http\Controllers\HR\DepartmentController::class);
        Route::post('departments/{department}/activate', [\App\Http\Controllers\HR\DepartmentController::class, 'activate'])->name('departments.activate');
        Route::post('departments/{department}/deactivate', [\App\Http\Controllers\HR\DepartmentController::class, 'deactivate'])->name('departments.deactivate');

        // Leave Management
        Route::resource('leave', \App\Http\Controllers\HR\LeaveController::class);
        Route::post('leave/{leave}/approve', [\App\Http\Controllers\HR\LeaveController::class, 'approve'])->name('leave.approve');
        Route::post('leave/{leave}/reject', [\App\Http\Controllers\HR\LeaveController::class, 'reject'])->name('leave.reject');
        Route::get('leave-types', [\App\Http\Controllers\HR\LeaveController::class, 'leaveTypes'])->name('leave-types.index');
        Route::post('leave-types', [\App\Http\Controllers\HR\LeaveController::class, 'storeLeaveType'])->name('leave-types.store');

        // Performance Management
        Route::resource('performance', \App\Http\Controllers\HR\PerformanceController::class);
        Route::post('performance/{performance}/submit', [\App\Http\Controllers\HR\PerformanceController::class, 'submit'])->name('performance.submit');
        Route::post('performance/{performance}/start-review', [\App\Http\Controllers\HR\PerformanceController::class, 'startReview'])->name('performance.start-review');
        Route::post('performance/{performance}/approve', [\App\Http\Controllers\HR\PerformanceController::class, 'approve'])->name('performance.approve');

        // Attendance
        Route::get('attendance/reports', [\App\Http\Controllers\HR\AttendanceController::class, 'reports'])->name('attendance.reports');
        Route::post('attendance/clock-in', [\App\Http\Controllers\HR\AttendanceController::class, 'clockIn'])->name('attendance.clock-in');
        Route::post('attendance/clock-out', [\App\Http\Controllers\HR\AttendanceController::class, 'clockOut'])->name('attendance.clock-out');
        Route::resource('attendance', \App\Http\Controllers\HR\AttendanceController::class);

        // Training & Development
        Route::resource('training', \App\Http\Controllers\HR\TrainingController::class);
        Route::post('training/{training}/enroll', [\App\Http\Controllers\HR\TrainingController::class, 'enroll'])->name('training.enroll');
        Route::post('training/{training}/complete', [\App\Http\Controllers\HR\TrainingController::class, 'complete'])->name('training.complete');

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [\App\Http\Controllers\HR\AnalyticsController::class, 'index'])->name('dashboard');
            Route::get('/reports', [\App\Http\Controllers\HR\AnalyticsController::class, 'reports'])->name('reports');
            Route::post('/export', [\App\Http\Controllers\HR\AnalyticsController::class, 'export'])->name('export');
        });
        // Skills Management
        Route::resource('skills', \App\Http\Controllers\HR\SkillController::class);

        // Document Management
        Route::resource('documents', \App\Http\Controllers\HR\DocumentController::class);

        // Org Chart → redirects to departments hierarchy
        Route::get('orgchart', fn () => redirect()->route('hr.departments.index'))->name('orgchart.index');

        // Recruitment
        Route::prefix('recruitment')->name('recruitment.')->group(function () {
            Route::get('/', [\App\Http\Controllers\HR\RecruitmentController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\HR\RecruitmentController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\HR\RecruitmentController::class, 'store'])->name('store');
            Route::get('/applications/{application}', [\App\Http\Controllers\HR\RecruitmentController::class, 'showApplication'])->name('applications.show');
            Route::get('/applications/{application}/resume', [\App\Http\Controllers\HR\RecruitmentController::class, 'downloadResume'])->name('applications.resume');
            Route::get('/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'show'])->name('show');
            Route::get('/{recruitment}/edit', [\App\Http\Controllers\HR\RecruitmentController::class, 'edit'])->name('edit');
            Route::put('/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'update'])->name('update');
            Route::delete('/{recruitment}', [\App\Http\Controllers\HR\RecruitmentController::class, 'destroy'])->name('destroy');
            Route::post('/{recruitment}/publish', [\App\Http\Controllers\HR\RecruitmentController::class, 'publish'])->name('publish');
            Route::post('/{recruitment}/close', [\App\Http\Controllers\HR\RecruitmentController::class, 'close'])->name('close');
            Route::patch('/applications/{application}', [\App\Http\Controllers\HR\RecruitmentController::class, 'updateApplication'])->name('applications.update');
        });

        // Offboarding & exit interviews
        Route::prefix('offboarding')->name('offboarding.')->group(function () {
            Route::get('/', [\App\Http\Controllers\HR\OffboardingController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\HR\OffboardingController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\HR\OffboardingController::class, 'store'])->name('store');
            Route::get('/{offboarding}', [\App\Http\Controllers\HR\OffboardingController::class, 'show'])->name('show');
            Route::patch('/{offboarding}/checklist', [\App\Http\Controllers\HR\OffboardingController::class, 'updateChecklist'])->name('checklist');
            Route::patch('/{offboarding}/exit-interview', [\App\Http\Controllers\HR\OffboardingController::class, 'saveExitInterview'])->name('exit-interview');
        });

        // Payroll
        // Payroll CRUD routes
        Route::get('payroll', [\App\Http\Controllers\HR\PayrollController::class, 'index'])->name('payroll.index');
        Route::get('payroll/create', [\App\Http\Controllers\HR\PayrollController::class, 'create'])->name('payroll.create');
        Route::post('payroll', [\App\Http\Controllers\HR\PayrollController::class, 'store'])->name('payroll.store');
        Route::get('payroll/{payroll}', [\App\Http\Controllers\HR\PayrollController::class, 'show'])->name('payroll.show');
        Route::get('payroll/{payroll}/edit', [\App\Http\Controllers\HR\PayrollController::class, 'edit'])->name('payroll.edit');
        Route::put('payroll/{payroll}', [\App\Http\Controllers\HR\PayrollController::class, 'update'])->name('payroll.update');
        Route::delete('payroll/{payroll}', [\App\Http\Controllers\HR\PayrollController::class, 'destroy'])->name('payroll.destroy');

        // Custom payroll actions (if needed)
        Route::post('payroll/{payroll}/approve', [\App\Http\Controllers\HR\PayrollController::class, 'approve'])->name('payroll.approve');
        Route::post('payroll/{payroll}/reject', [\App\Http\Controllers\HR\PayrollController::class, 'reject'])->name('payroll.reject');

        // HR Setup
        Route::get('setup', [\App\Http\Controllers\HR\SetupController::class, 'index'])->name('setup.index');
        Route::put('setup/payroll', [\App\Http\Controllers\HR\SetupController::class, 'updatePayroll'])->name('setup.payroll');
        Route::put('setup/attendance', [\App\Http\Controllers\HR\SetupController::class, 'updateAttendance'])->name('setup.attendance');
        Route::put('setup/leave', [\App\Http\Controllers\HR\SetupController::class, 'updateLeave'])->name('setup.leave');
        Route::put('setup/performance', [\App\Http\Controllers\HR\SetupController::class, 'updatePerformance'])->name('setup.performance');
        Route::put('setup/training', [\App\Http\Controllers\HR\SetupController::class, 'updateTraining'])->name('setup.training');
        Route::put('setup/general', [\App\Http\Controllers\HR\SetupController::class, 'updateGeneral'])->name('setup.general');

        // Onboarding
        Route::resource('onboarding', \App\Http\Controllers\HR\OnboardingController::class);
        Route::patch('onboarding/{onboarding}/checklist', [\App\Http\Controllers\HR\OnboardingController::class, 'updateChecklist'])->name('onboarding.checklist');
    });

    // Support routes
    Route::prefix('support')->name('support.')->middleware('permission:view support')->group(function () {
        // Dashboard
        Route::get('/', [\App\Http\Controllers\Support\DashboardController::class, 'index'])->name('dashboard');

        // Tickets
        Route::resource('tickets', \App\Http\Controllers\Support\TicketController::class);
        Route::post('tickets/{ticket}/assign', [\App\Http\Controllers\Support\TicketController::class, 'assign'])->name('tickets.assign');
        Route::post('tickets/{ticket}/escalate', [\App\Http\Controllers\Support\TicketController::class, 'escalate'])->name('tickets.escalate');
        Route::post('tickets/{ticket}/close', [\App\Http\Controllers\Support\TicketController::class, 'close'])->name('tickets.close');
        Route::post('tickets/{ticket}/reopen', [\App\Http\Controllers\Support\TicketController::class, 'reopen'])->name('tickets.reopen');
        Route::post('tickets/{ticket}/comments', [\App\Http\Controllers\Support\TicketController::class, 'addComment'])->name('tickets.comments.store');
        Route::put('tickets/{ticket}/comments/{comment}', [\App\Http\Controllers\Support\TicketController::class, 'updateComment'])->name('tickets.comments.update');
        Route::patch('tickets/{ticket}/status', [\App\Http\Controllers\Support\TicketController::class, 'updateStatus'])->name('tickets.update-status');
        Route::post('tickets/ai-suggestions', [\App\Http\Controllers\Support\TicketController::class, 'aiSuggestions'])->name('tickets.ai-suggestions');

        // Knowledge Base
        Route::resource('knowledge-base', \App\Http\Controllers\Support\KnowledgeBaseController::class);
        Route::post('knowledge-base/{article}/publish', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'publish'])->name('knowledge-base.publish');
        Route::post('knowledge-base/{article}/unpublish', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'unpublish'])->name('knowledge-base.unpublish');
        Route::post('knowledge-base/{article}/helpful', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'markHelpful'])->name('knowledge-base.helpful');
        Route::post('knowledge-base/{article}/not-helpful', [\App\Http\Controllers\Support\KnowledgeBaseController::class, 'markNotHelpful'])->name('knowledge-base.not-helpful');

        // FAQ
        Route::resource('faq', \App\Http\Controllers\Support\FAQController::class);
        Route::post('faq/{faq}/publish', [\App\Http\Controllers\Support\FAQController::class, 'publish'])->name('faq.publish');
        Route::post('faq/{faq}/helpful', [\App\Http\Controllers\Support\FAQController::class, 'markHelpful'])->name('faq.helpful');
        Route::post('faq/{faq}/not-helpful', [\App\Http\Controllers\Support\FAQController::class, 'markNotHelpful'])->name('faq.not-helpful');

        // Bot knowledge (grounded AI context for guest + support bots)
        Route::get('bot-knowledge', [\App\Http\Controllers\Support\BotKnowledgeController::class, 'index'])->name('bot-knowledge.index');
        Route::put('bot-knowledge/settings', [\App\Http\Controllers\Support\BotKnowledgeController::class, 'updateSettings'])->name('bot-knowledge.settings');
        Route::post('bot-knowledge', [\App\Http\Controllers\Support\BotKnowledgeController::class, 'store'])->name('bot-knowledge.store');
        Route::put('bot-knowledge/{botKnowledge}', [\App\Http\Controllers\Support\BotKnowledgeController::class, 'update'])->name('bot-knowledge.update');
        Route::delete('bot-knowledge/{botKnowledge}', [\App\Http\Controllers\Support\BotKnowledgeController::class, 'destroy'])->name('bot-knowledge.destroy');

        // Categories
        Route::resource('categories', \App\Http\Controllers\Support\CategoryController::class);

        // Sources (Whitelist)
        Route::resource('ticket-sources', \App\Http\Controllers\Support\TicketSourceController::class)->parameters(['ticket-sources' => 'source']);
        Route::post('ticket-sources/{source}/generate-token', [\App\Http\Controllers\Support\TicketSourceController::class, 'generateToken'])->name('ticket-sources.generate-token');

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Support\AnalyticsController::class, 'index'])->name('dashboard');
            Route::get('/reports', [\App\Http\Controllers\Support\AnalyticsController::class, 'reports'])->name('reports');
            Route::post('/export', [\App\Http\Controllers\Support\AnalyticsController::class, 'export'])->name('export');
        });

        // SLA Management (Admin only)
        Route::middleware(['role:admin|super_user'])->prefix('sla')->name('sla.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Support\SLAController::class)->parameters(['' => 'sla']);
            Route::post('{sla}/activate', [\App\Http\Controllers\Support\SLAController::class, 'activate'])->name('activate');
        });

        // Automation Rules (Admin only)
        Route::middleware(['role:admin|super_user'])->prefix('automation')->name('automation.')->group(function () {
            Route::resource('/', \App\Http\Controllers\Support\AutomationController::class)->parameters(['' => 'automation']);
            Route::post('{automation}/toggle', [\App\Http\Controllers\Support\AutomationController::class, 'toggle'])->name('toggle');
            Route::post('{automation}/test', [\App\Http\Controllers\Support\AutomationController::class, 'test'])->name('test');
            Route::post('{automation}/duplicate', [\App\Http\Controllers\Support\AutomationController::class, 'duplicate'])->name('duplicate');
            Route::get('{automation}/logs', [\App\Http\Controllers\Support\AutomationController::class, 'logs'])->name('logs');
            Route::get('export', [\App\Http\Controllers\Support\AutomationController::class, 'export'])->name('export');
            Route::post('import', [\App\Http\Controllers\Support\AutomationController::class, 'import'])->name('import');
        });

        // AI Analysis Routes
        Route::prefix('ai')->name('ai.')->group(function () {
            Route::get('dashboard', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getInsightsDashboard'])->name('dashboard');
            Route::get('tickets/{ticket}/suggestions', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getTicketSuggestions'])->name('tickets.suggestions');
            Route::post('tickets/{ticket}/categorize', [\App\Http\Controllers\Support\AIAnalysisController::class, 'categorizeTicket'])->name('tickets.categorize');
            Route::post('tickets/{ticket}/priority', [\App\Http\Controllers\Support\AIAnalysisController::class, 'determinePriority'])->name('tickets.priority');
            Route::post('tickets/{ticket}/auto-response', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateAutoResponse'])->name('tickets.auto-response');
            Route::post('tickets/{ticket}/sentiment', [\App\Http\Controllers\Support\AIAnalysisController::class, 'analyzeSentiment'])->name('tickets.sentiment');
            Route::post('tickets/{ticket}/resolution-time', [\App\Http\Controllers\Support\AIAnalysisController::class, 'predictResolutionTime'])->name('tickets.resolution-time');
            Route::get('tickets/{ticket}/escalation', [\App\Http\Controllers\Support\AIAnalysisController::class, 'getEscalationRecommendations'])->name('tickets.escalation');
            Route::post('bulk-analyze', [\App\Http\Controllers\Support\AIAnalysisController::class, 'bulkAnalyze'])->name('bulk-analyze');
            Route::post('articles/suggestions', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateArticleSuggestions'])->name('articles.suggestions');
            Route::post('articles/{article}/improve', [\App\Http\Controllers\Support\AIAnalysisController::class, 'improveArticleContent'])->name('articles.improve');
            Route::post('faq/generate', [\App\Http\Controllers\Support\AIAnalysisController::class, 'generateFAQFromTickets'])->name('faq.generate');
            Route::post('search', [\App\Http\Controllers\Support\AIAnalysisController::class, 'smartSearch'])->name('search');
            Route::get('test', [\App\Http\Controllers\Support\AIAnalysisController::class, 'testAIService'])->name('test');
        });

        // AI Chatbot admin page (staff with support access)
        Route::prefix('chatbot')->name('chatbot.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Support\ChatbotController::class, 'index'])->name('support.chatbot.index');
        });
    });

    // AI Module Routes
    Route::prefix('ai')->name('ai.')->middleware(['auth', 'verified', 'role:admin|super_user|staff'])->group(function () {
        // Dashboard
        Route::get('dashboard', [\App\Http\Controllers\AI\DashboardController::class, 'index'])->name('dashboard');
        Route::get('dashboard/service-status', [\App\Http\Controllers\AI\DashboardController::class, 'serviceStatus'])->name('dashboard.service-status');
        Route::get('dashboard/analytics', [\App\Http\Controllers\AI\DashboardController::class, 'analytics'])->name('dashboard.analytics');
        Route::get('dashboard/quick-stats', [\App\Http\Controllers\AI\DashboardController::class, 'quickStats'])->name('dashboard.quick-stats');
        Route::post('dashboard/test-connection', [\App\Http\Controllers\AI\DashboardController::class, 'testConnection'])->name('dashboard.test-connection');

        // Services Management
        Route::resource('services', \App\Http\Controllers\AI\ServiceController::class);
        Route::post('services/{service}/test-connection', [\App\Http\Controllers\AI\ServiceController::class, 'testConnection'])->name('services.test-connection');
        Route::post('services/{service}/set-default', [\App\Http\Controllers\AI\ServiceController::class, 'setDefault'])->name('services.set-default');
        Route::post('services/{service}/toggle-status', [\App\Http\Controllers\AI\ServiceController::class, 'toggleStatus'])->name('services.toggle-status');

        // Models Management
        Route::resource('models', \App\Http\Controllers\AI\ModelController::class);
        Route::post('models/{model}/set-default', [\App\Http\Controllers\AI\ModelController::class, 'setDefault'])->name('models.set-default');
        Route::post('models/{model}/toggle-status', [\App\Http\Controllers\AI\ModelController::class, 'toggleStatus'])->name('models.toggle-status');

        // Conversations Management
        Route::resource('conversations', \App\Http\Controllers\AI\ConversationController::class);
        Route::post('conversations/{conversation}/archive', [\App\Http\Controllers\AI\ConversationController::class, 'archive'])->name('conversations.archive');
        Route::post('conversations/{conversation}/unarchive', [\App\Http\Controllers\AI\ConversationController::class, 'unarchive'])->name('conversations.unarchive');
        Route::post('conversations/{conversation}/messages', [\App\Http\Controllers\AI\ConversationController::class, 'addMessage'])->name('conversations.messages.store');
        Route::get('conversations/export', [\App\Http\Controllers\AI\ConversationController::class, 'export'])->name('conversations.export');
        Route::get('conversations/statistics', [\App\Http\Controllers\AI\ConversationController::class, 'statistics'])->name('conversations.statistics');
        Route::get('conversations/context-options', [\App\Http\Controllers\AI\ConversationController::class, 'getContextOptions'])->name('conversations.context-options');

        // Prompt Templates Management
        Route::resource('prompt-templates', \App\Http\Controllers\AI\PromptTemplateController::class);
        Route::post('prompt-templates/{template}/duplicate', [\App\Http\Controllers\AI\PromptTemplateController::class, 'duplicate'])->name('prompt-templates.duplicate');
        Route::post('prompt-templates/{template}/rate', [\App\Http\Controllers\AI\PromptTemplateController::class, 'rate'])->name('prompt-templates.rate');
        Route::post('prompt-templates/{template}/render', [\App\Http\Controllers\AI\PromptTemplateController::class, 'render'])->name('prompt-templates.render');

        // Analytics
        Route::get('analytics/dashboard', [\App\Http\Controllers\AI\AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
        Route::get('analytics/usage', [\App\Http\Controllers\AI\AnalyticsController::class, 'usage'])->name('analytics.usage');
        Route::get('analytics/costs', [\App\Http\Controllers\AI\AnalyticsController::class, 'costs'])->name('analytics.costs');
        Route::get('analytics/performance', [\App\Http\Controllers\AI\AnalyticsController::class, 'performance'])->name('analytics.performance');
        Route::get('analytics/export', [\App\Http\Controllers\AI\AnalyticsController::class, 'export'])->name('analytics.export');

        // Project Planning AI
        Route::prefix('project-planning')->name('project-planning.')->group(function () {
            Route::post('generate-milestones', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'generateMilestones'])->name('generate-milestones');
            Route::post('generate-tasks', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'generateTasks'])->name('generate-tasks');
            Route::post('estimate-timeline', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'estimateTimeline'])->name('estimate-timeline');
            Route::post('recommend-resources', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'recommendResources'])->name('recommend-resources');
            Route::post('prioritize-tasks', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'prioritizeTasks'])->name('prioritize-tasks');
            Route::post('generate-comprehensive-plan', [\App\Http\Controllers\AI\ProjectPlanningController::class, 'generateComprehensivePlan'])->name('generate-comprehensive-plan');
        });
    });

    // Customer Portal Routes
    Route::prefix('customer')->name('customer.')->middleware('customer')->group(function () {
        // Customer Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Customer\DashboardController::class, 'index'])->name('dashboard');

        // Customer Profile Management
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\ProfileController::class, 'show'])->name('show');
            Route::get('/edit', [\App\Http\Controllers\Customer\ProfileController::class, 'edit'])->name('edit');
            Route::put('/update', [\App\Http\Controllers\Customer\ProfileController::class, 'update'])->name('update');
            Route::put('/password', [\App\Http\Controllers\Customer\ProfileController::class, 'updatePassword'])->name('password.update');
            Route::put('/notifications', [\App\Http\Controllers\Customer\ProfileController::class, 'updateNotifications'])->name('notifications.update');
            Route::post('/photo', [\App\Http\Controllers\Customer\ProfileController::class, 'updatePhoto'])->name('photo.update');
            Route::delete('/photo', [\App\Http\Controllers\Customer\ProfileController::class, 'deletePhoto'])->name('photo.delete');
            Route::get('/delete-account', [\App\Http\Controllers\Customer\ProfileController::class, 'deleteAccount'])->name('delete-account');
            Route::delete('/delete-account', [\App\Http\Controllers\Customer\ProfileController::class, 'destroyAccount'])->name('destroy-account');
        });

        // Customer Projects
        Route::prefix('projects')->name('projects.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\ProjectController::class, 'index'])->name('index');
            Route::get('{project}', [\App\Http\Controllers\Customer\ProjectController::class, 'show'])->name('show');
            Route::get('{project}/tasks', [\App\Http\Controllers\Customer\ProjectController::class, 'tasks'])->name('tasks');
            Route::get('{project}/milestones', [\App\Http\Controllers\Customer\ProjectController::class, 'milestones'])->name('milestones');
            Route::get('{project}/time-tracking', [\App\Http\Controllers\Customer\ProjectController::class, 'timeTracking'])->name('time-tracking');
            Route::get('{project}/files', [\App\Http\Controllers\Customer\ProjectController::class, 'files'])->name('files');
            Route::get('{project}/attachments/{attachment}/download', [\App\Http\Controllers\Customer\ProjectController::class, 'downloadFile'])->name('attachments.download');
            Route::get('{project}/chat', [\App\Http\Controllers\Customer\ProjectController::class, 'chat'])->name('chat');
        });

        // Customer Finance
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\FinanceController::class, 'index'])->name('index');

            // Invoices
            Route::get('/invoices', [\App\Http\Controllers\Customer\FinanceController::class, 'invoices'])->name('invoices.index');
            Route::get('/invoices/{invoice}', [\App\Http\Controllers\Customer\FinanceController::class, 'showInvoice'])->name('invoices.show');
            Route::get('/invoices/{invoice}/download', [\App\Http\Controllers\Customer\FinanceController::class, 'downloadInvoice'])->name('invoices.download');
            Route::get('/invoices/{invoice}/print', [\App\Http\Controllers\Customer\FinanceController::class, 'printInvoice'])->name('invoices.print');
            Route::get('/invoices/{invoice}/pay', [\App\Http\Controllers\Customer\FinanceController::class, 'payInvoice'])->name('invoices.pay');
            Route::post('/invoices/{invoice}/pay', [\App\Http\Controllers\Customer\FinanceController::class, 'storeInvoicePayment'])->name('invoices.pay.store');

            // Payments
            Route::get('/payments', [\App\Http\Controllers\Customer\FinanceController::class, 'payments'])->name('payments');
            Route::get('/payments/{payment}', [\App\Http\Controllers\Customer\FinanceController::class, 'showPayment'])->name('payments.show');

            // Quotations
            Route::get('/quotations', [\App\Http\Controllers\Customer\FinanceController::class, 'quotations'])->name('quotations');
            Route::get('/quotations/{quotation}', [\App\Http\Controllers\Customer\FinanceController::class, 'showQuotation'])->name('quotations.show');
            Route::get('/quotations/{quotation}/print', [\App\Http\Controllers\Customer\FinanceController::class, 'printQuotation'])->name('quotations.print');
            Route::post('/quotations/{quotation}/accept', [\App\Http\Controllers\Customer\FinanceController::class, 'acceptQuotation'])->name('quotations.accept');
            Route::get('/quotations/{quotation}/download', [\App\Http\Controllers\Customer\FinanceController::class, 'downloadQuotation'])->name('quotations.download');
        });

        // Customer CRM
        Route::prefix('crm')->name('crm.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\CRMController::class, 'index'])->name('index');
            Route::get('/profile', [\App\Http\Controllers\Customer\CRMController::class, 'profile'])->name('profile');
            Route::put('/profile', [\App\Http\Controllers\Customer\CRMController::class, 'updateProfile'])->name('profile.update');
            Route::get('/communications', [\App\Http\Controllers\Customer\CRMController::class, 'communications'])->name('communications');
            Route::get('/communications/{communication}', [\App\Http\Controllers\Customer\CRMController::class, 'showCommunication'])->name('communications.show');
        });

        // Customer Conversations (Chat)
        Route::resource('conversations', App\Http\Controllers\Customer\ConversationController::class);
        Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\Customer\ConversationController::class, 'sendMessage'])->name('conversations.messages.store');
        Route::post('/conversations/{conversation}/typing', [\App\Http\Controllers\Customer\ConversationController::class, 'typing'])->name('conversations.typing');
        // GET route for fetching conversation messages (RESTful and polling)
        Route::get('/conversations/{conversation}/messages', [\App\Http\Controllers\Customer\ConversationController::class, 'getMessages']);        

        // Customer Communications

        Route::prefix('communications')->name('communications.')->group(function () {
            // Chat functionality (placed before catch-all)

            Route::get('/chats', [\App\Http\Controllers\Customer\CommunicationController::class, 'chats'])->name('chats');
            Route::get('/chats/create', [\App\Http\Controllers\Customer\CommunicationController::class, 'createChat'])->name('chats.create');
            Route::post('/chats', [\App\Http\Controllers\Customer\CommunicationController::class, 'storeChat'])->name('chats.store');
            Route::get('/chats/{conversation}', [\App\Http\Controllers\Customer\CommunicationController::class, 'showChat'])->name('chats.show');
            Route::post('/chats/{conversation}/messages', [\App\Http\Controllers\Customer\CommunicationController::class, 'sendMessage'])->name('chats.messages.store');

            Route::get('/', [\App\Http\Controllers\Customer\CommunicationController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Customer\CommunicationController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Customer\CommunicationController::class, 'store'])->name('store');
            Route::get('/{communication}', [\App\Http\Controllers\Customer\CommunicationController::class, 'show'])->name('show');
            Route::get('/{communication}/attachments/{attachment}/download', [\App\Http\Controllers\Customer\CommunicationController::class, 'downloadAttachment'])->name('attachments.download');
        });

        // Customer Support Portal
        Route::prefix('support')->name('support.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Customer\SupportController::class, 'create'])->name('create');
            Route::post('/store', [\App\Http\Controllers\Customer\SupportController::class, 'store'])->name('store');

            // Ticket management
            Route::prefix('tickets')->name('tickets.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'index'])->name('index');
                Route::get('{ticket}', [\App\Http\Controllers\Customer\SupportController::class, 'show'])->name('show');
                Route::post('{ticket}/comments', [\App\Http\Controllers\Customer\SupportController::class, 'addComment'])->name('comments.store');
                Route::post('{ticket}/close', [\App\Http\Controllers\Customer\SupportController::class, 'close'])->name('close');
                Route::post('{ticket}/reopen', [\App\Http\Controllers\Customer\SupportController::class, 'reopen'])->name('reopen');
                // Edit comment (customer)
                Route::put('{ticket}/comments/{comment}', [\App\Http\Controllers\Customer\SupportController::class, 'updateComment'])->name('comments.update');
            });

            // Knowledge Base
            Route::prefix('knowledge-base')->name('knowledge-base.')->group(function () {
                Route::get('/', [\App\Http\Controllers\Customer\SupportController::class, 'searchKnowledgeBase'])->name('index');
                Route::get('{article}', [\App\Http\Controllers\Customer\SupportController::class, 'viewArticle'])->name('show');
                Route::post('{article}/helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markArticleHelpful'])->name('helpful');
                Route::post('{article}/not-helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markArticleNotHelpful'])->name('not-helpful');
            });

            // FAQ
            Route::get('/faq', [\App\Http\Controllers\Customer\SupportController::class, 'viewFAQ'])->name('faq');
            Route::post('/faq/{faq}/helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markFAQHelpful'])->name('faq.helpful');
            Route::post('/faq/{faq}/not-helpful', [\App\Http\Controllers\Customer\SupportController::class, 'markFAQNotHelpful'])->name('faq.not-helpful');
        });
    });

    // Settings routes - Admin only
    Route::middleware(['role:admin|super_user'])->prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Settings\SettingsController::class, 'index'])->name('index');
        Route::get('/general', [\App\Http\Controllers\Settings\SettingsController::class, 'general'])->name('general');
        Route::put('/general', [\App\Http\Controllers\Settings\SettingsController::class, 'updateGeneral'])->name('general.update');
        Route::get('/users', [\App\Http\Controllers\Settings\SettingsController::class, 'users'])->name('users');
        Route::put('/users', [\App\Http\Controllers\Settings\SettingsController::class, 'updateUsers'])->name('users.update');
        Route::get('/notifications', [\App\Http\Controllers\Settings\SettingsController::class, 'notifications'])->name('notifications');
        Route::put('/notifications', [\App\Http\Controllers\Settings\SettingsController::class, 'updateNotifications'])->name('notifications.update');

        // Finance Settings
        Route::prefix('finance')->name('finance.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'index'])->name('index');

            // Payments (PawaPay)
            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/pawapay', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'pawaPayConfiguration'])->name('pawapay');
                Route::put('/pawapay', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'updatePawaPayConfiguration'])->name('pawapay.update');
                Route::post('/pawapay/test', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'testPawaPayConnection'])->name('pawapay.test');
            });

            // ZRA Settings
            Route::prefix('zra')->name('zra.')->group(function () {
                Route::get('/taxpayer', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'zraTaxpayerInformation'])->name('taxpayer');
                Route::put('/taxpayer', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'updateZraTaxpayerInformation'])->name('taxpayer.update');
                Route::post('/taxpayer/validate-tpin', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'validateZraTpin'])->name('taxpayer.validate-tpin');
            });

            // Security Settings
            Route::prefix('security')->name('security.')->group(function () {
                Route::get('/api', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'securityApiManagement'])->name('api');
                Route::put('/api', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'updateSecuritySettings'])->name('update');
                Route::post('/api-keys/generate', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'generateApiKey'])->name('api-keys.generate');
                Route::delete('/api-keys/{key}', [\App\Http\Controllers\Settings\FinanceSettingsController::class, 'revokeApiKey'])->name('api-keys.revoke');
            });
        });

        // Advanced Settings
        Route::get('/advanced', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'index'])->name('advanced');
        Route::put('/advanced/system', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateSystem'])->name('advanced.system.update');
        Route::put('/advanced/security', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateSecurity'])->name('advanced.security.update');
        Route::put('/advanced/performance', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updatePerformance'])->name('advanced.performance.update');
        Route::put('/advanced/integrations', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateIntegrations'])->name('advanced.integrations.update');
        Route::put('/advanced/notifications', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateNotifications'])->name('advanced.notifications.update');
        Route::put('/advanced/ai-services', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'updateAIServices'])->name('advanced.ai-services.update');
        Route::post('/advanced/test-connection', [\App\Http\Controllers\Settings\AdvancedSettingsController::class, 'testConnection'])->name('advanced.test-connection');

        // reCAPTCHA Settings
        Route::get('/recaptcha', [\App\Http\Controllers\Settings\RecaptchaController::class, 'index'])->name('recaptcha.index');
        Route::put('/recaptcha', [\App\Http\Controllers\Settings\RecaptchaController::class, 'update'])->name('recaptcha.update');
        Route::post('/recaptcha/verify', [\App\Http\Controllers\Settings\RecaptchaController::class, 'verify'])->name('recaptcha.verify');
        Route::post('/recaptcha/test', [\App\Http\Controllers\Settings\RecaptchaController::class, 'test'])->name('recaptcha.test');

        // System Maintenance
        Route::post('/maintenance/cache-clear', [\App\Http\Controllers\Settings\MaintenanceController::class, 'clearCache'])->name('maintenance.cache.clear');
        Route::post('/maintenance/logs-clear', [\App\Http\Controllers\Settings\MaintenanceController::class, 'clearLogs'])->name('maintenance.logs.clear');
        Route::post('/maintenance/backup', [\App\Http\Controllers\Settings\MaintenanceController::class, 'createBackup'])->name('maintenance.backup');
        Route::get('/maintenance/system-info', [\App\Http\Controllers\Settings\MaintenanceController::class, 'systemInfo'])->name('maintenance.system-info');
    });
});
