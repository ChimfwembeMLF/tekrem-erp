<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

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
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

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
        $setting = static::firstOrNew(['key' => $key]);
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
        return static::where('key', $key)->exists();
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
