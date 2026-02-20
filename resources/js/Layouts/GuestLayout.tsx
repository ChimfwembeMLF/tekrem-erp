import React, { PropsWithChildren } from 'react';
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
import { Facebook, Instagram, Linkedin, Twitter, X } from 'lucide-react';

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

  // Get settings from Inertia shared props
  const settings: any = page.props.settings || {};

  // console.log(settings);
  return (
    <AppProvider>
      <div className={`min-h-screen ${settings.font_family || 'font-sans'}`}>
        <Head title={title} />

        {/* Modern Header */}
        {showHeader && (
          <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200/50 dark:border-gray-800/50">
            {/* Top Bar */}
            <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-2 text-sm">
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <span className="hidden md:inline">📧 {settings.company_email || 'hello@tekrem.com'}</span>
                    <span className="hidden md:inline">📞 {settings.company_phone || '+260 976607840'}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link className="hover:text-blue-600 transition-colors duration-200" href="#">
                      <Facebook className='w-4 h-4' />
                    </Link>
                    <Link className="hover:text-blue-400 transition-colors duration-200" href="#">
                      <Twitter className='w-4 h-4' />
                    </Link>
                    <Link className="hover:text-pink-500 transition-colors duration-200" href="#">
                      <Instagram className='w-4 h-4' />
                    </Link>
                    <Link className="hover:text-blue-700 transition-colors duration-200" href="#">
                      <Linkedin className='w-4 h-4' />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <MobileNav settings={settings} />
                  <Link href={route('home')} className="flex-shrink-0">
                    <ApplicationMark />
                  </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center">
                  <MainNav settings={settings} />
                </div>

                {/* Right side items */}
                <div className="flex items-center gap-4">
                  {/* Theme Toggle */}
                  <div className="hidden md:flex">
                    <ThemeToggle />
                  </div>

                  {/* Auth Links */}
                  <div className="flex items-center gap-3">
                    {page.props.auth.user ? (
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Link href={route('dashboard')}>
                          Dashboard
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="ghost" asChild className="hidden md:flex">
                          <Link href={route('login')}>
                            Login
                          </Link>
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                          <Link href={route('register')}>
                            Get Started
                          </Link>
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
        <main>{children}</main>

        {/* Modern Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-2">
                <Link href={route('home')} className="inline-flex items-center mb-6">
                  <ApplicationMark />
                </Link>
                <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                  {settings.company_name || 'Technology Remedies Innovations'} - Empowering businesses across Africa with cutting-edge technology solutions and unparalleled security.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all duration-300">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all duration-300">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-700 hover:text-white transition-all duration-300">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all duration-300">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Solutions */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-6">Solutions</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Network Security</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cloud Infrastructure</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Web Development</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Mobile Applications</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">AI & Analytics</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-white font-semibold text-lg mb-6">Resources</h3>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Case Studies</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Security Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Support Portal</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Blog</a></li>
                </ul>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="border-t border-gray-800 pt-12 mb-12">
              <div className="max-w-md">
                <h3 className="text-white font-semibold text-lg mb-4">Stay Updated</h3>
                <p className="text-gray-400 mb-6">Get the latest news and insights delivered to your inbox.</p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} {settings.company_name || 'Technology Remedies Innovations'}. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</a>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
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
