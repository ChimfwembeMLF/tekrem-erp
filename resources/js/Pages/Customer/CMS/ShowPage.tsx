import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    ArrowLeft, 
    Calendar,
    Eye,
    User,
    Clock,
    Share2,
    ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Author {
    id: number;
    name: string;
    email: string;
}

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    published_at: string;
    view_count: number;
    language?: string;
    meta_title?: string;
    meta_description?: string;
    author?: Author;
    created_at: string;
    updated_at: string;
}

interface RelatedPage {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
}

interface Props {
    page: Page;
    related_pages: RelatedPage[];
}

export default function ShowPage({ page, related_pages }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: page.title,
                    text: page.excerpt,
                    url: window.location.href,
                });
            } catch (error) {
                // User cancelled sharing or error occurred
                console.log('Sharing cancelled or failed');
            }
        } else {
            // Fallback: copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    return (
        <CustomerLayout>
            <Head 
                title={page.meta_title || page.title}
                description={page.meta_description || page.excerpt}
            />

            <div className="space-y-6">
                {/* Navigation */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={route('customer.cms.index')} className="hover:text-foreground">
                        Content
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={route('customer.cms.pages')} className="hover:text-foreground">
                        Pages
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{page.title}</span>
                </div>

                {/* Back Button */}
                <div>
                    <Link href={route('customer.cms.pages')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Pages
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl mb-2">
                                            {page.title}
                                        </CardTitle>
                                        {page.excerpt && (
                                            <CardDescription className="text-lg">
                                                {page.excerpt}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleShare}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </div>

                                {/* Meta Information */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Published {formatDate(page.published_at)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4" />
                                        <span>{page.view_count} views</span>
                                    </div>
                                    {page.author && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>By {page.author.name}</span>
                                        </div>
                                    )}
                                    {page.language && (
                                        <Badge variant="outline">
                                            {page.language.toUpperCase()}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Separator className="mb-6" />
                                
                                {/* Page Content */}
                                <div 
                                    className="prose prose-gray max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />

                                <Separator className="mt-8 mb-6" />

                                {/* Page Info */}
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Last updated: {formatDateTime(page.updated_at)}</span>
                                    </div>
                                    <div>Page ID: {page.id}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Related Pages */}
                        {related_pages.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Related Pages</CardTitle>
                                    <CardDescription>
                                        You might also be interested in
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {related_pages.map((relatedPage) => (
                                            <Link
                                                key={relatedPage.id}
                                                href={route('customer.cms.pages.show', relatedPage.slug)}
                                                className="block"
                                            >
                                                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                                        {relatedPage.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {relatedPage.excerpt}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Link href={route('customer.cms.pages')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            Browse All Pages
                                        </Button>
                                    </Link>
                                    <Link href={route('customer.cms.search')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            Search Content
                                        </Button>
                                    </Link>
                                    <Link href={route('customer.cms.index')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            Content Portal
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Page Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Page Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Views:</span>
                                        <span className="font-medium">{page.view_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Published:</span>
                                        <span className="font-medium">{formatDate(page.published_at)}</span>
                                    </div>
                                    {page.language && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Language:</span>
                                            <span className="font-medium">{page.language.toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
