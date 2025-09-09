<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CMS\Page;
use App\Models\CMS\Media;
use App\Models\CMS\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CMSController extends Controller
{
    /**
     * Display customer CMS dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get published pages that don't require auth or are accessible to customers
        $recentPages = Page::published()
            ->where(function ($query) {
                $query->where('require_auth', false)
                      ->orWhere('require_auth', true); // Customer is authenticated
            })
            ->orderBy('published_at', 'desc')
            ->limit(6)
            ->get(['id', 'title', 'slug', 'excerpt', 'published_at', 'view_count']);

        // Get public media
        $recentMedia = Media::public()
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get(['id', 'name', 'file_url', 'file_path', 'mime_type', 'alt_text']);

        // Get menu items for customer navigation
        $customerMenu = Menu::active()
            ->where('location', 'customer')
            ->with(['items' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->first();

        $stats = [
            'total_pages' => Page::published()->where('require_auth', false)->count(),
            'total_media' => Media::public()->count(),
            'recent_views' => Page::published()
                ->where('require_auth', false)
                ->where('last_viewed_at', '>=', now()->subDays(7))
                ->sum('view_count'),
        ];

        return Inertia::render('Customer/CMS/Index', [
            'recent_pages' => $recentPages,
            'recent_media' => $recentMedia,
            'customer_menu' => $customerMenu,
            'stats' => $stats,
        ]);
    }

    /**
     * Display published pages.
     */
    public function pages(Request $request): Response
    {
        $query = Page::published()
            ->where(function ($q) {
                $q->where('require_auth', false)
                  ->orWhere('require_auth', true); // Customer is authenticated
            });

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Apply language filter
        if ($request->filled('language')) {
            $query->where('language', $request->language);
        }

        $pages = $query->orderBy('published_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $languages = Page::published()
            ->where('require_auth', false)
            ->distinct()
            ->pluck('language')
            ->filter();

        return Inertia::render('Customer/CMS/Pages', [
            'pages' => $pages,
            'languages' => $languages,
            'filters' => $request->only(['search', 'language']),
        ]);
    }

    /**
     * Display a specific page.
     */
    public function showPage(Page $page): Response
    {
        // Check if page is published and accessible
        if ($page->status !== 'published') {
            abort(404);
        }

        if ($page->require_auth && !Auth::check()) {
            abort(403, 'Authentication required to view this page.');
        }

        $page->load(['author']);
        $page->increment('view_count');
        $page->update(['last_viewed_at' => now()]);

        // Get related pages
        $relatedPages = Page::published()
            ->where('id', '!=', $page->id)
            ->where('require_auth', false)
            ->when($page->language, function ($query) use ($page) {
                $query->where('language', $page->language);
            })
            ->orderBy('view_count', 'desc')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt']);

        return Inertia::render('Customer/CMS/ShowPage', [
            'page' => $page,
            'related_pages' => $relatedPages,
        ]);
    }

    /**
     * Display public media gallery.
     */
    public function media(Request $request): Response
    {
        $query = Media::public();

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply type filter
        if ($request->filled('type')) {
            $type = $request->type;
            if ($type === 'images') {
                $query->images();
            } elseif ($type === 'videos') {
                $query->videos();
            } elseif ($type === 'documents') {
                $query->where('mime_type', 'not like', 'image/%')
                      ->where('mime_type', 'not like', 'video/%');
            }
        }

        $media = $query->orderBy('created_at', 'desc')
            ->paginate(24)
            ->withQueryString();

        $stats = [
            'total_images' => Media::public()->images()->count(),
            'total_videos' => Media::public()->videos()->count(),
            'total_documents' => Media::public()
                ->where('mime_type', 'not like', 'image/%')
                ->where('mime_type', 'not like', 'video/%')
                ->count(),
        ];

        return Inertia::render('Customer/CMS/Media', [
            'media' => $media,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    /**
     * Display a specific media item.
     */
    public function showMedia(Media $media): Response
    {
        // Check if media is public
        if (!$media->is_public) {
            abort(404);
        }

        $media->load(['uploadedBy', 'folder']);
        $media->increment('usage_count');
        $media->update(['last_used_at' => now()]);

        // Get related media from the same folder
        $relatedMedia = Media::public()
            ->where('id', '!=', $media->id)
            ->when($media->folder_id, function ($query) use ($media) {
                $query->where('folder_id', $media->folder_id);
            })
            ->limit(6)
            ->get(['id', 'name', 'file_url', 'file_path', 'mime_type', 'alt_text']);

        return Inertia::render('Customer/CMS/ShowMedia', [
            'media' => $media,
            'related_media' => $relatedMedia,
        ]);
    }

    /**
     * Search across all CMS content.
     */
    public function search(Request $request): Response
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return Inertia::render('Customer/CMS/Search', [
                'pages' => [],
                'media' => [],
                'query' => $query,
            ]);
        }

        // Search pages
        $pages = Page::published()
            ->where('require_auth', false)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('excerpt', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'excerpt', 'published_at']);

        // Search media
        $media = Media::public()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('alt_text', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderBy('usage_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'file_url', 'file_path', 'mime_type', 'alt_text']);

        return Inertia::render('Customer/CMS/Search', [
            'pages' => $pages,
            'media' => $media,
            'query' => $query,
        ]);
    }

    /**
     * Get customer navigation menu.
     */
    public function menu(): Response
    {
        $menu = Menu::active()
            ->where('location', 'customer')
            ->with(['items' => function ($query) {
                $query->orderBy('sort_order')
                      ->with(['children' => function ($subQuery) {
                          $subQuery->orderBy('sort_order');
                      }]);
            }])
            ->first();

        return Inertia::render('Customer/CMS/Menu', [
            'menu' => $menu,
        ]);
    }
}
