import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import AppProvider from '@/Providers/AppProvider';
import { useTheme, ThemeToggle } from '@/Components/ThemeProvider';
import { Button } from '@/Components/ui/button.jsx';
import MobileNav from '@/Components/MobileNav';
import MainNav from '@/Components/MainNav';
import GuestChatWidget from '@/Components/GuestChat/GuestChatWidget';
import BreadcrumbNavigation from '@/Components/BreadcrumbNavigation';
import { Contact, Facebook, Instagram, Linkedin, MailIcon, Settings2Icon, Twitter, X } from 'lucide-react';

interface Props {
  title: string;
  showHeader?: boolean;
}

interface Setting {
  site_name: string,
  font_family: string,
}

export default function GuestLayout({
  title,
  showHeader = true,
  children,
}: PropsWithChildren<Props>) {
  const page = useTypedPage();
  const route = useRoute();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  // Get settings from Inertia shared props
  const settings: any = page.props.settings || {};
  const currentRoute = route().current() ?? '';
  const showBreadcrumbs = currentRoute.startsWith('shop.');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10); // trigger blur after 10px scroll
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // console.log(settings);
  return (
    <AppProvider>
      <div className={`${settings.font_family || 'font-sans'}`}>
        <Head title={title} />

        {/* Modern Header */}
        {showHeader && (
          <header
            className={`sticky top-0 z-50 w-full shadow-sm transition-all duration-300 ${scrolled
              ? 'backdrop-blur-sm bg-white/90 dark:bg-gray-900/30'
              : 'bg-transparent  text-gray-200'
              }`}
          >
            {/* <div className="transition-colors duration-300">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-2 text-md">
                  <div className="flex items-center gap-4 font-medium">
                    <div className="flex items-center gap-1">
                      <MailIcon className="w-4 h-4" />
                      <span className="hidden md:inline">{settings.company_email || 'hello@tekrem.com'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Contact className="w-4 h-4" />
                      <span className="hidden md:inline">{settings.company_phone || '+260 976607840'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href="#" className="hover:text-blue-600 transition-colors duration-200">
                      <Facebook className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="hover:text-blue-400 transition-colors duration-200">
                      <Twitter className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="hover:text-pink-500 transition-colors duration-200">
                      <Instagram className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="hover:text-blue-700 transition-colors duration-200">
                      <Linkedin className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="container mx-auto px-4 py-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-4">
                  <MobileNav settings={settings} />
                  <Link href={route('home')} className="flex-shrink-0">
                    <ApplicationMark />
                  </Link>
                </div>

                <div className="hidden md:flex items-center">
                  <MainNav settings={settings} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex">
                    <ThemeToggle />
                  </div>

                  <div className="flex items-center gap-3">
                    {page.props.auth.user ? (
                      <Button asChild className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                        <Link href={route('dashboard')}>Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" asChild className="hidden md:flex">
                          <Link href={route('login')}>Login</Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                          <Link href={route('register')}>Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className='-mt-28'>
          {showBreadcrumbs && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
              <BreadcrumbNavigation className="mb-4" />
            </div>
          )}
          {children}
        </main>

        {/* Modern Footer */}
        <footer className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
          {/* Glass overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" /> */}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <Link href={route('home')} className="inline-flex items-center mb-6">
                  <ApplicationMark />
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                  {settings.company_name || 'Technology Remedies Innovations'} - Empowering businesses across Africa with cutting-edge technology solutions and unparalleled security.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-700 hover:text-white transition-all duration-300">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Solutions */}
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">Solutions</h3>
                <ul className="space-y-4">
                  <li><Link href={route('services.web-development')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Web Development</Link></li>
                  <li><Link href={route('services.mobile-apps')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Mobile Applications</Link></li>
                  <li><Link href={route('services.ai-solutions')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">AI Solutions</Link></li>
                  <li><Link href={route('services.cloud-services')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Cloud Services</Link></li>
                  <li><Link href={route('pricing')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Pricing</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-6">Resources</h3>
                <ul className="space-y-4">
                  <li><Link href={route('faq')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
                  <li><Link href={route('guest.support.index')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Support Center</Link></li>
                  <li><Link href={route('guest.quote.create')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Request a Quote</Link></li>
                  <li><Link href={route('careers.index')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Careers</Link></li>
                  <li><Link href={route('shop.index')} className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">Shop</Link></li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} {settings.company_name || 'Technology Remedies Innovations'}. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm">
                  <Link
                    href={route('privacy-policy.show')}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href={route('terms.show')}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href={route('refund-policy.show')}
                    className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200"
                  >
                    Refund Policy
                  </Link>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>{settings.company_address || 'Lusaka, Zambia'}</span>
                <span>{settings.company_phone || '+260 976607840'}</span>
                <span>{settings.company_email || 'hello@tekrem.com'}</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Guest Chat Widget */}
        <GuestChatWidget />
      </div>
    </AppProvider>
  );
}
