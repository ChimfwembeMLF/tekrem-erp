import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
    FileText, 
    Image, 
    Search,
    Eye,
    Calendar,
    ChevronRight,
    Menu as MenuIcon,
    TrendingUp
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Page {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    published_at: string;
    view_count: number;
}

interface Media {
    id: number;
    name: string;
    file_url?: string;
    file_path: string;
    mime_type: string;
    alt_text?: string;
}

interface MenuItem {
    id: number;
    title: string;
    url: string;
    sort_order: number;
    children?: MenuItem[];
}

interface Menu {
    id: number;
    name: string;
    items: MenuItem[];
}

interface Stats {
    total_pages: number;
    total_media: number;
    recent_views: number;
}

interface Props {
    recent_pages: Page[];
    recent_media: Media[];
    customer_menu?: Menu;
    stats: Stats;
}

export default function Index({ recent_pages, recent_media, customer_menu, stats }: Props) {
    const route = useRoute();

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
        }
        return <FileText className="h-4 w-4" />;
    };

    return (
        <CustomerLayout>
            <Head title="Content Portal" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Content Portal</h1>
                        <p className="text-muted-foreground">
                            Access published content, media, and resources
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href={route('customer.cms.search')}>
                            <Button variant="outline">
                                <Search className="mr-2 h-4 w-4" />
                                Search Content
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Pages</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_pages}</div>
                            <p className="text-xs text-muted-foreground">
                                Published content pages
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Media Files</CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_media}</div>
                            <p className="text-xs text-muted-foreground">
                                Public media files
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Views</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.recent_views}</div>
                            <p className="text-xs text-muted-foreground">
                                Views in last 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Pages */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Pages</CardTitle>
                                    <CardDescription>
                                        Latest published content
                                    </CardDescription>
                                </div>
                                <Link href={route('customer.cms.pages')}>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_pages.length > 0 ? (
                                    recent_pages.map((page) => (
                                        <Link
                                            key={page.id}
                                            href={route('customer.cms.pages.show', page.slug)}
                                            className="block"
                                        >
                                            <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm line-clamp-1 mb-1">
                                                        {page.title}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                        {page.excerpt}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(page.published_at)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {page.view_count} views
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <FileText className="mx-auto h-8 w-8 mb-2" />
                                        <p>No pages available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Media */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Media</CardTitle>
                                    <CardDescription>
                                        Latest uploaded files
                                    </CardDescription>
                                </div>
                                <Link href={route('customer.cms.media')}>
                                    <Button variant="outline" size="sm">
                                        View Gallery
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                {recent_media.length > 0 ? (
                                    recent_media.map((media) => (
                                        <Link
                                            key={media.id}
                                            href={route('customer.cms.media.show', media.id)}
                                            className="block"
                                        >
                                            <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                                {media.mime_type.startsWith('image/') ? (
                                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                                        <img
                                                            src={media.file_url || `/storage/${media.file_path}`}
                                                            alt={media.alt_text || media.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                                        {getMediaIcon(media.mime_type)}
                                                    </div>
                                                )}
                                                <div className="p-2">
                                                    <p className="text-xs font-medium line-clamp-1">
                                                        {media.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-6 text-muted-foreground">
                                        <Image className="mx-auto h-8 w-8 mb-2" />
                                        <p>No media available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common content-related tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                            <Link href={route('customer.cms.pages')}>
                                <Button variant="outline" className="w-full justify-start h-auto p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Browse Pages</div>
                                            <div className="text-xs text-muted-foreground">View all content</div>
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
                                            <div className="text-xs text-muted-foreground">Browse files</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <Link href={route('customer.cms.search')}>
                                <Button variant="outline" className="w-full justify-start h-auto p-4">
                                    <div className="flex items-center gap-3">
                                        <Search className="h-5 w-5" />
                                        <div className="text-left">
                                            <div className="font-medium">Search Content</div>
                                            <div className="text-xs text-muted-foreground">Find anything</div>
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            {customer_menu && (
                                <Link href={route('customer.cms.menu')}>
                                    <Button variant="outline" className="w-full justify-start h-auto p-4">
                                        <div className="flex items-center gap-3">
                                            <MenuIcon className="h-5 w-5" />
                                            <div className="text-left">
                                                <div className="font-medium">Navigation</div>
                                                <div className="text-xs text-muted-foreground">Site menu</div>
                                            </div>
                                        </div>
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
