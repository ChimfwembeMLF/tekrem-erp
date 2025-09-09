import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    Search, 
    Book, 
    ArrowLeft, 
    Eye,
    Filter,
    FileText,
    ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Article {
    id: number;
    title: string;
    excerpt: string;
    view_count: number;
    created_at: string;
    category?: {
        id: number;
        name: string;
        color: string;
    };
}

interface Category {
    id: number;
    name: string;
    color: string;
}

interface PaginationData {
    data: Article[];
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
    articles: PaginationData;
    categories: Category[];
    query: string;
    selectedCategory?: number;
}

export default function KnowledgeBase({ articles, categories, query, selectedCategory }: Props) {
    const route = useRoute();
    const [searchQuery, setSearchQuery] = useState(query);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('customer.support.knowledge-base.index'), {
            q: searchQuery || undefined,
            category_id: selectedCategory || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCategoryFilter = (categoryId: string) => {
        router.get(route('customer.support.knowledge-base.index'), {
            q: query || undefined,
            category_id: categoryId === 'all' ? undefined : categoryId,
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
            <Head title="Knowledge Base" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.support.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Support
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                            <p className="text-muted-foreground">
                                Find answers to common questions and helpful guides
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
                                        placeholder="Search articles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>

                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <Select
                                    value={selectedCategory?.toString() || 'all'}
                                    onValueChange={handleCategoryFilter}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(query || selectedCategory) && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {query && (
                                    <Badge variant="secondary">
                                        Search: "{query}"
                                    </Badge>
                                )}
                                {selectedCategory && (
                                    <Badge variant="secondary">
                                        Category: {categories.find(c => c.id === selectedCategory)?.name}
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(route('customer.support.knowledge-base.index'))}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    {articles.data.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {articles.from}-{articles.to} of {articles.total} articles
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {articles.data.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={route('customer.support.knowledge-base.show', article.id)}
                                    >
                                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg line-clamp-2">
                                                            {article.title}
                                                        </CardTitle>
                                                        {article.category && (
                                                            <Badge 
                                                                variant="outline" 
                                                                className="mt-2"
                                                                style={{ 
                                                                    backgroundColor: article.category.color + '20', 
                                                                    color: article.category.color 
                                                                }}
                                                            >
                                                                {article.category.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription className="line-clamp-3 mb-4">
                                                    {article.excerpt}
                                                </CardDescription>
                                                
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        <span>{article.view_count} views</span>
                                                    </div>
                                                    <span>{formatDate(article.created_at)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {articles.last_page > 1 && (
                                <div className="flex items-center justify-center space-x-2 pt-4">
                                    {articles.links.map((link, index) => {
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
                                <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {query || selectedCategory
                                        ? "No articles match your search criteria."
                                        : "No articles are available at the moment."
                                    }
                                </p>
                                {(query || selectedCategory) && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => router.get(route('customer.support.knowledge-base.index'))}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Categories Overview */}
                {!query && !selectedCategory && categories.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Browse by Category</CardTitle>
                            <CardDescription>
                                Explore articles organized by topic
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant="outline"
                                        className="justify-start h-auto p-4"
                                        onClick={() => handleCategoryFilter(category.id.toString())}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <span>{category.name}</span>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
