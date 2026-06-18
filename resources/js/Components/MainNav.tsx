import React from 'react';
import { Link } from '@inertiajs/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/Components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';

interface MainNavProps {
  settings: Record<string, unknown>;
}

export default function MainNav({ settings: _settings }: MainNavProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();

  const linkClass = (active: boolean) =>
    cn(
      navigationMenuTriggerStyle(),
      active
        ? 'bg-primary font-medium text-primary-foreground hover:bg-primary'
        : 'bg-transparent hover:bg-primary/10 hover:text-primary'
    );

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={route('home')} className={linkClass(isActive(route('home'), true))}>
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={route('about')} className={linkClass(isActive(route('about')))}>
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={linkClass(isActive(route('services')))}>
            Services
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary to-primary/80 p-6 no-underline outline-none"
                    href={route('services')}
                  >
                    <div className="mb-2 text-lg font-medium text-white">Our Services</div>
                    <p className="text-sm text-white/90">Web, mobile, AI, and cloud for African businesses</p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <ListItem href={route('services.web-development')} title="Web Development">
                Websites and web applications
              </ListItem>
              <ListItem href={route('services.mobile-apps')} title="Mobile Apps">
                iOS and Android solutions
              </ListItem>
              <ListItem href={route('services.ai-solutions')} title="AI Solutions">
                Automation and intelligent tools
              </ListItem>
              <ListItem href={route('services.cloud-services')} title="Cloud Services">
                Migration and managed cloud
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={route('pricing')} className={linkClass(isActive(route('pricing')))}>
              Pricing
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={linkClass(
              isActive(route('guest.inquiry.create')) ||
                isActive(route('guest.quote.create')) ||
                isActive(route('guest.support.index'))
            )}
          >
            Get Started
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[420px]">
              <ListItem href={route('guest.inquiry.create')} title="General Inquiry">
                Ask a question or get more information
              </ListItem>
              <ListItem href={route('guest.quote.create')} title="Request Quote">
                Get a tailored ZMW quote
              </ListItem>
              <ListItem href={route('guest.project.create')} title="Project Consultation">
                Discuss your project requirements
              </ListItem>
              <ListItem href={route('guest.support.index')} title="Support Center">
                Help articles and tickets
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={route('faq')} className={linkClass(isActive(route('faq')))}>
              FAQ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={route('contact')} className={linkClass(isActive(route('contact')))}>
              Contact
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
);
