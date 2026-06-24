<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\ShopProductReview;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('Ecommerce/Admin/Reviews/Index', [
            'reviews' => ShopProductReview::with('product')->latest()->paginate(20),
        ]);
    }

    public function approve(ShopProductReview $review)
    {
        $review->update(['is_approved' => true]);

        return back()->with('success', 'Review approved.');
    }

    public function destroy(ShopProductReview $review)
    {
        $review->delete();

        return back()->with('success', 'Review deleted.');
    }
}
