<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Setting;

class IpWhitelistMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Get allowed IPs from settings (company-aware)
        $companyId = currentCompanyId();
        $allowedIps = Setting::getForCompany($companyId, 'security.api.allowed_ip_addresses', []);
        $enabled = Setting::getForCompany($companyId, 'security.api.enable_ip_whitelisting', false);

        if ($enabled && is_array($allowedIps) && count($allowedIps) > 0) {
            $clientIp = $request->ip();
            if (!in_array($clientIp, $allowedIps)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied: Your IP address is not whitelisted.'
                ], 403);
            }
        }

        return $next($request);
    }
}
