<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrganizationSwitchController extends Controller
{
    public function __invoke(Request $request, Organization $organization): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user, 403);

        if (! $user->isSuperUser()) {
            abort_unless(
                $user->organizations()->where('organizations.id', $organization->id)->exists(),
                403,
                'You do not belong to this organization.'
            );
        }

        $user->forceFill(['current_organization_id' => $organization->id])->save();
        $request->session()->put('organization_id', $organization->id);

        return back()->with('success', "Switched to {$organization->name}.");
    }
}
