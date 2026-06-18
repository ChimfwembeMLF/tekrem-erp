<?php

namespace App\Services\Payments;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PawaPayService
{
    public const DEFAULT_SANDBOX_URL = 'https://api.sandbox.pawapay.io/v2';

    public const DEFAULT_PRODUCTION_URL = 'https://api.pawapay.io/v2';

    public function getConfiguration(): array
    {
        $env = $this->value('pawapay.env', 'sandbox');

        return [
            'env' => $env,
            'api_token' => $this->resolveApiToken(),
            'api_token_set' => $this->hasApiToken(),
            'base_url_sandbox' => $this->value('pawapay.base_url_sandbox', self::DEFAULT_SANDBOX_URL),
            'base_url_prod' => $this->value('pawapay.base_url_prod', self::DEFAULT_PRODUCTION_URL),
            'callback_url' => $this->value('pawapay.callback_url', $this->defaultCallbackUrl()),
            'timeout' => (int) $this->value('pawapay.timeout', 30),
            'enable_logging' => $this->toBool($this->value('pawapay.enable_logging', true)),
            'private_key' => $this->value('pawapay.private_key', ''),
            'private_key_set' => $this->hasSecret('pawapay.private_key'),
            'public_key' => $this->value('pawapay.public_key', ''),
            'public_key_set' => $this->hasSecret('pawapay.public_key'),
            'public_key_id' => $this->value('pawapay.public_key_id', ''),
            'transaction_id_prefix' => $this->getTransactionIdPrefix(),
        ];
    }

    public function getPublicConfiguration(): array
    {
        $config = $this->getConfiguration();

        return [
            'env' => $config['env'],
            'configured' => $config['api_token_set'],
            'stored_in_database' => Setting::has('pawapay.api_token'),
            'provider_label' => 'PawaPay',
            'base_url' => $this->getBaseUrl($config),
            'base_url_sandbox' => $config['base_url_sandbox'],
            'base_url_prod' => $config['base_url_prod'],
            'callback_url' => $config['callback_url'],
            'timeout' => $config['timeout'],
            'enable_logging' => $config['enable_logging'],
            'public_key_id' => $config['public_key_id'],
            'private_key_set' => $config['private_key_set'],
            'public_key_set' => $config['public_key_set'],
            'api_token_masked' => $this->maskSecret($config['api_token']),
            'transaction_id_prefix' => $config['transaction_id_prefix'],
        ];
    }

    public function getTransactionIdPrefix(): string
    {
        $prefix = strtoupper(trim((string) $this->value('pawapay.transaction_id_prefix', 'MOMO')));
        $prefix = preg_replace('/[^A-Z0-9_-]/', '', $prefix) ?? '';

        return $prefix !== '' ? $prefix : 'MOMO';
    }

    public function formatClientReference(string $reference): string
    {
        $reference = trim($reference);

        if ($reference === '') {
            return $reference;
        }

        $prefix = $this->getTransactionIdPrefix();

        if ($prefix === '') {
            return $reference;
        }

        if (str_starts_with(strtoupper($reference), $prefix . '-')) {
            return $reference;
        }

        return $prefix . '-' . ltrim($reference, '-');
    }

    public function isConfigured(): bool
    {
        return $this->hasApiToken();
    }

    public function getBaseUrl(?array $config = null): string
    {
        $config ??= $this->getConfiguration();

        $url = $config['env'] === 'production'
            ? $config['base_url_prod']
            : $config['base_url_sandbox'];

        return rtrim($url, '/');
    }

    public function saveConfiguration(array $data): void
    {
        $meta = ['group' => 'payments', 'is_public' => false];

        $this->persist('pawapay.env', $data['env'], 'PawaPay Environment', 'select', $meta);
        $this->persist('pawapay.base_url_sandbox', $data['base_url_sandbox'] ?? '', 'PawaPay Sandbox URL', 'url', $meta);
        $this->persist('pawapay.base_url_prod', $data['base_url_prod'] ?? '', 'PawaPay Production URL', 'url', $meta);
        $this->persist('pawapay.callback_url', $data['callback_url'] ?? $this->defaultCallbackUrl(), 'PawaPay Callback URL', 'url', $meta);
        $this->persist('pawapay.timeout', $data['timeout'] ?? 30, 'PawaPay Timeout', 'integer', $meta);
        $this->persist('pawapay.enable_logging', $data['enable_logging'] ?? true, 'PawaPay Logging', 'boolean', $meta);
        $this->persist('pawapay.public_key_id', $data['public_key_id'] ?? '', 'PawaPay Public Key ID', 'string', $meta);
        $this->persist(
            'pawapay.transaction_id_prefix',
            $this->sanitizeTransactionIdPrefix($data['transaction_id_prefix'] ?? 'MOMO'),
            'PawaPay Transaction ID Prefix',
            'string',
            $meta
        );

        if (!empty($data['api_token'])) {
            $this->persist('pawapay.api_token', $data['api_token'], 'PawaPay API Token', 'password', $meta);
        }

        if (!empty($data['private_key'])) {
            $this->persist('pawapay.private_key', $data['private_key'], 'PawaPay Private Key', 'password', $meta);
        }

        if (!empty($data['public_key'])) {
            $this->persist('pawapay.public_key', $data['public_key'], 'PawaPay Public Key', 'password', $meta);
        }
    }

    public function testConnection(?array $overrides = null): array
    {
        $config = array_merge($this->getConfiguration(), $overrides ?? []);
        $token = $config['api_token'] ?? null;

        if (empty($token)) {
            return [
                'success' => false,
                'message' => 'PawaPay API token is not configured in settings',
            ];
        }

        $baseUrl = $this->getBaseUrl($config);
        $startedAt = microtime(true);

        try {
            $response = Http::timeout($config['timeout'] ?? 30)
                ->withToken($token)
                ->acceptJson()
                ->get("{$baseUrl}/availability", [
                    'country' => 'ZMB',
                    'operationType' => 'DEPOSIT',
                ]);

            $responseTime = round((microtime(true) - $startedAt) * 1000);

            if ($response->successful()) {
                $providers = collect($response->json())
                    ->flatMap(fn ($entry) => $entry['providers'] ?? [])
                    ->pluck('provider')
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'success' => true,
                    'message' => 'Connected to PawaPay successfully',
                    'response_time' => $responseTime,
                    'providers' => $providers,
                ];
            }

            return [
                'success' => false,
                'message' => $response->json('message') ?? "PawaPay API returned HTTP {$response->status()}",
                'response_time' => $responseTime,
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ];
        }
    }

    protected function resolveApiToken(): ?string
    {
        if (Setting::has('pawapay.api_token')) {
            $token = Setting::get('pawapay.api_token');

            return is_string($token) && $token !== '' ? $token : null;
        }

        $envToken = config('services.pawapay.api_token');

        return is_string($envToken) && $envToken !== '' ? $envToken : null;
    }

    protected function hasApiToken(): bool
    {
        return !empty($this->resolveApiToken());
    }

    protected function hasSecret(string $key): bool
    {
        if (!Setting::has($key)) {
            return false;
        }

        $value = Setting::get($key);

        return is_string($value) && $value !== '';
    }

    protected function value(string $key, mixed $default = null): mixed
    {
        if (!Setting::has($key)) {
            return $default;
        }

        $value = Setting::get($key);

        if ($value === null || $value === '') {
            return $default;
        }

        return $value;
    }

    protected function defaultCallbackUrl(): string
    {
        return rtrim((string) config('app.url'), '/') . '/api/pawapay/callback';
    }

    protected function persist(string $key, mixed $value, string $label, string $type, array $meta): void
    {
        Setting::set($key, $value, array_merge($meta, [
            'label' => $label,
            'type' => $type,
        ]));
    }

    protected function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array((string) $value, ['1', 'true', 'yes', 'on'], true);
    }

    protected function maskSecret(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        if (strlen($value) <= 8) {
            return Str::repeat('•', strlen($value));
        }

        return substr($value, 0, 4) . Str::repeat('•', max(strlen($value) - 8, 4)) . substr($value, -4);
    }

    protected function sanitizeTransactionIdPrefix(?string $prefix): string
    {
        $normalized = strtoupper(trim((string) $prefix));
        $normalized = preg_replace('/[^A-Z0-9_-]/', '', $normalized) ?? '';

        return $normalized !== '' ? $normalized : 'MOMO';
    }
}
