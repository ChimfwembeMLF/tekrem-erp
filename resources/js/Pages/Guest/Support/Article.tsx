import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { FileText } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category?: { name: string; slug: string };
}

interface Props {
  article: Article;
  relatedArticles: Array<{ id: number; title: string; slug: string; excerpt: string }>;
}

export default function Article({ article, relatedArticles }: Props) {
  const route = useRoute();

  return (
    <GuestLayout title={article.title}>
      <Head title={article.title} />
      <GuestPageHero title={article.title} description={article.excerpt} icon={<FileText className="h-6 w-6" />} />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardContent className="prose prose-neutral max-w-none py-8 dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </CardContent>
        </Card>

        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Related articles</h2>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Card key={related.id}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">
                      <Link href={route('guest.support.article', related.slug)} className="hover:text-primary">
                        {related.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Button asChild variant="outline" className="mt-8">
          <Link href={route('guest.support.knowledge-base')}>Back to knowledge base</Link>
        </Button>
      </div>
    </GuestLayout>
  );
}
