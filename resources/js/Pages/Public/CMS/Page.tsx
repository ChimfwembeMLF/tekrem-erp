import React from 'react';
import { Head, Link } from '@inertiajs/react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

interface Company {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

interface PageModel {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  html_content?: string;
  use_html_content?: boolean;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  template?: string;
  view_count?: number;
}

interface Breadcrumb {
  title: string;
  slug: string;
}

interface Props {
  page: PageModel;
  company: Company;
  relatedPages: PageModel[];
  menu: { id: number; title: string; slug: string; }[];
  breadcrumbs: Breadcrumb[];
}

export default function PublicCMSPage({ page, company, relatedPages, menu, breadcrumbs }: Props) {
  const metaTitle = page.meta_title || page.title;
  const metaDescription = page.meta_description || page.excerpt || '';

  console.log('page.html_content',page.html_content);
  // Sanitize HTML content for safe rendering
  const sanitizeHtml = (html: string) => {
    return DOMPurify.sanitize(html, { 
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'class', 'id', 'style']
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Head title={metaTitle}>
        {metaDescription && <meta name="description" content={metaDescription} />}
      </Head>

      <header className="border-b bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={route('company.home', { company: company.slug })} className="font-semibold text-lg">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="h-8" />
            ) : (
              <span>{company.name}</span>
            )}
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
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            {breadcrumbs.map((b, i) => (
              <span key={`${b.slug}-${i}`}>
                <Link href={route('company.pages.show', { company: company.slug, page: b.slug })} className="hover:text-primary">
                  {b.title}
                </Link>
                {i < breadcrumbs.length - 1 && ' / '}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
        {page.excerpt && <p className="text-muted-foreground mb-6">{page.excerpt}</p>}

        <div className="prose prose-sm md:prose lg:prose-lg dark:prose-invert max-w-none">
          {page.use_html_content && page.html_content ? (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.html_content) }}
              className="prose prose-sm md:prose lg:prose-lg dark:prose-invert max-w-none"
            />
          ) : page.content ? (
            <ReactMarkdown>{page.content}</ReactMarkdown>
          ) : (
            <p className="text-sm text-muted-foreground">No content available.</p>
          )}
        </div>

        {/* Related Pages */}
        {relatedPages && relatedPages.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3">Related Pages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedPages.map(rp => (
                <Link key={rp.id} href={route('company.pages.show', { company: company.slug, page: rp.slug })} className="block border rounded p-3 hover:border-primary">
                  <div className="font-medium">{rp.title}</div>
                  {rp.excerpt && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{rp.excerpt}</div>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
