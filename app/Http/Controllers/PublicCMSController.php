<?php

namespace App\Http\Controllers;

use App\Models\CMS\Page;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicCMSController extends Controller
{
    /**
     * Display the company's CMS homepage
     */
    public function companyHome(string $companySlug): Response
    {
        $company = Cache::remember("company.bySlug.$companySlug", 300, function () use ($companySlug) {
            return Company::where('slug', $companySlug)
                ->where('is_active', true)
                ->firstOrFail();
        });

        $homepage = Cache::remember("cms.homepage.company.$company->id", 300, function () use ($company) {
            return Page::forCompany($company->id)
                ->where('is_homepage', true)
                ->where('status', 'published')
                ->first();
        });

        if (!$homepage) {
            // If no homepage, show company HTML welcome page
            return Inertia::render('Public/HTMLLanding', [
                'company' => $company,
                'page' => [
                    'id' => 0,
                    'title' => $company->name . ' - Welcome',
                    'slug' => 'home',
                    'html_content' => $this->getDefaultWelcomeHTML($company),
                    'use_html_content' => true,
                    'meta_title' => $company->name,
                    'meta_description' => 'Welcome to ' . $company->name,
                ],
            ]);
        }

        return $this->showPage($companySlug, $homepage->slug);
    }

    /**
     * Display a specific CMS page for a company
     */
    public function showPage(string $companySlug, string $pageSlug): Response
    {
        $company = Cache::remember("company.bySlug.$companySlug", 300, function () use ($companySlug) {
            return Company::where('slug', $companySlug)
                ->where('is_active', true)
                ->firstOrFail();
        });

        $page = Cache::remember("cms.page.company.$company->id.slug.$pageSlug", 300, function () use ($company, $pageSlug) {
            return Page::forCompany($company->id)
                ->where('slug', $pageSlug)
                ->where('status', 'published')
                ->with(['author', 'company', 'children' => function ($query) {
                    $query->where('status', 'published')->orderBy('sort_order');
                }])
                ->firstOrFail();
        });

        // Check if authentication is required
        if ($page->require_auth && !auth()->check()) {
            return redirect()->route('login');
        }

        // Build navigation menu once for both rendering paths
        $menu = $this->getCompanyMenu($company->id);

        // HTML Mode: render pure HTML page
        if ($page->use_html_content && ($page->html_content || $page->html_components)) {
            $page->increment('view_count');
            $page->update(['last_viewed_at' => now()]);

            // Compose HTML if html_content is empty but components exist
            $composedHtml = $page->html_content;
            if (!$composedHtml && is_array($page->html_components) && count($page->html_components) > 0) {
                $composedHtml = implode("\n", array_map(function ($c) {
                    return is_array($c) && isset($c['html']) ? $c['html'] : '';
                }, $page->html_components));
            }

            $pagePayload = [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'use_html_content' => true,
                'html_content' => $composedHtml,
                'meta_title' => $page->meta_title ?: $page->title,
                'meta_description' => $page->meta_description,
                'og_image' => $page->og_image,
            ];

            return Inertia::render('Public/HTMLLanding', [
                'company' => $company,
                'page' => $pagePayload,
            ]);
        }

        // Increment view count
        $page->increment('view_count');
        $page->update(['last_viewed_at' => now()]);

        // Get related pages
        $relatedPages = Cache::remember("cms.related.company.$company->id.template.$page->template.page.$page->id", 300, function () use ($company, $page) {
            return Page::forCompany($company->id)
                ->where('status', 'published')
                ->where('id', '!=', $page->id)
                ->where('template', $page->template)
                ->limit(3)
                ->get();
        });

        return Inertia::render('Public/CMS/Page', [
            'page' => $page,
            'company' => $company,
            'relatedPages' => $relatedPages,
            'menu' => $menu,
            'breadcrumbs' => $this->getBreadcrumbs($page),
        ]);
    }

    /**
     * List all published pages for a company
     */
    public function listPages(string $companySlug): Response
    {
        $company = Cache::remember("company.bySlug.$companySlug", 300, function () use ($companySlug) {
            return Company::where('slug', $companySlug)
                ->where('is_active', true)
                ->firstOrFail();
        });

        $pages = Cache::remember("cms.pages.menu.company.$company->id", 300, function () use ($company) {
            return Page::forCompany($company->id)
                ->where('status', 'published')
                ->whereNull('parent_id')
                ->where('show_in_menu', true)
                ->with(['children' => function ($query) {
                    $query->where('status', 'published')->orderBy('sort_order');
                }])
                ->orderBy('sort_order')
                ->get();
        });

        $menu = $this->getCompanyMenu($company->id);

        return Inertia::render('Public/CMS/PageList', [
            'pages' => $pages,
            'company' => $company,
            'menu' => $menu,
        ]);
    }

    /**
     * Search pages for a company
     */
    public function search(string $companySlug, Request $request): Response
    {
        $company = Cache::remember("company.bySlug.$companySlug", 300, function () use ($companySlug) {
            return Company::where('slug', $companySlug)
                ->where('is_active', true)
                ->firstOrFail();
        });

        $searchTerm = $request->input('q');

        $pages = Page::forCompany($company->id)
            ->where('status', 'published')
            ->where(function ($query) use ($searchTerm) {
                $query->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('content', 'like', "%{$searchTerm}%")
                    ->orWhere('excerpt', 'like', "%{$searchTerm}%");
            })
            ->with(['author'])
            ->paginate(10);

        $menu = $this->getCompanyMenu($company->id);

        return Inertia::render('Public/CMS/SearchResults', [
            'pages' => $pages,
            'company' => $company,
            'searchTerm' => $searchTerm,
            'menu' => $menu,
        ]);
    }

    /**
     * Get company navigation menu
     */
    private function getCompanyMenu(int $companyId): array
    {
        return Cache::remember("cms.menu.company.$companyId", 300, function () use ($companyId) {
            return Page::forCompany($companyId)
                ->where('status', 'published')
                ->where('show_in_menu', true)
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->get(['id', 'title', 'slug'])
                ->toArray();
        });
    }

    /**
     * Get breadcrumbs for a page
     */
    private function getBreadcrumbs(Page $page): array
    {
        $breadcrumbs = [];
        $currentPage = $page;

        while ($currentPage) {
            array_unshift($breadcrumbs, [
                'title' => $currentPage->title,
                'slug' => $currentPage->slug,
            ]);
            $currentPage = $currentPage->parent;
        }

        return $breadcrumbs;
    }

    /**
     * Generate default welcome HTML for companies without a homepage
     */
    private function getDefaultWelcomeHTML(Company $company): string
    {
        $name = htmlspecialchars($company->name);
        $logoHtml = '';
        if ($company->logo) {
            $logo = htmlspecialchars($company->logo);
            $logoHtml = "<img src='{$logo}' alt='{$name}' class='logo'>";
        }
        $primaryColor = $company->primary_color ?? '#2563eb';
        $secondaryColor = $company->secondary_color ?? '#f59e42';

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, {$primaryColor} 0%, {$secondaryColor} 100%);
            padding: 2rem;
        }
        .hero-content {
            text-align: center;
            color: white;
            max-width: 800px;
        }
        .logo {
            max-width: 200px;
            margin-bottom: 2rem;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }
        h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        p {
            font-size: 1.25rem;
            opacity: 0.95;
            margin-bottom: 2rem;
        }
        .cta-button {
            display: inline-block;
            padding: 1rem 2rem;
            background: white;
            color: {$primaryColor};
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        @media (max-width: 768px) {
            h1 {
                font-size: 2rem;
            }
            p {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="hero">
        <div class="hero-content">
            {$logoHtml}
            <h1>Welcome to {$name}</h1>
            <p>Your digital presence starts here. We're building something amazing.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
}
