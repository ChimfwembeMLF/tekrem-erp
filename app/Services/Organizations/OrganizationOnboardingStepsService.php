<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use App\Support\Organizations\OrganizationModuleAccess;

class OrganizationOnboardingStepsService
{
    /**
     * @return list<array{title: string, description: string, href: string, module: string|null}>
     */
    public function nextSteps(Organization $organization): array
    {
        $steps = [
            [
                'title' => 'Set up your shop',
                'description' => 'Add products, categories, and configure shipping.',
                'href' => route('inventory.products.index'),
                'module' => 'inventory',
            ],
            [
                'title' => 'Configure payments',
                'description' => 'Connect PawaPay for mobile money checkout.',
                'href' => route('settings.finance.payments.pawapay'),
                'module' => 'finance',
            ],
            [
                'title' => 'Invite your team',
                'description' => 'Add staff members to help run your business.',
                'href' => route('settings.users'),
                'module' => null,
            ],
            [
                'title' => 'Review billing',
                'description' => 'See your plan, trial end date, and payment options.',
                'href' => route('organization.billing'),
                'module' => null,
            ],
        ];

        return OrganizationModuleAccess::filterByModule($steps);
    }
}
