<?php

namespace App\Services\Payments;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PawaPayApiClient
{
    public function __construct(
        protected PawaPayService $pawaPayService
    ) {
    }

    public function getAvailability(string $country = 'ZMB', ?string $operationType = null): array
    {
        $query = ['country' => $country];

        if ($operationType) {
            $query['operationType'] = $operationType;
        }

        return $this->request('get', '/availability', $query);
    }

    public function createDeposit(array $payload): array
    {
        return $this->request('post', '/deposits', $payload);
    }

    public function createPayout(array $payload): array
    {
        return $this->request('post', '/payouts', $payload);
    }

    public function createRefund(array $payload): array
    {
        return $this->request('post', '/refunds', $payload);
    }

    public function getDeposit(string $depositId): array
    {
        return $this->request('get', "/deposits/{$depositId}");
    }

    public function getPayout(string $payoutId): array
    {
        return $this->request('get', "/payouts/{$payoutId}");
    }

    public function getRefund(string $refundId): array
    {
        return $this->request('get', "/refunds/{$refundId}");
    }

    public function formatPhoneNumber(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '260')) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return '260' . substr($digits, 1);
        }

        // Local format without leading zero (8 or 9 digits, e.g. 76274499 or 971234567)
        if (strlen($digits) === 8 || strlen($digits) === 9) {
            return '260' . $digits;
        }

        return $digits;
    }

    public function isValidZambianMsisdn(string $phone): bool
    {
        $normalized = $this->formatPhoneNumber($phone);

        // Zambia: +260 followed by 8–9 digit subscriber number
        if (!preg_match('/^260\d{8,9}$/', $normalized)) {
            return false;
        }

        return $this->hasKnownMobilePrefix($normalized);
    }

    public function detectProvider(string $phone): ?string
    {
        $normalized = $this->formatPhoneNumber($phone);

        if (!preg_match('/^260\d{8,9}$/', $normalized)) {
            return null;
        }

        $prefix = substr($normalized, 3, 2);

        return match (true) {
            in_array($prefix, ['96', '97', '76'], true) => 'MTN_MOMO_ZMB',
            in_array($prefix, ['95', '75', '77', '57', '56'], true) => 'AIRTEL_OAPI_ZMB',
            in_array($prefix, ['99', '98'], true) => 'ZAMTEL_ZMB',
            default => null,
        };
    }

    protected function hasKnownMobilePrefix(string $normalized): bool
    {
        $prefix = substr($normalized, 3, 2);

        return in_array($prefix, ['96', '97', '76', '95', '75', '77', '57', '56', '99', '98'], true);
    }

    public function newPaymentId(): string
    {
        return (string) Str::uuid();
    }

    public function formatAmount(float|int|string $amount): string
    {
        $value = is_string($amount) ? (float) $amount : $amount;

        if (floor($value) == $value) {
            return (string) (int) $value;
        }

        return rtrim(rtrim(number_format($value, 2, '.', ''), '0'), '.');
    }

    public function buildParty(string $phone, string $provider): array
    {
        return [
            'type' => 'MMO',
            'accountDetails' => [
                'phoneNumber' => $this->formatPhoneNumber($phone),
                'provider' => $provider,
            ],
        ];
    }

    protected function request(string $method, string $path, array $payload = []): array
    {
        if (!$this->pawaPayService->isConfigured()) {
            return [
                'success' => false,
                'error' => 'PawaPay is not configured. Save credentials in Finance Settings.',
            ];
        }

        $config = $this->pawaPayService->getConfiguration();
        $url = $this->pawaPayService->getBaseUrl($config) . $path;

        try {
            $pendingRequest = Http::timeout($config['timeout'] ?? 30)
                ->withToken((string) $config['api_token'])
                ->acceptJson();

            $response = match (strtolower($method)) {
                'get' => $pendingRequest->get($url, $payload),
                'post' => $pendingRequest->post($url, $payload),
                default => throw new \InvalidArgumentException("Unsupported HTTP method [{$method}]"),
            };

            if ($config['enable_logging']) {
                Log::info('PawaPay API request', [
                    'method' => strtoupper($method),
                    'path' => $path,
                    'status' => $response->status(),
                ]);
            }

            $body = $response->json() ?? [];

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $body,
                    'http_status' => $response->status(),
                ];
            }

            return [
                'success' => false,
                'error' => $body['failureReason']['failureMessage']
                    ?? $body['message']
                    ?? "PawaPay API returned HTTP {$response->status()}",
                'data' => $body,
                'http_status' => $response->status(),
            ];
        } catch (\Throwable $e) {
            Log::error('PawaPay API request failed', [
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}
