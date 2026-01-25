<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;
use Illuminate\Support\Str;

class CMSSeeder extends Seeder
{
    public function run(): void
    {
        // Get admin or super_user
        $user = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'super_user']);
        })->first();

        if (! $user) {
            $this->command->info('Please run the RoleSeeder and UserSeeder first.');

            return;
        }

        // Default templates
        $templates = [
            [
                'name' => 'Default Page',
                'slug' => 'default-page',
                'description' => 'Standard page template with header, content, and footer',
                'content' => '<div class="container mx-auto px-4 py-8">
                <header class="mb-8">
                    <h1 class="text-4xl font-bold text-gray-900">{{ $page->title }}</h1>
                    @if($page->excerpt)
                        <p class="text-xl text-gray-600 mt-4">{{ $page->excerpt }}</p>
                    @endif
                </header>

                <main class="prose prose-lg max-w-none">
                    {!! $page->content !!}
                </main>
                </div>',
                'fields' => json_encode([
                    'show_breadcrumbs' => ['type' => 'boolean', 'default' => true],
                    'show_sidebar' => ['type' => 'boolean', 'default' => false],
                    'container_width' => [
                        'type' => 'select',
                        'options' => ['container', 'container-fluid'],
                        'default' => 'container',
                    ],
                ]),
                'is_active' => true,
                'is_default' => true,
                'created_by' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Landing Page',
                'slug' => 'landing-page',
                'description' => 'Hero section with call-to-action and features',
                'content' => '<div class="min-h-screen">
                <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                    <div class="container mx-auto px-4 text-center">
                        <h1 class="text-5xl font-bold mb-6">{{ $page->title }}</h1>
                        @if($page->excerpt)
                            <p class="text-xl mb-8">{{ $page->excerpt }}</p>
                        @endif
                        <a href="#content" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                            Learn More
                        </a>
                    </div>
                </section>

                <section id="content" class="py-16">
                    <div class="container mx-auto px-4">
                        <div class="prose prose-lg max-w-none">
                            {!! $page->content !!}
                        </div>
                    </div>
                </section>
                </div>',
                'fields' => json_encode([
                    'hero_background' => ['type' => 'image', 'default' => ''],
                    'cta_text' => ['type' => 'text', 'default' => 'Learn More'],
                    'cta_link' => ['type' => 'text', 'default' => '#content'],
                ]),
                'is_active' => true,
                'is_default' => false,
                'created_by' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Blog Post',
                'slug' => 'blog-post',
                'description' => 'Article template with author info and related posts',
                'content' => '<article class="container mx-auto px-4 py-8 max-w-4xl">
                <header class="mb-8">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $page->title }}</h1>
                    <div class="flex items-center text-gray-600 mb-4">
                        <span>By {{ $page->author->name }}</span>
                        <span class="mx-2">•</span>
                        <time>{{ $page->published_at->format("F j, Y") }}</time>
                    </div>
                    @if($page->excerpt)
                        <p class="text-xl text-gray-600 leading-relaxed">{{ $page->excerpt }}</p>
                    @endif
                </header>

                <div class="prose prose-lg max-w-none">
                    {!! $page->content !!}
                </div>

                <footer class="mt-12 pt-8 border-t border-gray-200">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <img class="h-12 w-12 rounded-full" src="{{ $page->author->avatar ?? "/images/default-avatar.png" }}" alt="{{ $page->author->name }}">
                        </div>
                        <div class="ml-4">
                            <p class="text-lg font-medium text-gray-900">{{ $page->author->name }}</p>
                            <p class="text-gray-600">{{ $page->author->bio ?? "Content Author" }}</p>
                        </div>
                    </div>
                </footer>
                </article>',
                'fields' => json_encode([
                    'show_author' => ['type' => 'boolean', 'default' => true],
                    'show_related' => ['type' => 'boolean', 'default' => true],
                    'show_comments' => ['type' => 'boolean', 'default' => false],
                ]),
                'is_active' => true,
                'is_default' => false,
                'created_by' => $user->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($templates as $template) {
            DB::table('cms_templates')->insert($template);
        }

        // Default pages for each company
        $companies = Company::all();
        foreach ($companies as $company) {
            $companySlug = $company->slug ?? Str::slug($company->name);
            $pages = [
                [
                    'title' => 'Welcome to ' . $company->name,
                    'slug' => 'welcome-' . $companySlug,
                    'excerpt' => 'Discover the power of our comprehensive Enterprise Resource Planning solution.',
                    'content' => '<h2>About ' . $company->name . '</h2> ...',
                    'template' => 'default-page',
                    'layout' => 'default',
                    'meta_title' => 'Welcome to ' . $company->name,
                    'meta_description' => 'Discover ' . $company->name . '...',
                    'meta_keywords' => json_encode(['ERP', 'business management', $company->name]),
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $user->id,
                    'language' => 'en',
                    'is_homepage' => true,
                    'show_in_menu' => true,
                    'require_auth' => false,
                    'view_count' => 0,
                    'company_id' => $company->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'About Us',
                    'slug' => 'about-' . $companySlug,
                    'excerpt' => 'Learn more about our company and mission.',
                    'content' => '<h2>Our Story</h2> ...',
                    'template' => 'default-page',
                    'layout' => 'default',
                    'meta_title' => 'About ' . $company->name,
                    'meta_description' => 'Learn about ' . $company->name . '...',
                    'meta_keywords' => json_encode(['about', 'company', $company->name]),
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $user->id,
                    'language' => 'en',
                    'is_homepage' => false,
                    'show_in_menu' => true,
                    'require_auth' => false,
                    'view_count' => 0,
                    'company_id' => $company->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'Contact Us',
                    'slug' => 'contact-' . $companySlug,
                    'excerpt' => 'Get in touch with our team.',
                    'content' => '<h2>Get in Touch</h2> ...',
                    'template' => 'default-page',
                    'layout' => 'default',
                    'meta_title' => 'Contact ' . $company->name,
                    'meta_description' => 'Reach out to ' . $company->name . '...',
                    'meta_keywords' => json_encode(['contact', $company->name]),
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $user->id,
                    'language' => 'en',
                    'is_homepage' => false,
                    'show_in_menu' => true,
                    'require_auth' => false,
                    'view_count' => 0,
                    'company_id' => $company->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];
            foreach ($pages as $page) {
                DB::table('cms_pages')->insert($page);
            }
        }

        // Default menu
        $menuId = DB::table('cms_menus')->insertGetId([
            'name' => 'Main Navigation',
            'slug' => 'main-navigation',
            'description' => 'Primary website navigation menu',
            'location' => 'header',
            'is_active' => true,
            'created_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Menu items
        $menuItems = [
            ['menu_id' => $menuId, 'title' => 'Home', 'url' => '/', 'target' => '_self', 'icon' => 'home', 'is_active' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['menu_id' => $menuId, 'title' => 'About', 'url' => '/about', 'target' => '_self', 'icon' => null, 'is_active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['menu_id' => $menuId, 'title' => 'Contact', 'url' => '/contact', 'target' => '_self', 'icon' => null, 'is_active' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ];

        foreach ($menuItems as $item) {
            DB::table('cms_menu_items')->insert($item);
        }

        // Media folder
        DB::table('cms_media_folders')->insert([
            'name' => 'Sample Images',
            'slug' => 'sample-images',
            'description' => 'Sample images for demonstration',
            'parent_id' => null,
            'sort_order' => 1,
            'created_by' => $user->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('CMS seeder completed successfully!');
    }
}
