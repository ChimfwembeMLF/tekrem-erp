import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface Cta {
  label: string;
  href: string;
}

interface WebsiteHeroProps {
  badge?: string;
  badgeIcon?: string;
  title: string;
  highlight?: string;
  description: string;
  image?: string;
  imageAlt?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  children?: React.ReactNode;
}

export default function WebsiteHero({
  badge,
  badgeIcon,
  title,
  highlight,
  description,
  image,
  imageAlt = '',
  primaryCta,
  secondaryCta,
  children,
}: WebsiteHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/15 to-secondary/15 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-secondary/15 to-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            {badge && (
              <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary dark:bg-primary/20 dark:text-secondary">
                {badgeIcon && <span className="mr-2">{badgeIcon}</span>}
                {badge}
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              <span className="block">{title}</span>
              {highlight && (
                <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  {highlight}
                </span>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">{description}</p>

            {(primaryCta || secondaryCta) && (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {primaryCta && (
                  <Button asChild size="lg" className="bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                    <Link href={primaryCta.href}>
                      {primaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}

            {children}
          </div>

          {image && (
            <div className="mt-12 lg:col-span-6 lg:mt-0">
              <div className="relative">
                <img src={image} alt={imageAlt} className="w-full rounded-xl object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
