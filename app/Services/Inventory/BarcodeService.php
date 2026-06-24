<?php

namespace App\Services\Inventory;

use App\Models\Inventory\Product;

class BarcodeService
{
    /**
     * Generate a unique EAN-13 style numeric barcode (890 prefix for internal use).
     */
    public function generateUnique(): string
    {
        for ($attempt = 0; $attempt < 50; $attempt++) {
            $candidate = $this->generateEan13();

            if (! Product::where('barcode', $candidate)->exists()) {
                return $candidate;
            }
        }

        throw new \RuntimeException('Unable to generate a unique barcode.');
    }

    public function generateEan13(?string $nineDigitBody = null): string
    {
        $body = $nineDigitBody ?? (string) random_int(0, 999_999_999);
        $body = str_pad($body, 9, '0', STR_PAD_LEFT);
        $base = '890' . $body;

        return $base . $this->ean13CheckDigit($base);
    }

    public function ean13CheckDigit(string $twelveDigits): int
    {
        $digits = str_split($twelveDigits);
        $sum = 0;

        foreach ($digits as $index => $digit) {
            $sum += (int) $digit * ($index % 2 === 0 ? 1 : 3);
        }

        return (10 - ($sum % 10)) % 10;
    }

    public function isValidEan13(string $barcode): bool
    {
        if (! preg_match('/^\d{13}$/', $barcode)) {
            return false;
        }

        $check = (int) substr($barcode, -1);
        $expected = $this->ean13CheckDigit(substr($barcode, 0, 12));

        return $check === $expected;
    }
}
