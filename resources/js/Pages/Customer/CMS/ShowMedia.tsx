import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    ArrowLeft, 
    Download,
    Calendar,
    User,
    FolderOpen,
    FileText,
    Image,
    Video,
    Share2,
    ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface UploadedBy {
    id: number;
    name: string;
    email: string;
}

interface Folder {
    id: number;
    name: string;
    path: string;
}

interface Media {
    id: number;
    name: string;
    file_url?: string;
    file_path: string;
    mime_type: string;
    alt_text?: string;
    description?: string;
    file_size: number;
    usage_count: number;
    uploaded_by?: UploadedBy;
    folder?: Folder;
    created_at: string;
    updated_at: string;
    last_used_at?: string;
}

interface RelatedMedia {
    id: number;
    name: string;
    file_url?: string;
    file_path: string;
    mime_type: string;
    alt_text?: string;
}

interface Props {
    media: Media;
    related_media: RelatedMedia[];
}

export default function ShowMedia({ media, related_media }: Props) {
    const route = useRoute();

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

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: media.name,
                    text: media.description || `${media.name} - ${getMediaTypeLabel(media.mime_type)}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Sharing cancelled or failed');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const fileUrl = media.file_url || `/storage/${media.file_path}`;

    return (
        <CustomerLayout>
            <Head title={media.name} />

            <div className="space-y-6">
                {/* Navigation */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href={route('customer.cms.index')} className="hover:text-foreground">
                        Content
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href={route('customer.cms.media')} className="hover:text-foreground">
                        Media
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground">{media.name}</span>
                </div>

                {/* Back Button */}
                <div>
                    <Link href={route('customer.cms.media')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Media
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
                                        <div className="flex items-center gap-2 mb-2">
                                            {getMediaIcon(media.mime_type)}
                                            <CardTitle className="text-2xl">
                                                {media.name}
                                            </CardTitle>
                                        </div>
                                        {media.description && (
                                            <CardDescription className="text-base">
                                                {media.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={handleShare}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share
                                        </Button>
                                        <a href={fileUrl} download={media.name}>
                                            <Button size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </a>
                                    </div>
                                </div>

                                {/* Meta Information */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4">
                                    <Badge variant="outline">
                                        {getMediaTypeLabel(media.mime_type)}
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Uploaded {formatDate(media.created_at)}</span>
                                    </div>
                                    {media.uploaded_by && (
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>By {media.uploaded_by.name}</span>
                                        </div>
                                    )}
                                    {media.folder && (
                                        <div className="flex items-center gap-1">
                                            <FolderOpen className="h-4 w-4" />
                                            <span>{media.folder.name}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Separator className="mb-6" />
                                
                                {/* Media Preview */}
                                <div className="mb-6">
                                    {media.mime_type.startsWith('image/') ? (
                                        <div className="max-w-full">
                                            <img
                                                src={fileUrl}
                                                alt={media.alt_text || media.name}
                                                className="max-w-full h-auto rounded-lg border"
                                            />
                                        </div>
                                    ) : media.mime_type.startsWith('video/') ? (
                                        <div className="max-w-full">
                                            <video
                                                controls
                                                className="max-w-full h-auto rounded-lg border"
                                            >
                                                <source src={fileUrl} type={media.mime_type} />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-12 border rounded-lg bg-muted">
                                            <div className="text-center">
                                                {getMediaIcon(media.mime_type)}
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    {getMediaTypeLabel(media.mime_type)} file
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Click download to view this file
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="mb-6" />

                                {/* File Information */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h3 className="font-semibold mb-3">File Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">File Name:</span>
                                                <span className="font-medium">{media.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">File Size:</span>
                                                <span className="font-medium">{formatFileSize(media.file_size)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">MIME Type:</span>
                                                <span className="font-medium">{media.mime_type}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Usage Count:</span>
                                                <span className="font-medium">{media.usage_count}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">Upload Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Uploaded:</span>
                                                <span className="font-medium">{formatDateTime(media.created_at)}</span>
                                            </div>
                                            {media.last_used_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Last Used:</span>
                                                    <span className="font-medium">{formatDateTime(media.last_used_at)}</span>
                                                </div>
                                            )}
                                            {media.uploaded_by && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Uploaded By:</span>
                                                    <span className="font-medium">{media.uploaded_by.name}</span>
                                                </div>
                                            )}
                                            {media.folder && (
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Folder:</span>
                                                    <span className="font-medium">{media.folder.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="mt-6 mb-4" />

                                {/* File ID */}
                                <div className="text-xs text-muted-foreground">
                                    File ID: {media.id}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Related Media */}
                        {related_media.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Related Files</CardTitle>
                                    <CardDescription>
                                        Other files from the same folder
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {related_media.map((relatedFile) => (
                                            <Link
                                                key={relatedFile.id}
                                                href={route('customer.cms.media.show', relatedFile.id)}
                                                className="block"
                                            >
                                                <div className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                                                    <div className="flex-shrink-0">
                                                        {relatedFile.mime_type.startsWith('image/') ? (
                                                            <img
                                                                src={relatedFile.file_url || `/storage/${relatedFile.file_path}`}
                                                                alt={relatedFile.alt_text || relatedFile.name}
                                                                className="w-10 h-10 object-cover rounded"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                                                {getMediaIcon(relatedFile.mime_type)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium line-clamp-1">
                                                            {relatedFile.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {getMediaTypeLabel(relatedFile.mime_type)}
                                                        </p>
                                                    </div>
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
                                    <a href={fileUrl} download={media.name}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download File
                                        </Button>
                                    </a>
                                    <Link href={route('customer.cms.media')}>
                                        <Button variant="outline" className="w-full justify-start">
                                            Browse All Media
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
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
