<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationSettingsController extends Controller
{
    /**
     * Show the organization settings form.
     */
    public function edit(Request $request): Response
    {
        $organization = $request->user()->currentOrganization;
        
        if (!$organization) {
            abort(404, 'No organization found.');
        }

        $openAiKey = \App\Models\Setting::get('integration.openai.api_key', '', ['organization_id' => $organization->id]);
        $anthropicKey = \App\Models\Setting::get('integration.anthropic.api_key', '', ['organization_id' => $organization->id]);

        return Inertia::render('Settings/Organization', [
            'organization' => $organization,
            'canUseCustomDomain' => $organization->canUseCustomDomain(),
            'aiSettings' => [
                'openai_api_key' => $openAiKey,
                'anthropic_api_key' => $anthropicKey,
            ],
            'hasAiModule' => $organization->hasModule('ai'),
        ]);
    }

    /**
     * Update the organization settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $organization = $request->user()->currentOrganization;
        
        if (!$organization) {
            abort(404, 'No organization found.');
        }

        $canUseCustomDomain = $organization->canUseCustomDomain();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:500',
            'openai_api_key' => 'nullable|string|max:255',
            'anthropic_api_key' => 'nullable|string|max:255',
        ];

        if ($canUseCustomDomain) {
            $rules['custom_domain'] = 'nullable|string|max:255|unique:organizations,custom_domain,' . $organization->id;
        }

        $validated = $request->validate($rules);

        // Save AI settings
        if ($organization->hasModule('ai')) {
            \App\Models\Setting::set('integration.openai.api_key', $validated['openai_api_key'] ?? '', ['organization_id' => $organization->id]);
            \App\Models\Setting::set('integration.anthropic.api_key', $validated['anthropic_api_key'] ?? '', ['organization_id' => $organization->id]);
        }
        
        unset($validated['openai_api_key'], $validated['anthropic_api_key']);

        // If they can't use custom domains, ensure they can't inject it manually
        if (!$canUseCustomDomain) {
            unset($validated['custom_domain']);
        }

        $organization->update($validated);

        return back()->with('success', 'Organization settings updated successfully.');
    }
}
