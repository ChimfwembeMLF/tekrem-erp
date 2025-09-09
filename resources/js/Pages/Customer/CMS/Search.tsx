import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Separator } from '@/Components/ui/separator';
import { 
    ArrowLeft, 
    Search as SearchIcon, 
    FileText,
    Image,
    Video,
    Calendar,
    Eye,
    ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    published_at: string;
}

interface Media {
    id: number;
    name: string;
    file_url?: string;
    file_path: string;
    mime_type: string;
    alt_text?: string;
}

interface Props {
    pages: Page[];
    media: Media[];
    query: string;
}

export default function Search({ pages, media, query }: Props) {
    const route = useRoute();
    const [searchQuery, setSearchQuery] = useState(query);

    useEffect(() => {
        setSearchQuery(query);
    }, [query]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('customer.cms.search'), { q: searchQuery.trim() });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getMediaIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return <Image className="h-4 w-4" />;
        } else if (mimeType.startsWith('video/')) {
            return <Video className="h-4 w-4" />;
        }
        return <FileText className="h-4 w-4" />;
    };

    const getMediaTypeLabel = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return 'Image';
        if (mimeType.startsWith('video/')) return 'Video';
        return 'Document';
    };

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                    {part}
                </mark>
            ) : part
        );
    };

    const totalResults = pages.length + media.length;

    return (
        <CustomerLayout>
            <Head title={`Search: ${query}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.cms.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Content
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Search Content</h1>
                        <p className="text-muted-foreground">
                            Find pages, media, and resources
                        </p>
                    </div>
                </div>

                {/* Search Form */}
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search for content..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit">
                                <SearchIcon className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {query ? (
                    <div className="space-y-6">
                        {/* Results Summary */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Search Results for "{query}"
                                </h2>
                                <p className="text-muted-foreground">
                                    Found {totalResults} result{totalResults !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {totalResults > 0 ? (
                            <div className="space-y-8">
                                {/* Pages Results */}
                                {pages.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">
                                                Pages ({pages.length})
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {pages.map((page) => (
                                                <Link
                                                    key={page.id}
                                                    href={route('customer.cms.pages.show', page.slug)}
                                                >
                                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                        <CardContent className="p-6">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-lg mb-2">
                                                                        {highlightText(page.title, query)}
                                                                    </h4>
                                                                    <p className="text-muted-foreground mb-3 line-clamp-2">
                                                                        {highlightText(page.excerpt, query)}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="h-3 w-3" />
                                                                            <span>{formatDate(page.published_at)}</span>
                                                                        </div>
                                                                        <Badge variant="outline">Page</Badge>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Media Results */}
                                {media.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Image className="h-5 w-5" />
                                            <h3 className="text-lg font-semibold">
                                                Media ({media.length})
                                            </h3>
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {media.map((file) => (
                                                <Link
                                                    key={file.id}
                                                    href={route('customer.cms.media.show', file.id)}
                                                >
                                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                        <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                                                            {file.mime_type.startsWith('image/') ? (
                                                                <img
                                                                    src={file.file_url || `/storage/${file.file_path}`}
                                                                    alt={file.alt_text || file.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    {getMediaIcon(file.mime_type)}
                                                                    <span className="text-xs text-center px-2">
                                                                        {getMediaTypeLabel(file.mime_type)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h4 className="font-medium text-sm line-clamp-1 mb-2">
                                                                {highlightText(file.name, query)}
                                                            </h4>
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {getMediaTypeLabel(file.mime_type)}
                                                                </Badge>
                                                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="text-center py-12">
                                    <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        No content matches your search for "{query}".
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">Try:</p>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                            <li>• Using different keywords</li>
                                            <li>• Checking your spelling</li>
                                            <li>• Using more general terms</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Search Content</h3>
                            <p className="text-muted-foreground mb-6">
                                Enter a search term to find pages, media, and other content.
                            </p>
                            
                            {/* Quick Search Suggestions */}
                            <div className="max-w-md mx-auto">
                                <h4 className="text-sm font-medium mb-3">Popular searches:</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('documentation');
                                            router.get(route('customer.cms.search'), { q: 'documentation' });
                                        }}
                                    >
                                        Documentation
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('guide');
                                            router.get(route('customer.cms.search'), { q: 'guide' });
                                        }}
                                    >
                                        Guide
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery('tutorial');
                                            router.get(route('customer.cms.search'), { q: 'tutorial' });
                                        }}
                                    >
                                        Tutorial
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Browse Content</CardTitle>
                        <CardDescription>
                            Explore content by category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Link href={route('customer.cms.pages')}>
                                <Button variant="outline" className="w-full justify-start h-auto p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">All Pages</div>
                                            <div className="text-xs text-muted-foreground">Browse published content</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href={route('customer.cms.media')}>
                                <Button variant="outline" className="w-full justify-start h-auto p-4">
                                    <div className="flex items-center gap-3">
                                        <Image className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Media Gallery</div>
                                            <div className="text-xs text-muted-foreground">Browse files and images</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
