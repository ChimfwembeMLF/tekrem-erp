<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Services\Ecommerce\ShopHeroService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopSettingsController extends Controller
{
    public function __construct(private ShopHeroService $shopHero) {}

    public function edit(): Response
    {
        $requirements = $this->shopHero->requirements();

        return Inertia::render('Ecommerce/Admin/StorefrontSettings', [
            'hero' => [
                'background_url' => $this->shopHero->url(),
                'requirements' => [
                    'min_width' => $requirements['min_width'],
                    'min_height' => $requirements['min_height'],
                    'max_width' => $requirements['max_width'],
                    'max_height' => $requirements['max_height'],
                    'recommended_width' => $requirements['recommended_width'],
                    'recommended_height' => $requirements['recommended_height'],
                    'recommended_aspect_ratio' => $requirements['recommended_aspect_ratio'],
                    'max_file_size_kb' => $requirements['max_file_size_kb'],
                    'allowed_mimes' => $requirements['allowed_mimes'],
                ],
            ],
        ]);
    }

    public function updateHeroBackground(Request $request): RedirectResponse
    {
        $request->validate([
            'hero_background' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $this->shopHero->store($request->file('hero_background'));

        return redirect()
            ->route('ecommerce.settings.edit')
            ->with('success', 'Shop hero background updated.');
    }

    public function destroyHeroBackground(): RedirectResponse
    {
        $this->shopHero->remove();

        return redirect()
            ->route('ecommerce.settings.edit')
            ->with('success', 'Shop hero background removed.');
    }
}
