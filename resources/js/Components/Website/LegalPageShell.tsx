import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import { FileText, Shield, RotateCcw, Mail, ArrowRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type LegalPageKey = 'privacy' | 'terms' | 'refund';

interface LegalPageShellProps {
  pageKey: LegalPageKey;
  title: string;
  description: string;
  badge: string;
  badgeIcon: string;
  content: string;
  lastUpdated?: string;
}

const pages: Record<
  LegalPageKey,
  { label: string; icon: React.ReactNode; routeName: string }
> = {
  privacy: {
    label: 'Privacy Policy',
    icon: <Shield className="h-4 w-4" />,
    routeName: 'privacy-policy.show',
  },
  terms: {
    label: 'Terms of Service',
    icon: <FileText className="h-4 w-4" />,
    routeName: 'terms.show',
  },
  refund: {
    label: 'Refund Policy',
    icon: <RotateCcw className="h-4 w-4" />,
    routeName: 'refund-policy.show',
  },
};

export default function LegalPageShell({
  pageKey,
  title,
  description,
  badge,
  badgeIcon,
  content,
  lastUpdated = 'June 2026',
}: LegalPageShellProps) {
  const route = useRoute();

  return (
    <GuestLayout title={title}>
      <Head title={title} />

      <WebsiteHero
        badge={badge}
        badgeIcon={badgeIcon}
        title={title}
        description={description}
      />

      <section className="bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="space-y-4 lg:sticky lg:top-28">
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Legal documents</CardTitle>
                    <CardDescription>Browse our policies and terms</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {(Object.keys(pages) as LegalPageKey[]).map((key) => {
                      const page = pages[key];
                      const isActive = key === pageKey;

                      return (
                        <Link
                          key={key}
                          href={route(page.routeName)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {page.icon}
                          {page.label}
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Questions?</CardTitle>
                    <CardDescription>Our team is happy to help clarify anything.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={route('contact')}>
                        <Mail className="mr-2 h-4 w-4" />
                        Contact us
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-8 xl:col-span-9">
              <Card className="overflow-hidden border-border/60 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/40 px-6 py-4 sm:px-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border">
                    <Calendar className="h-3.5 w-3.5" />
                    Last updated {lastUpdated}
                  </div>
                </div>

                <CardContent className="p-6 sm:p-8 lg:p-10">
                  <article
                    className={cn(
                      'prose prose-slate max-w-none dark:prose-invert',
                      'prose-headings:scroll-mt-28 prose-headings:font-semibold prose-headings:tracking-tight',
                      'prose-h1:hidden',
                      'prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:text-xl prose-h2:first:mt-0',
                      'prose-h3:mt-6 prose-h3:mb-2 prose-h3:text-base prose-h3:text-foreground',
                      'prose-p:leading-7 prose-p:text-muted-foreground',
                      'prose-li:text-muted-foreground prose-li:marker:text-primary',
                      'prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                      'prose-strong:text-foreground',
                      'prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic',
                      'prose-hr:border-border'
                    )}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </CardContent>
              </Card>

              {/* Related links */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {(Object.keys(pages) as LegalPageKey[])
                  .filter((key) => key !== pageKey)
                  .map((key) => {
                    const page = pages[key];

                    return (
                      <Link
                        key={key}
                        href={route(page.routeName)}
                        className="group rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {page.icon}
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary">
                          {page.label}
                        </h3>
                        <p className="mt-1 flex items-center text-sm text-muted-foreground">
                          Read document
                          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </p>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </GuestLayout>
  );
}
