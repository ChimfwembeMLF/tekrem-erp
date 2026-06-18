import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { BookOpen } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category?: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
  articles_count: number;
}

interface Props {
  articles: { data: Article[]; links: unknown[] };
  categories: Category[];
  filters: { search?: string; category?: string };
}

export default function KnowledgeBase({ articles, categories, filters }: Props) {
  const route = useRoute();

  return (
    <GuestLayout title="Knowledge Base">
      <Head title="Knowledge Base" />
      <GuestPageHero
        title="Knowledge base"
        description="Guides and answers from our support team."
        icon={<BookOpen className="h-6 w-6" />}
      />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <form method="get" className="mb-8 flex gap-3">
          <Input name="search" defaultValue={filters.search} placeholder="Search articles..." className="max-w-md" />
          <Button type="submit">Search</Button>
        </form>

        <div className="mb-8 flex flex-wrap gap-2">
          <Button asChild variant={!filters.category ? 'default' : 'outline'} size="sm">
            <Link href={route('guest.support.knowledge-base')}>All</Link>
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              asChild
              variant={filters.category === cat.slug ? 'default' : 'outline'}
              size="sm"
            >
              <Link href={`${route('guest.support.knowledge-base')}?category=${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {articles.data.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link href={route('guest.support.article', article.slug)} className="hover:text-primary">
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription>{article.excerpt}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {articles.data.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No articles found.</CardContent>
          </Card>
        )}
      </div>
    </GuestLayout>
  );
}
