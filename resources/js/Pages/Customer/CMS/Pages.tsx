import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    ArrowLeft, 
    Search, 
    FileText,
    Eye,
    Calendar,
    ChevronRight,
    Filter
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    published_at: string;
    view_count: number;
    language?: string;
}

interface PaginationData {
    data: Page[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
}

interface Props {
    pages: PaginationData;
    languages: string[];
    filters: {
        search?: string;
        language?: string;
    };
}

export default function Pages({ pages, languages, filters }: Props) {
    const route = useRoute();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('customer.cms.pages'), {
            search: searchQuery || undefined,
            language: filters.language || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleLanguageFilter = (language: string) => {
        router.get(route('customer.cms.pages'), {
            search: filters.search || undefined,
            language: language === 'all' ? undefined : language,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <CustomerLayout>
            <Head title="Content Pages" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.cms.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Content
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Content Pages</h1>
                            <p className="text-muted-foreground">
                                Browse published content and resources
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search pages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>

                            {languages.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <Select
                                        value={filters.language || 'all'}
                                        onValueChange={handleLanguageFilter}
                                    >
                                        <SelectTrigger className="w-48">
                                            <SelectValue placeholder="All Languages" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Languages</SelectItem>
                                            {languages.map((language) => (
                                                <SelectItem key={language} value={language}>
                                                    {language.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {(filters.search || filters.language) && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {filters.search && (
                                    <Badge variant="secondary">
                                        Search: "{filters.search}"
                                    </Badge>
                                )}
                                {filters.language && (
                                    <Badge variant="secondary">
                                        Language: {filters.language.toUpperCase()}
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(route('customer.cms.pages'))}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    {pages.data.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {pages.from}-{pages.to} of {pages.total} pages
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pages.data.map((page) => (
                                    <Link
                                        key={page.id}
                                        href={route('customer.cms.pages.show', page.slug)}
                                    >
                                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg line-clamp-2">
                                                            {page.title}
                                                        </CardTitle>
                                                        {page.language && (
                                                            <Badge variant="outline" className="mt-2">
                                                                {page.language.toUpperCase()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="line-clamp-3 mb-4">
                                                    {page.excerpt}
                                                </CardDescription>
                                                
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(page.published_at)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        <span>{page.view_count} views</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages.last_page > 1 && (
                                <div className="flex items-center justify-center space-x-2 pt-4">
                                    {pages.links.map((link, index) => {
                                        if (link.label === '&laquo; Previous') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Previous
                                                </Button>
                                            );
                                        }
                                        
                                        if (link.label === 'Next &raquo;') {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                >
                                                    Next
                                                </Button>
                                            );
                                        }
                                        
                                        if (link.label.includes('...')) {
                                            return (
                                                <span key={index} className="px-2 text-muted-foreground">
                                                    ...
                                                </span>
                                            );
                                        }
                                        
                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                            >
                                                {link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No pages found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {filters.search || filters.language
                                        ? "No pages match your search criteria."
                                        : "No pages are available at the moment."
                                    }
                                </p>
                                {(filters.search || filters.language) && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => router.get(route('customer.cms.pages'))}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
