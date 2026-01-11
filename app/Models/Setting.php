<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model

{
    use HasFactory;

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
        'company_id',
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


    /**
     * Set a setting value by key for a specific company.
     *
     * @param int $companyId
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public static function setForCompany($companyId, $key, $value): void
    {
        $setting = static::firstOrNew([
            'company_id' => $companyId,
            'key' => $key,
        ]);
        // Serialize arrays/objects to JSON before saving
        if (is_array($value) || is_object($value)) {
            $setting->value = json_encode($value);
        } else {
            $setting->value = $value;
        }
        $setting->save();
    }

    
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $setting->value;
    }

    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @return void
     */
    public static function set(string $key, $value): void
    {
        $setting = static::firstOrNew(['key' => $key]);
        // Serialize arrays/objects to JSON before saving
        if (is_array($value) || is_object($value)) {
            $setting->value = json_encode($value);
        } else {
            $setting->value = $value;
        }
        $setting->save();
    }


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Get a setting value by key for a specific company.
     *
     * @param int $companyId
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getForCompany($companyId, $key, $default = null)
    {
        $setting = static::where('company_id', $companyId)->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }
}
