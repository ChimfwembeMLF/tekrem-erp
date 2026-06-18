<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public static function forProduct(string $productName, float $onHand = 0, float $requested = 0): self
    {
        if ($onHand <= 0) {
            return new self("{$productName} is out of stock.");
        }

        if ($requested > 0) {
            return new self("{$productName} only has {$onHand} in stock (you requested {$requested}).");
        }

        return new self("Insufficient stock for {$productName}.");
    }
}
