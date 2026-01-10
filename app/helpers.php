<?php

if (!function_exists('currentCompanyId')) {
    /**
     * Get the current company ID from the service container or session.
     *
     * @return int|null
     */
    function currentCompanyId()
    {
        $company = app()->bound('currentCompany') ? app('currentCompany') : null;
        if ($company && isset($company->id)) {
            return $company->id;
        }
        // Fallback to session
        $sessionId = session('current_company_id');
        if ($sessionId) {
            return $sessionId;
        }
        // Fallback to main company ID from config
        return config('company.main_company_id');
    }
}
