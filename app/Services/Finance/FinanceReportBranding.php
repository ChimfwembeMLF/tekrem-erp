<?php

namespace App\Services\Finance;

class FinanceReportBranding
{
    public function company(): array
    {
        return [
            'name' => config('company.name', config('app.name')),
            'tagline' => config('company.tagline', 'INNOVATION CREATIVITY VALUE'),
            'address' => config('company.address', ''),
            'city' => config('company.city', ''),
            'postal_code' => config('company.postal_code', ''),
            'country' => config('company.country', ''),
            'phone' => config('company.phone', ''),
            'email' => config('company.email', ''),
            'website' => config('company.website', ''),
            'tax_number' => config('company.tax_number', ''),
            'currency' => config('company.defaults.currency', 'ZMW'),
        ];
    }

    public function logoPath(): ?string
    {
        foreach ([
            public_path('logo-blue.png'),
            public_path('Tekrem-logo.png'),
            public_path('images/logo-blue.png'),
        ] as $path) {
            if (is_file($path)) {
                return $path;
            }
        }

        $configured = config('company.logo');
        if (is_string($configured) && is_file($configured)) {
            return $configured;
        }

        return null;
    }

    public function logoBase64(): ?string
    {
        $path = $this->logoPath();

        if (!$path) {
            return null;
        }

        $mime = match (strtolower(pathinfo($path, PATHINFO_EXTENSION))) {
            'jpg', 'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => 'image/png',
        };

        return 'data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($path));
    }

    public function footerLines(): array
    {
        $company = $this->company();

        return array_values(array_filter([
            $company['name'],
            trim($company['address'] . ($company['city'] ? ', ' . $company['city'] : '') . ($company['country'] ? ', ' . $company['country'] : '')),
            $company['phone'] ? 'Tel: ' . $company['phone'] : null,
            $company['email'] ? 'Email: ' . $company['email'] : null,
            $company['website'] ? 'Web: ' . $company['website'] : null,
            $company['tax_number'] ? 'TPIN: ' . $company['tax_number'] : null,
        ]));
    }
}
