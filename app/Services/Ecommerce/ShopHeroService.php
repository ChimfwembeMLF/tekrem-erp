<?php

namespace App\Services\Ecommerce;

use App\Models\Setting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ShopHeroService
{
    public const SETTING_KEY = 'shop.hero_background';

    /** @return array<string, mixed> */
    public function requirements(): array
    {
        return config('shop.hero', []);
    }

    public function url(): ?string
    {
        $path = Setting::get(self::SETTING_KEY);

        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    /** @return array{background_url: ?string, requirements: array<string, mixed>} */
    public function forFrontend(): array
    {
        $requirements = $this->requirements();

        return [
            'background_url' => $this->url(),
            'requirements' => [
                'min_width' => $requirements['min_width'],
                'min_height' => $requirements['min_height'],
                'recommended_width' => $requirements['recommended_width'],
                'recommended_height' => $requirements['recommended_height'],
                'recommended_aspect_ratio' => $requirements['recommended_aspect_ratio'],
            ],
        ];
    }

    public function store(UploadedFile $file): string
    {
        $this->assertValidImage($file);

        $previous = Setting::get(self::SETTING_KEY);
        if ($previous) {
            Storage::disk('public')->delete($previous);
        }

        $path = $file->store('shop/hero', 'public');

        Setting::set(self::SETTING_KEY, $path, [
            'group' => 'shop',
            'type' => 'file',
            'label' => 'Shop hero background',
            'description' => 'Background image for the storefront featured hero carousel.',
            'is_public' => false,
            'order' => 1,
        ]);

        Cache::forget('settings');

        return $path;
    }

    public function remove(): void
    {
        $path = Setting::get(self::SETTING_KEY);

        if ($path) {
            Storage::disk('public')->delete($path);
        }

        Setting::set(self::SETTING_KEY, '', [
            'group' => 'shop',
            'type' => 'file',
            'label' => 'Shop hero background',
            'description' => 'Background image for the storefront featured hero carousel.',
            'is_public' => false,
            'order' => 1,
        ]);

        Cache::forget('settings');
    }

    public function assertValidImage(UploadedFile $file): void
    {
        $config = $this->requirements();
        $maxKb = (int) ($config['max_file_size_kb'] ?? 5120);
        $allowed = $config['allowed_mimes'] ?? ['jpg', 'jpeg', 'png', 'webp'];

        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, $allowed, true)) {
            throw ValidationException::withMessages([
                'hero_background' => 'Image must be '.implode(', ', $allowed).'.',
            ]);
        }

        if ($file->getSize() > $maxKb * 1024) {
            throw ValidationException::withMessages([
                'hero_background' => "Image must be smaller than {$maxKb} KB.",
            ]);
        }

        $size = @getimagesize($file->getRealPath());
        if ($size === false) {
            throw ValidationException::withMessages([
                'hero_background' => 'Could not read image dimensions.',
            ]);
        }

        [$width, $height] = $size;
        $minW = (int) ($config['min_width'] ?? 1280);
        $minH = (int) ($config['min_height'] ?? 360);
        $maxW = (int) ($config['max_width'] ?? 4096);
        $maxH = (int) ($config['max_height'] ?? 1600);
        $ratioMin = (float) ($config['aspect_ratio_min'] ?? 2.4);
        $ratioMax = (float) ($config['aspect_ratio_max'] ?? 3.6);

        if ($width < $minW || $height < $minH) {
            throw ValidationException::withMessages([
                'hero_background' => "Image must be at least {$minW}×{$minH} px (got {$width}×{$height} px).",
            ]);
        }

        if ($width > $maxW || $height > $maxH) {
            throw ValidationException::withMessages([
                'hero_background' => "Image must not exceed {$maxW}×{$maxH} px (got {$width}×{$height} px).",
            ]);
        }

        $ratio = $width / $height;
        if ($ratio < $ratioMin || $ratio > $ratioMax) {
            $recommended = $config['recommended_aspect_ratio'] ?? '3:1';
            throw ValidationException::withMessages([
                'hero_background' => "Image aspect ratio must be close to {$recommended} (landscape banner). Got {$width}×{$height} px.",
            ]);
        }
    }
}
