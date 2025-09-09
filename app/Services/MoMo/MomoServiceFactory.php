<?php

namespace App\Services\MoMo;

use App\Contracts\MomoProviderInterface;
use App\Models\Finance\MomoProvider;
use Illuminate\Support\Facades\Log;

class MomoServiceFactory
{
    /**
     * Provider service mappings.
     *
     * @var array
     */
    protected static array $providers = [
        'mtn' => MtnMomoService::class,
        'airtel' => AirtelMoneyService::class,
        'zamtel' => ZamtelMoneyService::class,
    ];

    /**
     * Create a MoMo service instance for the given provider.
     *
     * @param string $providerCode
     * @return MomoProviderInterface
     * @throws \InvalidArgumentException
     */
    public static function create(string $providerCode): MomoProviderInterface
    {
        $provider = MomoProvider::where('code', $providerCode)
            ->where('is_active', true)
            ->first();

        if (!$provider) {
            throw new \InvalidArgumentException("Provider '{$providerCode}' not found or inactive");
        }

        return static::createFromProvider($provider);
    }

    /**
     * Create a MoMo service instance from a provider model.
     *
     * @param MomoProvider $provider
     * @return MomoProviderInterface
     * @throws \InvalidArgumentException
     */
    public static function createFromProvider(MomoProvider $provider): MomoProviderInterface
    {
        if (!isset(static::$providers[$provider->code])) {
            throw new \InvalidArgumentException("No service implementation found for provider '{$provider->code}'");
        }

        $serviceClass = static::$providers[$provider->code];

        if (!class_exists($serviceClass)) {
            throw new \InvalidArgumentException("Service class '{$serviceClass}' does not exist");
        }

        $service = new $serviceClass($provider);

        if (!$service instanceof MomoProviderInterface) {
            throw new \InvalidArgumentException("Service class '{$serviceClass}' must implement MomoProviderInterface");
        }

        Log::info("Created MoMo service", [
            'provider' => $provider->code,
            'service_class' => $serviceClass,
            'is_sandbox' => $provider->is_sandbox,
        ]);

        return $service;
    }

    /**
     * Get all available providers.
     *
     * @return array
     */
    public static function getAvailableProviders(): array
    {
        return MomoProvider::where('is_active', true)
            ->get()
            ->map(function ($provider) {
                return [
                    'code' => $provider->code,
                    'name' => $provider->name,
                    'display_name' => $provider->display_name,
                    'currency' => $provider->currency,
                    'is_sandbox' => $provider->is_sandbox,
                    'min_amount' => $provider->min_transaction_amount,
                    'max_amount' => $provider->max_transaction_amount,
                ];
            })
            ->toArray();
    }

    /**
     * Get provider by phone number.
     *
     * @param string $phoneNumber
     * @return MomoProvider|null
     */
    public static function getProviderByPhoneNumber(string $phoneNumber): ?MomoProvider
    {
        $providers = MomoProvider::where('is_active', true)->get();

        foreach ($providers as $provider) {
            try {
                $service = static::createFromProvider($provider);
                if ($service->validatePhoneNumber($phoneNumber)) {
                    return $provider;
                }
            } catch (\Exception $e) {
                Log::warning("Failed to validate phone number with provider", [
                    'provider' => $provider->code,
                    'phone_number' => $phoneNumber,
                    'error' => $e->getMessage(),
                ]);
                continue;
            }
        }

        return null;
    }

    /**
     * Auto-detect provider from phone number and create service.
     *
     * @param string $phoneNumber
     * @return MomoProviderInterface|null
     */
    public static function createFromPhoneNumber(string $phoneNumber): ?MomoProviderInterface
    {
        $provider = static::getProviderByPhoneNumber($phoneNumber);

        if (!$provider) {
            return null;
        }

        return static::createFromProvider($provider);
    }

    /**
     * Check if a provider is supported.
     *
     * @param string $providerCode
     * @return bool
     */
    public static function isProviderSupported(string $providerCode): bool
    {
        return isset(static::$providers[$providerCode]);
    }

    /**
     * Register a new provider service.
     *
     * @param string $providerCode
     * @param string $serviceClass
     * @throws \InvalidArgumentException
     */
    public static function registerProvider(string $providerCode, string $serviceClass): void
    {
        if (!class_exists($serviceClass)) {
            throw new \InvalidArgumentException("Service class '{$serviceClass}' does not exist");
        }

        if (!is_subclass_of($serviceClass, MomoProviderInterface::class)) {
            throw new \InvalidArgumentException("Service class '{$serviceClass}' must implement MomoProviderInterface");
        }

        static::$providers[$providerCode] = $serviceClass;

        Log::info("Registered MoMo provider service", [
            'provider' => $providerCode,
            'service_class' => $serviceClass,
        ]);
    }

    /**
     * Get all registered provider codes.
     *
     * @return array
     */
    public static function getRegisteredProviders(): array
    {
        return array_keys(static::$providers);
    }

    /**
     * Test provider connectivity.
     *
     * @param string $providerCode
     * @return array
     */
    public static function testProvider(string $providerCode): array
    {
        try {
            $service = static::create($providerCode);
            $isAvailable = $service->isAvailable();

            return [
                'success' => true,
                'provider' => $providerCode,
                'available' => $isAvailable,
                'message' => $isAvailable ? 'Provider is available' : 'Provider is not available',
            ];
        } catch (\Exception $e) {
            Log::error("Provider test failed", [
                'provider' => $providerCode,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'provider' => $providerCode,
                'available' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Test all providers.
     *
     * @return array
     */
    public static function testAllProviders(): array
    {
        $results = [];
        $providers = MomoProvider::where('is_active', true)->get();

        foreach ($providers as $provider) {
            $results[] = static::testProvider($provider->code);
        }

        return $results;
    }
}
