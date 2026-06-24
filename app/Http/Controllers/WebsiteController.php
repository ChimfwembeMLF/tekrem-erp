<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class WebsiteController extends Controller
{
    public function index()
    {
        return inertia('Website/Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
        ]);
    }

    public function about()
    {
        return inertia('Website/About');
    }

    public function services()
    {
        return inertia('Website/Services');
    }

    public function pricing()
    {
        return inertia('Website/Pricing');
    }

    public function contact()
    {
        return inertia('Website/Contact');
    }

    public function serviceShow(string $slug)
    {
        return inertia('Website/Services/Show', ['slug' => $slug]);
    }

    public function faq()
    {
        return inertia('Website/FAQ');
    }
}
