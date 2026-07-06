import React from 'react';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';
import { ThemeToggle } from '@/Components/ThemeProvider';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';

interface MobileNavProps {
  settings: Record<string, unknown>;
}

export default function MobileNav({ settings: _settings }: MobileNavProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();
  const page = useTypedPage();

  const navItems = [
    { href: route('home'), label: 'Home' },
    { href: route('about'), label: 'About' },
    { href: route('services'), label: 'Services' },
    { href: route('erp.plans'), label: 'ERP Plans' },
    { href: route('organization.signup'), label: 'Start ERP trial' },
    { href: route('pricing'), label: 'Pricing' },
    { href: route('faq'), label: 'FAQ' },
    { href: route('guest.inquiry.create'), label: 'Inquiry' },
    { href: route('guest.quote.create'), label: 'Get a Quote' },
    { href: route('shop.index'), label: 'Shop' },
    { href: route('contact'), label: 'Contact' },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-inherit">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-auto w-full rounded-b-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ApplicationMark />
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 flex flex-col gap-4">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-md px-4 py-2 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="px-4 py-2">
              {page.props.auth.user ? (
                <Link
                  href={route('dashboard')}
                  className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href={route('login')}
                    className="flex w-full items-center justify-center rounded-md border px-4 py-2 shadow-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href={route('register')}
                    className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-secondary to-primary px-4 py-2 text-white shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
