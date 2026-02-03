import React from 'react';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import HeroSection from './Sections/HeroSection';
import ServicesSection from './Sections/ServicesSection';
import FeaturesSection from './Sections/FeaturesSection';
import TestimonialsSection from './Sections/TestimonialsSection';
import TeamSection from './Sections/TeamSection';
import StatsSection from './Sections/StatsSection';
import CTASection from './Sections/CTASection';
import GallerySection from './Sections/GallerySection';
import ContactSection from './Sections/ContactSection';
import ContentSection from './Sections/ContentSection';
import HTMLContentSection from './Sections/HTMLContentSection';
import Navigation from './Components/Navigation';
import Footer from './Components/Footer';
import useRoute from '@/Hooks/useRoute';

// Interfaces
interface Company {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    tagline?: string;
    description?: string;
    primary_color: string;
    secondary_color: string;
    address?: string;
    phone?: string;
    email?: string;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    content?: string;
    excerpt?: string;
    template?: string;
    use_html_content?: boolean;
    html_content?: string;
    meta: {
        title: string;
        description?: string;
        keywords?: string;
        'og:title'?: string;
        'og:description'?: string;
        'og:image'?: string;
        canonical?: string;
    };
}

interface Section {
    type: string;
    data: any;
}

interface Media {
    id: number;
    name: string;
    url: string;
    thumbnail: string;
    type: string;
    alt?: string;
    description?: string;
}

interface MenuItem {
    id: number;
    title: string;
    url: string;
    target?: string;
    icon?: string;
    children?: MenuItem[];
}

interface Menu {
    name: string;
    items: MenuItem[];
}

interface Footer {
    menu?: MenuItem[];
    company: {
        name: string;
        logo?: string;
        address?: string;
        phone?: string;
        email?: string;
        description?: string;
    };
    social: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    copyright: string;
}

interface Props {
    company: Company;
    page?: Page | null;
    sections: Section[];
    media?: Media[];
    menu?: Menu | null;
    footer?: Footer;
}

// Map section types to components
const SECTION_COMPONENTS: Record<string, React.ComponentType<any>> = {
    hero: HeroSection,
    services: ServicesSection,
    features: FeaturesSection,
    testimonials: TestimonialsSection,
    team: TeamSection,
    stats: StatsSection,
    cta: CTASection,
    gallery: GallerySection,
    contact: ContactSection,
    content: ContentSection,
    html_content: HTMLContentSection,
};

export default function Landing({ 
    company, 
    page, 
    sections = [], 
    media = [], 
    menu, 
    footer 
}: Props) {
    const pageTitle = page?.meta?.title || page?.title || `Welcome to ${company.name}`;
    const metaDescription = page?.meta?.description || company.description || '';
    const route = useRoute();
    
    console.log( company, 
    page, 
    sections = [], 
    media = [], 
    menu, 
    footer )
    // Set CSS custom properties for theming
    React.useEffect(() => {
        if (company.primary_color) {
            document.documentElement.style.setProperty('--color-primary', company.primary_color);
        }
        if (company.secondary_color) {
            document.documentElement.style.setProperty('--color-secondary', company.secondary_color);
        }
    }, [company.primary_color, company.secondary_color]);

    // HTML Mode: render raw HTML like Page Show/Preview
    if (page?.use_html_content && (page?.html_content || page?.content)) {
        const html = page.html_content || page.content || '';
        return (
            <>
                <Head>
                    <title>{pageTitle}</title>
                    {metaDescription && <meta name="description" content={metaDescription} />}
                    {page?.meta?.['og:title'] && (
                        <meta property="og:title" content={page.meta['og:title']} />
                    )}
                    {page?.meta?.['og:description'] && (
                        <meta property="og:description" content={page.meta['og:description']} />
                    )}
                    {page?.meta?.['og:image'] && (
                        <meta property="og:image" content={page.meta['og:image']} />
                    )}
                    {page?.meta?.canonical && (
                        <link rel="canonical" href={page.meta.canonical} />
                    )}
                </Head>
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                {page?.meta?.['og:title'] && (
                    <meta property="og:title" content={page.meta['og:title']} />
                )}
                {page?.meta?.['og:description'] && (
                    <meta property="og:description" content={page.meta['og:description']} />
                )}
                {page?.meta?.['og:image'] && (
                    <meta property="og:image" content={page.meta['og:image']} />
                )}
                {page?.meta?.canonical && (
                    <link rel="canonical" href={page.meta.canonical} />
                )}
            </Head>
            <div className="landing-page">
                {/* Navigation */}
                {menu && <Navigation menu={menu} company={company} />}

                {/* Dynamic Sections */}
                <main className="landing-main">
                    {sections && sections.length > 0 ? (
                        sections.map((section, index) => {
                            const SectionComponent = SECTION_COMPONENTS[section.type];
                            if (!SectionComponent) {
                                console.warn(`Unknown section type: ${section.type}`);
                                return null;
                            }
                            return (
                                <motion.div
                                    key={`section-${section.type}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.3) }}
                                >
                                    <SectionComponent
                                        {...section.data}
                                        company={company}
                                        media={media}
                                    />
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="no-sections-fallback">
                            <div className="container">
                                <h1>{company.name}</h1>
                                <p>{company.description || 'Welcome to our website'}</p>
                                <div className="mt-6">
                                    <a
                                        href={route('company.pages', { company: company.slug })}
                                        className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded shadow hover:bg-primary/90 transition"
                                    >
                                        View Public Pages
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                {footer && <Footer {...footer} company={company} />}
            </div>

            <style>{`
                .landing-page {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                .landing-main {
                    flex: 1;
                }
                .no-sections-fallback {
                    min-height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 60px 24px;
                }
                .no-sections-fallback .container {
                    max-width: 800px;
                }
                .no-sections-fallback h1 {
                    font-size: clamp(2rem, 5vw, 3.5rem);
                    font-weight: 800;
                    margin-bottom: 20px;
                    color: var(--color-primary, #6366f1);
                }
                .no-sections-fallback p {
                    font-size: 1.25rem;
                    color: #666;
                    line-height: 1.6;
                }
            `}</style>
        </>
    );
}