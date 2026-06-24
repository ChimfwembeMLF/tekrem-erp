<?php

namespace App\Support;

class ServicesCatalogue
{
    /**
     * Official Tekrem service catalogue — keep in sync with resources/js/Data/servicesData.ts
     *
     * @return array<string, array{id: string, title: string, short_description: string, icon: string, price: string, price_note: ?string}>
     */
    public static function all(): array
    {
        return [
            'website-development' => [
                'id' => 'website-development',
                'title' => 'Website Development',
                'short_description' => 'Design and development of custom websites',
                'icon' => '💻',
                'price' => 'K 5,000 – 25,000+',
                'price_note' => null,
            ],
            'mobile-app-development' => [
                'id' => 'mobile-app-development',
                'title' => 'Mobile App Development',
                'short_description' => 'Android/iOS app design and development',
                'icon' => '📱',
                'price' => 'K 15,000 – 50,000+',
                'price_note' => null,
            ],
            'digital-marketing' => [
                'id' => 'digital-marketing',
                'title' => 'Digital Marketing',
                'short_description' => 'Social media management, SEO, Google Ads, content creation',
                'icon' => '📣',
                'price' => 'K 2,000 – 10,000',
                'price_note' => '/month',
            ],
            'graphic-design' => [
                'id' => 'graphic-design',
                'title' => 'Graphic Design',
                'short_description' => 'Logos, brochures, flyers, banners, branding kits',
                'icon' => '🎨',
                'price' => 'K 500 – 5,000',
                'price_note' => null,
            ],
            'software-solutions' => [
                'id' => 'software-solutions',
                'title' => 'Software Solutions',
                'short_description' => 'Custom software development (POS, inventory, ERP systems, etc.)',
                'icon' => '⚙️',
                'price' => 'K 10,000 – 100,000+',
                'price_note' => null,
            ],
            'ict-consultancy' => [
                'id' => 'ict-consultancy',
                'title' => 'ICT Consultancy',
                'short_description' => 'IT infrastructure setup, audits, networking',
                'icon' => '🏢',
                'price' => 'K 1,500 – 15,000+',
                'price_note' => null,
            ],
            'computer-network-support' => [
                'id' => 'computer-network-support',
                'title' => 'Computer & Network Support',
                'short_description' => 'Troubleshooting, maintenance, installation, and repair services',
                'icon' => '🔧',
                'price' => 'K 300 – 5,000',
                'price_note' => null,
            ],
            'photography-videography' => [
                'id' => 'photography-videography',
                'title' => 'Photography & Videography',
                'short_description' => 'Corporate events, product shoots, drone footage, and editing',
                'icon' => '🎬',
                'price' => 'K 1,000 – 15,000',
                'price_note' => null,
            ],
            'training-capacity-building' => [
                'id' => 'training-capacity-building',
                'title' => 'Training & Capacity Building',
                'short_description' => 'ICT skills training for institutions and individuals',
                'icon' => '🎓',
                'price' => 'K 500 – 10,000+',
                'price_note' => null,
            ],
            'domain-hosting' => [
                'id' => 'domain-hosting',
                'title' => 'Domain & Hosting Services',
                'short_description' => 'Domain registration, shared/VPS hosting, email setup',
                'icon' => '🌐',
                'price' => 'K 600 – 3,000+',
                'price_note' => '/year',
            ],
        ];
    }

    /** @return list<string> */
    public static function ids(): array
    {
        return array_keys(self::all());
    }

    public static function find(string $id): ?array
    {
        return self::all()[$id] ?? null;
    }

    /** @return list<array{id: string, title: string, short_description: string, icon: string, price: string, price_note: ?string}> */
    public static function forFrontend(): array
    {
        return array_values(self::all());
    }
}
