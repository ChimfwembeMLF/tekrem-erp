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
        return session('current_company_id');
    }
}
