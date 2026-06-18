<?php

namespace App\Services\HR;

use App\Models\Setting;

class HrSettings
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return Setting::get("hr.{$key}", $default);
    }

    public static function attendance(string $key, mixed $default = null): mixed
    {
        return Setting::get("hr.attendance.{$key}", $default);
    }

    public static function payroll(string $key, mixed $default = null): mixed
    {
        return Setting::get("hr.payroll.{$key}", $default);
    }

    public static function workHoursPerDay(): float
    {
        return (float) self::attendance('work_hours_per_day', 8);
    }

    public static function defaultStartTime(): string
    {
        return (string) self::attendance('default_start_time', '09:00');
    }

    public static function gracePeriodMinutes(): int
    {
        return (int) self::attendance('grace_period_minutes', 15);
    }

    public static function lateThresholdMinutes(): int
    {
        return (int) self::attendance('late_threshold_minutes', 30);
    }

    public static function overtimeMultiplier(): float
    {
        return (float) self::payroll('overtime_rate_multiplier', 1.5);
    }

    public static function workDaysPerMonth(): int
    {
        return (int) self::attendance('work_days_per_week', 5) * 4;
    }
}
