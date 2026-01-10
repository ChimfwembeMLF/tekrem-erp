<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        //$this->authorize('view settings');

        // Get all global settings
        $globalSettings = Setting::whereNull('company_id')
            ->orderBy('group')->orderBy('order')->get();
        // Get all company-specific settings
        $companySettings = Setting::where('company_id', currentCompanyId())
            ->orderBy('group')->orderBy('order')->get();

        // Merge: use company value if set, otherwise fallback to global
        $settings = $globalSettings->map(function ($global) use ($companySettings) {
            $company = $companySettings->firstWhere('key', $global->key);
            $value = $company ? $company->value : $global->value;
            $setting = clone $global;
            $setting->value = $value;
            $setting->company_id = $company ? $company->company_id : null;
            return $setting;
        });

        // Add any company-only settings not present in global
        $companyOnly = $companySettings->filter(function ($company) use ($globalSettings) {
            return !$globalSettings->contains('key', $company->key);
        });
        $settings = $settings->concat($companyOnly)->sortBy(['group', 'order']);

        $groups = $settings->pluck('group')->unique();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'groups' => $groups,
        ]);
    }

    /**
     * Update the specified settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        //$this->authorize('edit settings');

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::set('company:' . currentCompanyId() . ':' . $setting['key'], $setting['value']);
        }

        // Clear the settings cache for this company
        Cache::forget('settings:' . currentCompanyId());

        return redirect()->route('admin.settings.index')->with('success', 'Settings updated successfully.');
    }
}
