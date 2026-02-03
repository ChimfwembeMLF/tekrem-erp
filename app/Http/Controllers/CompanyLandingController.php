<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CMS\Page;
use App\Models\CMS\Menu;
use App\Models\CMS\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CompanyLandingController extends Controller
{
    /**
     * Display the company landing page.
     */
    public function show($slug)
    {
        $company = Company::where('slug', $slug)->firstOrFail();
        
        // Try to find a published CMS landing page for this company
                $landingPage = Page::with(['author'])
            ->where('company_id', $company->id)
            ->where(function($q) {
                                $q->where('slug', 'landing')
                                    ->orWhere('slug', 'home')
                                    ->orWhere('template', 'landing-page')
                                    ->orWhere('is_homepage', true);
            })
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->first();

        if ($landingPage) {
            // Increment view count
            $landingPage->incrementViews();

            // If page is in HTML mode, render pure HTML (composed if needed)
            if ($landingPage->use_html_content && ($landingPage->html_content || $landingPage->html_components)) {
                $composedHtml = $landingPage->html_content;
                if (!$composedHtml && is_array($landingPage->html_components) && count($landingPage->html_components) > 0) {
                    $composedHtml = implode("\n", array_map(function ($c) {
                        return is_array($c) && isset($c['html']) ? $c['html'] : '';
                    }, $landingPage->html_components));
                }

                $sections = [
                    [
                        'type' => 'html_content',
                        'data' => [
                            'html' => $composedHtml,
                            'title' => $landingPage->title,
                            'container' => false,
                        ],
                    ],
                ];

                return inertia('Company/Landing', [
                    'company' => $this->formatCompany($company),
                    'page' => [
                        'id' => $landingPage->id,
                        'title' => $landingPage->title,
                        'slug' => $landingPage->slug,
                        'content' => $landingPage->content,
                        'excerpt' => $landingPage->excerpt,
                        'template' => $landingPage->template,
                        'use_html_content' => true,
                        'html_content' => $composedHtml,
                        'meta' => $landingPage->getSeoMetaTags(),
                    ],
                    'sections' => $sections,
                    'media' => [],
                    'menu' => $this->getMenu($company),
                    'footer' => $this->getFooterData($company),
                ]);
            } else {
                // Prefer content_blocks (JSON sections), fallback to HTML content
                $sections = [];
                if (!empty($landingPage->content_blocks)) {
                    if (is_array($landingPage->content_blocks)) {
                        $sections = $landingPage->content_blocks;
                    } elseif (is_string($landingPage->content_blocks)) {
                        $decoded = json_decode($landingPage->content_blocks, true);
                        if (is_array($decoded)) {
                            $sections = $decoded;
                        }
                    }
                }
                if (empty($sections)) {
                    $sections = [
                        [
                            'type' => 'html_content',
                            'data' => [
                                'html' => $landingPage->content,
                                'title' => $landingPage->title,
                                'container' => false,
                            ],
                        ],
                    ];
                }
            }

            return inertia('Company/Landing', [
                'company' => $this->formatCompany($company),
                'page' => [
                    'id' => $landingPage->id,
                    'title' => $landingPage->title,
                    'slug' => $landingPage->slug,
                    'content' => $landingPage->content,
                    'excerpt' => $landingPage->excerpt,
                    'template' => $landingPage->template,
                    'use_html_content' => false,
                    'meta' => $landingPage->getSeoMetaTags(),
                ],
                'sections' => $sections,
                'media' => [],
                'menu' => $this->getMenu($company),
                'footer' => $this->getFooterData($company),
            ]);
        }

        // Fallback: show default landing view
        return inertia('Company/Landing', [
            'company' => $this->formatCompany($company),
            'page' => null,
            'sections' => $this->getDefaultSections($company),
            'menu' => $this->getMenu($company),
            'footer' => $this->getFooterData($company),
        ]);
    }

    /**
     * Prepare page data including sections, media, menu, etc.
     */
    private function preparePageData(Page $page, Company $company): array
    {
        $data = [
            'sections' => [],
            'media' => [],
            'menu' => $this->getMenu($company),
            'footer' => $this->getFooterData($company),
        ];

        // Parse content_blocks if available
        if (!empty($page->content_blocks) && is_array($page->content_blocks)) {
            foreach ($page->content_blocks as $block) {
                $section = $this->parseContentBlock($block, $company);
                if ($section) {
                    $data['sections'][] = $section;
                    
                    // Collect media from blocks
                    if (!empty($block['media_id'])) {
                        $mediaItem = Media::find($block['media_id']);
                        if ($mediaItem) {
                            $data['media'][] = $this->formatMediaItem($mediaItem);
                        }
                    }

                    // Collect multiple media items (for galleries, etc.)
                    if (!empty($block['media_ids']) && is_array($block['media_ids'])) {
                        $mediaItems = Media::whereIn('id', $block['media_ids'])->get();
                        foreach ($mediaItems as $mediaItem) {
                            $data['media'][] = $this->formatMediaItem($mediaItem);
                        }
                    }
                }
            }
        }

        // If no sections were parsed, create a default HTML content section
        if (empty($data['sections']) && !empty($page->content)) {
            $data['sections'][] = [
                'type' => 'html_content',
                'data' => [
                    'html' => $page->content,
                    'title' => $page->title,
                    'container' => true,
                ],
            ];
        }

        // Get company media
        $companyMedia = $this->getCompanyMedia($company, 20);
        $data['media'] = array_merge($data['media'], $companyMedia);

        // Remove duplicate media
        $data['media'] = array_values(array_unique($data['media'], SORT_REGULAR));

        return $data;
    }

    /**
     * Parse individual content block into section format.
     */
    private function parseContentBlock(array $block, Company $company): ?array
    {
        $type = $block['type'] ?? 'content';
        
        switch ($type) {
            case 'hero':
                return [
                    'type' => 'hero',
                    'data' => [
                        'title' => $block['title'] ?? $company->name,
                        'subtitle' => $block['subtitle'] ?? $block['content'] ?? $company->tagline ?? '',
                        'image' => $this->getMediaUrl($block['media_id'] ?? null),
                        'background' => $block['background'] ?? null,
                        'overlay' => $block['overlay'] ?? true,
                        'alignment' => $block['alignment'] ?? 'center',
                        'cta' => $block['cta'] ?? [
                            'text' => 'Get Started',
                            'url' => '#contact',
                        ],
                        'secondary_cta' => $block['secondary_cta'] ?? null,
                    ],
                ];

            case 'services':
                return [
                    'type' => 'services',
                    'data' => [
                        'title' => $block['title'] ?? 'Our Services',
                        'subtitle' => $block['subtitle'] ?? '',
                        'services' => $block['services'] ?? [],
                        'layout' => $block['layout'] ?? 'grid',
                    ],
                ];

            case 'features':
                return [
                    'type' => 'features',
                    'data' => [
                        'title' => $block['title'] ?? 'Features',
                        'subtitle' => $block['subtitle'] ?? '',
                        'items' => $block['items'] ?? [],
                        'layout' => $block['layout'] ?? 'grid',
                    ],
                ];

            case 'testimonials':
                return [
                    'type' => 'testimonials',
                    'data' => [
                        'title' => $block['title'] ?? 'What Our Clients Say',
                        'testimonials' => $block['testimonials'] ?? [],
                    ],
                ];

            case 'team':
                return [
                    'type' => 'team',
                    'data' => [
                        'title' => $block['title'] ?? 'Our Team',
                        'subtitle' => $block['subtitle'] ?? '',
                        'members' => $block['members'] ?? [],
                    ],
                ];

            case 'stats':
                return [
                    'type' => 'stats',
                    'data' => [
                        'title' => $block['title'] ?? '',
                        'stats' => $block['stats'] ?? [],
                        'background' => $block['background'] ?? null,
                    ],
                ];

            case 'cta':
                return [
                    'type' => 'cta',
                    'data' => [
                        'title' => $block['title'] ?? 'Ready to Get Started?',
                        'content' => $block['content'] ?? '',
                        'button_text' => $block['button_text'] ?? 'Contact Us',
                        'button_url' => $block['button_url'] ?? '#contact',
                        'background' => $block['background'] ?? null,
                    ],
                ];

            case 'gallery':
                return [
                    'type' => 'gallery',
                    'data' => [
                        'title' => $block['title'] ?? 'Gallery',
                        'images' => $this->getGalleryImages($block['media_ids'] ?? []),
                        'layout' => $block['layout'] ?? 'masonry',
                    ],
                ];

            case 'contact':
                return [
                    'type' => 'contact',
                    'data' => [
                        'title' => $block['title'] ?? 'Get In Touch',
                        'content' => $block['content'] ?? '',
                        'form_fields' => $block['form_fields'] ?? $this->getDefaultContactFields(),
                        'contact_info' => $this->getContactInfo($company),
                    ],
                ];

            case 'html':
            case 'html_content':
                return [
                    'type' => 'html_content',
                    'data' => [
                        'html' => $block['content'] ?? $block['html'] ?? '',
                        'title' => $block['title'] ?? '',
                        'container' => $block['container'] ?? true,
                    ],
                ];

            case 'content':
            default:
                return [
                    'type' => 'content',
                    'data' => [
                        'title' => $block['title'] ?? '',
                        'content' => $block['content'] ?? '',
                        'image' => $this->getMediaUrl($block['media_id'] ?? null),
                        'layout' => $block['layout'] ?? 'default',
                    ],
                ];
        }
    }

    /**
     * Get menu for the company.
     */
    private function getMenu(Company $company): ?array
    {
        $menu = Cache::remember(
            "company_menu_{$company->id}",
            now()->addHour(),
            function () use ($company) {
                return Menu::with(['items' => function ($query) {
                    $query->where('is_active', true)
                          ->orderBy('sort_order');
                }, 'items.children' => function ($query) {
                    $query->where('is_active', true)
                          ->orderBy('sort_order');
                }])
                    ->where('company_id', $company->id)
                    ->where('location', 'header')
                    ->where('is_active', true)
                    ->first();
            }
        );

        if (!$menu) {
            return null;
        }

        return [
            'name' => $menu->name,
            'items' => $menu->getStructure(),
        ];
    }

    /**
     * Get footer data.
     */
    private function getFooterData(Company $company): array
    {
        $footerMenu = Cache::remember(
            "company_footer_menu_{$company->id}",
            now()->addHour(),
            function () use ($company) {
                return Menu::with(['items' => function ($query) {
                    $query->where('is_active', true)
                          ->orderBy('sort_order');
                }])
                    ->where('company_id', $company->id)
                    ->where('location', 'footer')
                    ->where('is_active', true)
                    ->first();
            }
        );

        return [
            'menu' => $footerMenu ? $footerMenu->getStructure() : null,
            'company' => [
                'name' => $company->name,
                'logo' => $company->logo ?? null,
                'address' => $company->address ?? null,
                'phone' => $company->phone ?? null,
                'email' => $company->email ?? null,
                'description' => $company->description ?? null,
            ],
            'social' => [
                'facebook' => $company->facebook_url ?? null,
                'twitter' => $company->twitter_url ?? null,
                'linkedin' => $company->linkedin_url ?? null,
                'instagram' => $company->instagram_url ?? null,
            ],
            'copyright' => "© " . date('Y') . " {$company->name}. All rights reserved.",
        ];
    }

    /**
     * Format company data for frontend.
     */
    private function formatCompany(Company $company): array
    {
        return [
            'id' => $company->id,
            'name' => $company->name,
            'slug' => $company->slug,
            'logo' => $company->logo ?? null,
            'tagline' => $company->tagline ?? null,
            'description' => $company->description ?? null,
            'primary_color' => $company->primary_color ?? '#6366f1',
            'secondary_color' => $company->secondary_color ?? '#8b5cf6',
            'address' => $company->address ?? null,
            'phone' => $company->phone ?? null,
            'email' => $company->email ?? null,
        ];
    }

    /**
     * Get default sections for companies without custom page.
     */
    private function getDefaultSections(Company $company): array
    {
        return [
            [
                'type' => 'hero',
                'data' => [
                    'title' => "Welcome to {$company->name}",
                    'subtitle' => $company->tagline ?? $company->description ?? 'Your trusted partner for innovative solutions.',
                    'image' => $company->logo ?? null,
                    'cta' => [
                        'text' => 'Learn More',
                        'url' => '#services',
                    ],
                ],
            ],
            [
                'type' => 'services',
                'data' => [
                    'title' => 'Our Services',
                    'subtitle' => 'We provide comprehensive solutions tailored to your needs.',
                    'services' => [
                        [
                            'title' => 'Consulting',
                            'description' => 'Expert guidance for your business.',
                            'icon' => 'briefcase',
                        ],
                        [
                            'title' => 'Development',
                            'description' => 'Custom solutions built for success.',
                            'icon' => 'code',
                        ],
                        [
                            'title' => 'Support',
                            'description' => 'Dedicated assistance when you need it.',
                            'icon' => 'headphones',
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Get company media.
     */
    private function getCompanyMedia(Company $company, int $limit = 10): array
    {
        $media = Media::where('company_id', $company->id)
            ->where('is_public', true)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return $media->map(function ($item) {
            return $this->formatMediaItem($item);
        })->toArray();
    }

    /**
     * Format media item for frontend.
     */
    private function formatMediaItem(Media $media): array
    {
        return [
            'id' => $media->id,
            'name' => $media->name,
            'url' => $media->url,
            'thumbnail' => $media->getThumbnailUrl(),
            'type' => $media->type,
            'alt' => $media->alt_text ?? $media->name,
            'description' => $media->description,
        ];
    }

    /**
     * Get media URL by ID.
     */
    private function getMediaUrl(?int $mediaId): ?string
    {
        if (!$mediaId) {
            return null;
        }

        $media = Media::find($mediaId);
        return $media ? $media->url : null;
    }

    /**
     * Get gallery images.
     */
    private function getGalleryImages(array $mediaIds): array
    {
        if (empty($mediaIds)) {
            return [];
        }

        $media = Media::whereIn('id', $mediaIds)
            ->where('is_public', true)
            ->get();

        return $media->map(function ($item) {
            return $this->formatMediaItem($item);
        })->toArray();
    }

    /**
     * Get contact info for company.
     */
    private function getContactInfo(Company $company): array
    {
        return array_filter([
            'address' => $company->address ?? null,
            'phone' => $company->phone ?? null,
            'email' => $company->email ?? null,
        ]);
    }

    /**
     * Get default contact form fields.
     */
    private function getDefaultContactFields(): array
    {
        return [
            [
                'name' => 'name',
                'label' => 'Full Name',
                'type' => 'text',
                'required' => true,
                'placeholder' => 'John Doe',
            ],
            [
                'name' => 'email',
                'label' => 'Email Address',
                'type' => 'email',
                'required' => true,
                'placeholder' => 'john@example.com',
            ],
            [
                'name' => 'phone',
                'label' => 'Phone Number',
                'type' => 'tel',
                'required' => false,
                'placeholder' => '+1 (555) 000-0000',
            ],
            [
                'name' => 'message',
                'label' => 'Message',
                'type' => 'textarea',
                'required' => true,
                'placeholder' => 'How can we help you?',
            ],
        ];
    }
}