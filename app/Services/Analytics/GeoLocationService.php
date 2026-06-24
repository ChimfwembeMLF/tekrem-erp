<?php

namespace App\Services\Analytics;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoLocationService
{
    public function lookup(?string $ipAddress): ?array
    {
        if (!$ipAddress || !$this->isPublicIp($ipAddress)) {
            return null;
        }

        $cacheKey = 'geo_ip:' . $ipAddress;

        return Cache::remember($cacheKey, config('analytics.geo_cache_ttl'), function () use ($ipAddress) {
            try {
                $response = Http::timeout(3)
                    ->get("http://ip-api.com/json/{$ipAddress}", [
                        'fields' => 'status,message,country,countryCode,regionName,city,lat,lon',
                    ]);

                if (!$response->successful()) {
                    return null;
                }

                $data = $response->json();

                if (($data['status'] ?? '') !== 'success') {
                    return null;
                }

                return [
                    'country_code' => $data['countryCode'] ?? null,
                    'country_name' => $data['country'] ?? null,
                    'region' => $data['regionName'] ?? null,
                    'city' => $data['city'] ?? null,
                    'latitude' => isset($data['lat']) ? (float) $data['lat'] : null,
                    'longitude' => isset($data['lon']) ? (float) $data['lon'] : null,
                ];
            } catch (\Throwable $exception) {
                Log::debug('Geo lookup failed', [
                    'ip' => $ipAddress,
                    'message' => $exception->getMessage(),
                ]);

                return null;
            }
        });
    }

    private function isPublicIp(string $ip): bool
    {
        if (in_array($ip, ['127.0.0.1', '::1'], true)) {
            return false;
        }

        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) !== false;
    }
}
