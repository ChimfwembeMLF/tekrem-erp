import React from 'react';
import { Head, Link } from '@inertiajs/react';

interface Company { id: number; name: string; slug: string; }
interface PageModel { id: number; title: string; slug: string; excerpt?: string; }

interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface Props {
  company: Company;
  pages: Pagination<PageModel>;
  searchTerm: string;
  menu: { id: number; title: string; slug: string; }[];
}

export default function PublicCMSSearch({ company, pages, searchTerm, menu }: Props) {
  const items = pages?.data || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head title={`Search: ${searchTerm}`} />

      <header className="border-b bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={route('company.home', { company: company.slug })} className="font-semibold text-lg">
            {company.name}
          </Link>
          <nav className="flex gap-4 text-sm">
            {menu.map(item => (
              <Link key={item.id} href={route('company.pages.show', { company: company.slug, page: item.slug })} className="hover:text-primary">
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Search Results</h1>
        <p className="text-sm text-muted-foreground mb-6">Showing results for: "{searchTerm}"</p>

        <div className="space-y-3">
          {items.map(p => (
            <div key={p.id} className="border rounded p-4">
              <Link href={route('company.pages.show', { company: company.slug, page: p.slug })} className="font-semibold hover:text-primary">
                {p.title}
              </Link>
              {p.excerpt && <p className="text-sm text-muted-foreground mt-1">{p.excerpt}</p>}
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No results found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
