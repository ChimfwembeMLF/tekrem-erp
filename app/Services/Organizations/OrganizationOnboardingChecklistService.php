<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class OrganizationOnboardingChecklistService
{
    public function __construct(
        private OrganizationBrandingService $brandingService,
    ) {}

    /**
     * @return list<array{id: string, title: string, description: string, completed: bool, required_fields: list<string>}>
     */
    public function steps(Organization $organization): array
    {
        $checklist = $this->checklistMap($organization);

        return [
            [
                'id' => 'company_profile',
                'title' => 'Company profile',
                'description' => 'Legal name, industry, and registration details.',
                'completed' => (bool) ($checklist['company_profile'] ?? false),
                'required_fields' => ['name', 'industry', 'registration_number'],
            ],
            [
                'id' => 'contact_location',
                'title' => 'Contact & location',
                'description' => 'How customers and regulators can reach you.',
                'completed' => (bool) ($checklist['contact_location'] ?? false),
                'required_fields' => ['email', 'phone', 'address', 'city', 'country'],
            ],
            [
                'id' => 'tax_compliance',
                'title' => 'Tax & compliance',
                'description' => 'TPIN and tax registration for invoices and ZRA.',
                'completed' => (bool) ($checklist['tax_compliance'] ?? false),
                'required_fields' => ['tax_id'],
            ],
            [
                'id' => 'branding',
                'title' => 'Branding',
                'description' => 'Display name and look for your shop and documents.',
                'completed' => (bool) ($checklist['branding'] ?? false),
                'required_fields' => ['display_name', 'primary_color'],
            ],
        ];
    }

    public function isComplete(Organization $organization): bool
    {
        return $organization->onboarding_completed_at !== null;
    }

    public function progress(Organization $organization): int
    {
        $steps = $this->steps($organization);
        $completed = collect($steps)->where('completed', true)->count();

        return $steps === [] ? 100 : (int) round(($completed / count($steps)) * 100);
    }

    /**
     * @return array<string, mixed>
     */
    public function payload(Organization $organization): array
    {
        $organization->loadMissing('owner');

        return [
            'completed' => $this->isComplete($organization),
            'completed_at' => $organization->onboarding_completed_at?->toIso8601String(),
            'progress' => $this->progress($organization),
            'steps' => $this->steps($organization),
            'profile' => $this->profilePayload($organization),
            'can_manage' => true,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function saveStep(Organization $organization, string $stepId, array $data): Organization
    {
        $rules = match ($stepId) {
            'company_profile' => [
                'name' => ['required', 'string', 'max:255'],
                'industry' => ['required', 'string', 'max:100'],
                'registration_number' => ['required', 'string', 'max:100'],
            ],
            'contact_location' => [
                'email' => ['required', 'email', 'max:255'],
                'phone' => ['required', 'string', 'max:30'],
                'address' => ['required', 'string', 'max:500'],
                'city' => ['required', 'string', 'max:120'],
                'country' => ['required', 'string', 'size:2'],
            ],
            'tax_compliance' => [
                'tax_id' => ['required', 'string', 'max:50', 'regex:/^[0-9]{10}$/'],
            ],
            'branding' => [
                'display_name' => ['required', 'string', 'max:255'],
                'primary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
                'tagline' => ['nullable', 'string', 'max:255'],
                'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp,svg', 'max:2048'],
                'remove_logo' => ['sometimes', 'boolean'],
            ],
            default => throw ValidationException::withMessages(['step' => 'Invalid onboarding step.']),
        };

        $messages = [
            'tax_id.regex' => 'TPIN must be a 10-digit number.',
            'primary_color.regex' => 'Choose a valid hex colour (e.g. #059669).',
        ];

        $validated = Validator::make($data, $rules, $messages)->validate();

        if ($stepId === 'branding') {
            $branding = array_merge($organization->branding ?? [], [
                'display_name' => $validated['display_name'],
                'primary_color' => $validated['primary_color'],
                'tagline' => $validated['tagline'] ?? null,
            ]);

            $organization->forceFill([
                'name' => $organization->name,
                'branding' => $branding,
            ]);

            if (! empty($validated['remove_logo'])) {
                $this->brandingService->removeLogo($organization);
            } elseif ($data['logo'] ?? null instanceof UploadedFile) {
                $this->brandingService->storeLogo($organization, $data['logo']);
            }
        } else {
            $organization->forceFill($validated);
        }

        $checklist = $this->checklistMap($organization);
        $checklist[$stepId] = true;
        $organization->onboarding_checklist = $checklist;
        $organization->save();

        return $organization->fresh();
    }

    public function submit(Organization $organization, bool $confirmed): Organization
    {
        if (! $confirmed) {
            throw ValidationException::withMessages([
                'confirmed' => 'Please confirm that your company information is accurate.',
            ]);
        }

        foreach ($this->steps($organization) as $step) {
            if (! $step['completed']) {
                throw ValidationException::withMessages([
                    'checklist' => 'Complete all onboarding steps before submitting.',
                ]);
            }
        }

        $this->assertRequiredProfile($organization);

        $organization->forceFill(['onboarding_completed_at' => now()])->save();

        return $organization->fresh();
    }

    public function initializeChecklist(Organization $organization): void
    {
        if ($organization->onboarding_checklist) {
            return;
        }

        $organization->forceFill([
            'country' => $organization->country ?: 'ZM',
            'onboarding_checklist' => [
                'company_profile' => $this->stepCompleteFromData($organization, 'company_profile'),
                'contact_location' => $this->stepCompleteFromData($organization, 'contact_location'),
                'tax_compliance' => $this->stepCompleteFromData($organization, 'tax_compliance'),
                'branding' => $this->stepCompleteFromData($organization, 'branding'),
            ],
        ])->save();
    }

    /**
     * @return array<string, bool>
     */
    private function checklistMap(Organization $organization): array
    {
        $stored = $organization->onboarding_checklist ?? [];

        return [
            'company_profile' => (bool) ($stored['company_profile'] ?? $this->stepCompleteFromData($organization, 'company_profile')),
            'contact_location' => (bool) ($stored['contact_location'] ?? $this->stepCompleteFromData($organization, 'contact_location')),
            'tax_compliance' => (bool) ($stored['tax_compliance'] ?? $this->stepCompleteFromData($organization, 'tax_compliance')),
            'branding' => (bool) ($stored['branding'] ?? $this->stepCompleteFromData($organization, 'branding')),
        ];
    }

    private function stepCompleteFromData(Organization $organization, string $stepId): bool
    {
        return match ($stepId) {
            'company_profile' => filled($organization->name)
                && filled($organization->industry)
                && filled($organization->registration_number),
            'contact_location' => filled($organization->email)
                && filled($organization->phone)
                && filled($organization->address)
                && filled($organization->city)
                && filled($organization->country),
            'tax_compliance' => filled($organization->tax_id)
                && preg_match('/^[0-9]{10}$/', (string) $organization->tax_id),
            'branding' => filled($organization->displayName())
                && filled($organization->brandingValue('primary_color')),
            default => false,
        };
    }

    private function assertRequiredProfile(Organization $organization): void
    {
        foreach ($this->steps($organization) as $step) {
            if (! $step['completed']) {
                throw ValidationException::withMessages([
                    'checklist' => "The “{$step['title']}” step is incomplete.",
                ]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function profilePayload(Organization $organization): array
    {
        return [
            'name' => $organization->name,
            'email' => $organization->email,
            'phone' => $organization->phone,
            'address' => $organization->address,
            'city' => $organization->city,
            'country' => $organization->country ?: 'ZM',
            'tax_id' => $organization->tax_id,
            'registration_number' => $organization->registration_number,
            'industry' => $organization->industry,
            'display_name' => $organization->displayName(),
            'primary_color' => $organization->brandingValue('primary_color', '#059669'),
            'tagline' => $organization->brandingValue('tagline'),
            'logo_url' => $organization->logo_url,
        ];
    }
}
