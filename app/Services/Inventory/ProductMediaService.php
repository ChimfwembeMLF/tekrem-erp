<?php

namespace App\Services\Inventory;

use App\Models\Inventory\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductMediaService
{
    public function publicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', '/'])) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    public function storeImages(Product $product, array $files): array
    {
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $paths[] = $file->store("products/{$product->id}/images", 'public');
            }
        }

        return $paths;
    }

    public function storeVideos(Product $product, array $files): array
    {
        $items = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $items[] = [
                    'type' => 'file',
                    'path' => $file->store("products/{$product->id}/videos", 'public'),
                ];
            }
        }

        return $items;
    }

    /**
     * @param  array<int, string>  $keepPaths
     * @param  array<int, UploadedFile>  $newFiles
     * @return array<int, string>
     */
    public function syncImages(Product $product, array $keepPaths, array $newFiles): array
    {
        $current = $product->images ?? [];
        $removed = array_diff($current, $keepPaths);

        foreach ($removed as $path) {
            $this->deleteFile($path);
        }

        return array_values(array_merge($keepPaths, $this->storeImages($product, $newFiles)));
    }

    /**
     * @param  array<int, array<string, mixed>>  $keepVideos
     * @param  array<int, UploadedFile>  $newFiles
     * @param  array<int, string>  $embedUrls
     * @return array<int, array<string, mixed>>
     */
    public function syncVideos(Product $product, array $keepVideos, array $newFiles, array $embedUrls): array
    {
        $current = $product->videos ?? [];
        $removed = $this->removedVideos($current, $keepVideos);

        foreach ($removed as $video) {
            if (($video['type'] ?? null) === 'file' && !empty($video['path'])) {
                $this->deleteFile($video['path']);
            }
        }

        $embeds = collect($embedUrls)
            ->map(fn ($url) => trim((string) $url))
            ->filter()
            ->map(fn ($url) => ['type' => 'embed', 'url' => $url])
            ->values()
            ->all();

        return array_values(array_merge(
            $keepVideos,
            $this->storeVideos($product, $newFiles),
            $embeds,
        ));
    }

    public function imageUrls(?array $paths): array
    {
        return collect($paths ?? [])
            ->map(fn ($path) => $this->publicUrl($path))
            ->filter()
            ->values()
            ->all();
    }

    public function videoItems(?array $videos): array
    {
        return collect($videos ?? [])
            ->map(function (array $video) {
                if (($video['type'] ?? null) === 'file') {
                    $url = $this->publicUrl($video['path'] ?? null);
                    if (!$url) {
                        return null;
                    }

                    return ['type' => 'file', 'url' => $url];
                }

                if (($video['type'] ?? null) === 'embed') {
                    $embedUrl = $this->embedUrl($video['url'] ?? '');
                    if (!$embedUrl) {
                        return null;
                    }

                    return ['type' => 'embed', 'url' => $video['url'], 'embed_url' => $embedUrl];
                }

                return null;
            })
            ->filter()
            ->values()
            ->all();
    }

    public function embedUrl(string $url): ?string
    {
        $url = trim($url);
        if ($url === '') {
            return null;
        }

        if (preg_match('~(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{6,})~', $url, $matches)) {
            return 'https://www.youtube.com/embed/' . $matches[1];
        }

        if (preg_match('~vimeo\.com/(?:video/)?(\d+)~', $url, $matches)) {
            return 'https://player.vimeo.com/video/' . $matches[1];
        }

        return Str::startsWith($url, ['http://', 'https://']) ? $url : null;
    }

  /**
     * @param  array<int, array<string, mixed>>  $current
     * @param  array<int, array<string, mixed>>  $kept
     * @return array<int, array<string, mixed>>
     */
    private function removedVideos(array $current, array $kept): array
    {
        $keptKeys = collect($kept)->map(fn ($video) => $this->videoKey($video))->all();

        return collect($current)
            ->reject(fn ($video) => in_array($this->videoKey($video), $keptKeys, true))
            ->values()
            ->all();
    }

    private function videoKey(array $video): string
    {
        if (($video['type'] ?? null) === 'file') {
            return 'file:' . ($video['path'] ?? '');
        }

        return 'embed:' . ($video['url'] ?? '');
    }

    private function deleteFile(string $path): void
    {
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
