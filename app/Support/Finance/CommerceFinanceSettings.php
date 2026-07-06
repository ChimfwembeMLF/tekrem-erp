<?php

namespace App\Support\Finance;

use App\Models\Setting;

class CommerceFinanceSettings
{
    public static function autoPostEnabled(): bool
    {
        return (bool) Setting::get('finance.commerce.auto_post_to_finance', false);
    }

    public static function revenueAccountId(): ?int
    {
        $value = Setting::get('finance.commerce.revenue_account_id');

        return $value !== null && $value !== '' ? (int) $value : null;
    }

    public static function vatAccountId(): ?int
    {
        $value = Setting::get('finance.commerce.vat_account_id');

        return $value !== null && $value !== '' ? (int) $value : null;
    }

    public static function cashAccountId(): ?int
    {
        $value = Setting::get('finance.commerce.cash_account_id');

        return $value !== null && $value !== '' ? (int) $value : null;
    }

    public static function walkInClientId(): ?int
    {
        $value = Setting::get('finance.commerce.walk_in_client_id');

        return $value !== null && $value !== '' ? (int) $value : null;
    }

    public static function autoZraEnabled(): bool
    {
        return (bool) Setting::get('finance.commerce.auto_zra', false);
    }

    public static function zraAutoApprove(): bool
    {
        return (bool) Setting::get('finance.commerce.zra_auto_approve', false);
    }

    public static function isConfigured(): bool
    {
        return self::autoPostEnabled()
            && self::revenueAccountId() !== null
            && self::cashAccountId() !== null;
    }

    /** @return array<string, mixed> */
    public static function toArray(): array
    {
        return [
            'auto_post_to_finance' => self::autoPostEnabled(),
            'revenue_account_id' => self::revenueAccountId(),
            'vat_account_id' => self::vatAccountId(),
            'cash_account_id' => self::cashAccountId(),
            'walk_in_client_id' => self::walkInClientId(),
            'auto_zra' => self::autoZraEnabled(),
            'zra_auto_approve' => self::zraAutoApprove(),
            'is_configured' => self::isConfigured(),
        ];
    }
}
