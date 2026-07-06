<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class OrganizationBrandingService
{
    public function storeLogo(Organization $organization, UploadedFile $file): Organization
    {
        $this->validateLogo($file);

        if ($organization->logo_path && Storage::disk('public')->exists($organization->logo_path)) {
            Storage::disk('public')->delete($organization->logo_path);
        }

        $path = $file->store('organizations/'.$organization->id.'/branding', 'public');

        $organization->forceFill(['logo_path' => $path])->save();

        return $organization->fresh();
    }

    public function removeLogo(Organization $organization): Organization
    {
        if ($organization->logo_path && Storage::disk('public')->exists($organization->logo_path)) {
            Storage::disk('public')->delete($organization->logo_path);
        }

        $organization->forceFill(['logo_path' => null])->save();

        return $organization->fresh();
    }

    protected function validateLogo(UploadedFile $file): void
    {
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

        if (! in_array($file->getMimeType(), $allowedMimes, true)) {
            throw ValidationException::withMessages([
                'logo' => 'Logo must be a JPEG, PNG, WebP, or SVG image.',
            ]);
        }

        if ($file->getSize() > 2 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'logo' => 'Logo must be smaller than 2 MB.',
            ]);
        }
    }
}
