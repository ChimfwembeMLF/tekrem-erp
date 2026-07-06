<?php

namespace App\Models;

use App\Support\Organizations\OrganizationContext;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Schema;

class Setting extends Model
{
    use HasFactory;

    /**
     * Settings stored encrypted at rest.
     *
     * @var array<int, string>
     */
    protected static array $encryptedKeys = [
        'pawapay.api_token',
        'pawapay.private_key',
        'pawapay.public_key',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'options',
        'label',
        'description',
        'is_public',
        'order',
        'organization_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_public' => 'boolean',
        'order' => 'integer',
        'options' => 'array',
    ];

    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public static function get(string $key, $default = null)
    {
        $organizationId = static::resolveOrganizationId();

        $setting = null;

        if ($organizationId) {
            $setting = static::query()
                ->where('key', $key)
                ->where('organization_id', $organizationId)
                ->first();
        }

        if (! $setting) {
            $setting = static::query()
                ->where('key', $key)
                ->whereNull('organization_id')
                ->first();
        }

        if (!$setting) {
            return $default;
        }

        return static::castValue($key, $setting->value);
    }

    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @param array<string, mixed> $attributes
     * @return void
     */
    public static function set(string $key, $value, array $attributes = []): void
    {
        $organizationId = $attributes['organization_id']
            ?? static::resolveOrganizationId();

        unset($attributes['organization_id']);

        $setting = static::firstOrNew([
            'key' => $key,
            'organization_id' => $organizationId,
        ]);
        $setting->value = static::prepareStoredValue($key, $value);

        foreach (['group', 'type', 'label', 'description', 'is_public', 'order'] as $attribute) {
            if (array_key_exists($attribute, $attributes)) {
                $setting->{$attribute} = $attributes[$attribute];
            }
        }

        if (!$setting->group) {
            $setting->group = 'general';
        }

        $setting->save();
    }

    public static function has(string $key): bool
    {
        $organizationId = static::resolveOrganizationId();

        if ($organizationId && static::query()->where('key', $key)->where('organization_id', $organizationId)->exists()) {
            return true;
        }

        return static::hasGlobal($key);
    }

    public static function getGlobal(string $key, mixed $default = null): mixed
    {
        $setting = static::query()
            ->where('key', $key)
            ->whereNull('organization_id')
            ->first();

        if (! $setting) {
            return $default;
        }

        return static::castValue($key, $setting->value);
    }

    public static function hasGlobal(string $key): bool
    {
        return static::query()->where('key', $key)->whereNull('organization_id')->exists();
    }

    public static function setGlobal(string $key, mixed $value, array $attributes = []): void
    {
        static::set($key, $value, array_merge($attributes, ['organization_id' => null]));
    }

    protected static function resolveOrganizationId(): ?int
    {
        if (! Schema::hasTable('settings') || ! Schema::hasColumn('settings', 'organization_id')) {
            return null;
        }

        if (! app()->bound(OrganizationContext::class)) {
            return null;
        }

        $context = app(OrganizationContext::class);

        return $context->check() ? $context->id() : null;
    }

    protected static function prepareStoredValue(string $key, mixed $value): string
    {
        if (is_bool($value)) {
            $value = $value ? '1' : '0';
        }

        if ($value === null) {
            return '';
        }

        $stringValue = (string) $value;

        if ($stringValue === '' || !in_array($key, static::$encryptedKeys, true)) {
            return $stringValue;
        }

        return Crypt::encryptString($stringValue);
    }

    protected static function castValue(string $key, mixed $value): mixed
    {
        if ($value === null || $value === '') {
            return $value;
        }

        if (in_array($key, static::$encryptedKeys, true)) {
            try {
                return Crypt::decryptString((string) $value);
            } catch (\Throwable) {
                return $value;
            }
        }

        return $value;
    }
}
