<?php

if (!function_exists('currentCompanyId')) {
    /**
     * Get or set the current company ID in the session or service container.
     *
     * @param int|null $id
     * @return int|null
     */
    function currentCompanyId($id = null)
    {
        if (!is_null($id)) {
            session(['current_company_id' => $id]);
        }
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
