<?php

namespace App\Services\HR;

class OfficeLocationService
{
    /**
     * Whether geofence checks should block clock actions.
     */
    public function shouldEnforceGeofence(): bool
    {
        if (! (bool) HrSettings::attendance('require_clock_in_location', true)) {
            return false;
        }

        return ! app()->environment('local', 'development', 'dev', 'testing');
    }

    /**
     * Check if coordinates fall within any configured office area.
     */
    public function isWithinAllowedArea(float $latitude, float $longitude): bool
    {
        if (! $this->shouldEnforceGeofence()) {
            return true;
        }

        $locations = $this->getAllowedLocations();

        if (empty($locations)) {
            return false;
        }

        foreach ($locations as $location) {
            if ($this->isWithinRadius($latitude, $longitude, $location)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Coordinates used in development when geofencing is not enforced.
     */
    public function getMockCoordinates(): array
    {
        $office = $this->getPrimaryOffice();

        return [
            'latitude' => (float) $office['latitude'],
            'longitude' => (float) $office['longitude'],
        ];
    }

    /**
     * @return array<int, array{name: string, latitude: float, longitude: float, radius_meters: int}>
     */
    public function getAllowedLocations(): array
    {
        $configured = HrSettings::attendance('allowed_clock_locations', []);

        if (is_array($configured) && ! empty($configured)) {
            return array_values(array_filter(array_map(
                fn ($location) => $this->normalizeLocation($location),
                $configured
            )));
        }

        $primary = $this->getPrimaryOffice();

        if ($primary['latitude'] === 0.0 && $primary['longitude'] === 0.0) {
            return [];
        }

        return [$primary];
    }

    /**
     * @param  array<string, mixed>  $location
     */
    private function isWithinRadius(float $latitude, float $longitude, array $location): bool
    {
        $distance = $this->distanceInMeters(
            $latitude,
            $longitude,
            (float) $location['latitude'],
            (float) $location['longitude']
        );

        return $distance <= (int) $location['radius_meters'];
    }

    private function distanceInMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000;
        $latFrom = deg2rad($lat1);
        $latTo = deg2rad($lat2);
        $lngFrom = deg2rad($lng1);
        $lngTo = deg2rad($lng2);

        $latDelta = $latTo - $latFrom;
        $lngDelta = $lngTo - $lngFrom;

        $a = sin($latDelta / 2) ** 2
            + cos($latFrom) * cos($latTo) * sin($lngDelta / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * @return array{name: string, latitude: float, longitude: float, radius_meters: int}
     */
    private function getPrimaryOffice(): array
    {
        return [
            'name' => (string) HrSettings::attendance('office_name', 'Main Office'),
            'latitude' => (float) HrSettings::attendance('office_latitude', -15.3875),
            'longitude' => (float) HrSettings::attendance('office_longitude', 28.3228),
            'radius_meters' => (int) HrSettings::attendance('office_radius_meters', 150),
        ];
    }

    /**
     * @param  mixed  $location
     * @return array{name: string, latitude: float, longitude: float, radius_meters: int}|null
     */
    private function normalizeLocation(mixed $location): ?array
    {
        if (! is_array($location)) {
            return null;
        }

        $latitude = $location['latitude'] ?? null;
        $longitude = $location['longitude'] ?? null;

        if ($latitude === null || $longitude === null) {
            return null;
        }

        return [
            'name' => (string) ($location['name'] ?? 'Office'),
            'latitude' => (float) $latitude,
            'longitude' => (float) $longitude,
            'radius_meters' => (int) ($location['radius_meters'] ?? 150),
        ];
    }
}
