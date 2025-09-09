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
    Image,
    FileText,
    Video,
    Download,
    Filter,
    Grid3X3,
    List
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Media {
    id: number;
    name: string;
    file_url?: string;
    file_path: string;
    mime_type: string;
    alt_text?: string;
    description?: string;
    file_size: number;
    created_at: string;
}

interface PaginationData {
    data: Media[];
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

interface Stats {
    total_images: number;
    total_videos: number;
    total_documents: number;
}

interface Props {
    media: PaginationData;
    stats: Stats;
    filters: {
        search?: string;
        type?: string;
    };
}

export default function Media({ media, stats, filters }: Props) {
    const route = useRoute();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.get(route('customer.cms.media'), {
            search: searchQuery || undefined,
            type: filters.type || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTypeFilter = (type: string) => {
        router.get(route('customer.cms.media'), {
            search: filters.search || undefined,
            type: type === 'all' ? undefined : type,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    return (
        <CustomerLayout>
            <Head title="Media Gallery" />

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
                            <h1 className="text-3xl font-bold tracking-tight">Media Gallery</h1>
                            <p className="text-muted-foreground">
                                Browse and download public media files
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Images</CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_images}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Videos</CardTitle>
                            <Video className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_videos}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_documents}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search media files..."
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
                                    value={filters.type || 'all'}
                                    onValueChange={handleTypeFilter}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="images">Images</SelectItem>
                                        <SelectItem value="videos">Videos</SelectItem>
                                        <SelectItem value="documents">Documents</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(filters.search || filters.type) && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {filters.search && (
                                    <Badge variant="secondary">
                                        Search: "{filters.search}"
                                    </Badge>
                                )}
                                {filters.type && (
                                    <Badge variant="secondary">
                                        Type: {filters.type}
                                    </Badge>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get(route('customer.cms.media'))}
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="space-y-4">
                    {media.data.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {media.from}-{media.to} of {media.total} files
                                </p>
                            </div>

                            {viewMode === 'grid' ? (
                                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                    {media.data.map((file) => (
                                        <Link
                                            key={file.id}
                                            href={route('customer.cms.media.show', file.id)}
                                        >
                                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                                <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
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
                                                <CardContent className="p-3">
                                                    <p className="text-sm font-medium line-clamp-1 mb-1">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.file_size)}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {media.data.map((file) => (
                                        <Card key={file.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0">
                                                        {file.mime_type.startsWith('image/') ? (
                                                            <img
                                                                src={file.file_url || `/storage/${file.file_path}`}
                                                                alt={file.alt_text || file.name}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                                {getMediaIcon(file.mime_type)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={route('customer.cms.media.show', file.id)}
                                                            className="font-medium hover:underline"
                                                        >
                                                            {file.name}
                                                        </Link>
                                                        {file.description && (
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {file.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                            <span>{getMediaTypeLabel(file.mime_type)}</span>
                                                            <span>{formatFileSize(file.file_size)}</span>
                                                            <span>{formatDate(file.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <a
                                                            href={file.file_url || `/storage/${file.file_path}`}
                                                            download={file.name}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Button variant="outline" size="sm">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {media.last_page > 1 && (
                                <div className="flex items-center justify-center space-x-2 pt-4">
                                    {media.links.map((link, index) => {
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
                                <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No media found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {filters.search || filters.type
                                        ? "No media files match your search criteria."
                                        : "No media files are available at the moment."
                                    }
                                </p>
                                {(filters.search || filters.type) && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => router.get(route('customer.cms.media'))}
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
