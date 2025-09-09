import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
    ArrowLeft,
    Download,
    FileText,
    Image,
    File,
    Calendar,
    User,
    HardDrive,
    Paperclip
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    is_visible_to_client: boolean;
    description?: string;
    created_at: string;
    uploadedBy: {
        id: number;
        name: string;
    };
}

interface Project {
    id: number;
    name: string;
    description: string;
}

interface Props {
    project: Project;
    attachments: Attachment[];
}

export default function Files({ project, attachments }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return <Image className="h-5 w-5" />;
        } else if (fileType.includes('pdf') || fileType.includes('document')) {
            return <FileText className="h-5 w-5" />;
        } else {
            return <File className="h-5 w-5" />;
        }
    };

    const getFileTypeVariant = (fileType: string) => {
        if (fileType.startsWith('image/')) {
            return 'secondary';
        } else if (fileType.includes('pdf')) {
            return 'destructive';
        } else if (fileType.includes('document') || fileType.includes('text')) {
            return 'default';
        } else {
            return 'outline';
        }
    };

    const handleDownload = (attachment: Attachment) => {
        window.open(route('customer.projects.attachments.download', [project.id, attachment.id]), '_blank');
    };

    const totalSize = attachments.reduce((sum, file) => sum + file.file_size, 0);
    const imageFiles = attachments.filter(file => file.file_type.startsWith('image/'));
    const documentFiles = attachments.filter(file => file.file_type.includes('pdf') || file.file_type.includes('document'));
    const otherFiles = attachments.filter(file => !file.file_type.startsWith('image/') && !file.file_type.includes('pdf') && !file.file_type.includes('document'));

    return (
        <CustomerLayout>
            <Head title={`${project.name} - Files`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.projects.show', project.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Files</h1>
                        <p className="text-muted-foreground">
                            Download and view project files shared with you
                        </p>
                    </div>
                </div>

                {/* File Statistics */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{attachments.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Images</CardTitle>
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{imageFiles.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documents</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{documentFiles.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Files List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Files</CardTitle>
                        <CardDescription>
                            Files and documents shared with you for this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {attachments.length > 0 ? (
                                attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex-shrink-0">
                                                {getFileIcon(attachment.file_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium truncate">{attachment.file_name}</h4>
                                                    <Badge variant={getFileTypeVariant(attachment.file_type)} className="text-xs">
                                                        {attachment.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                                                    </Badge>
                                                </div>
                                                {attachment.description && (
                                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                        {attachment.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <HardDrive className="h-3 w-3" />
                                                        {formatFileSize(attachment.file_size)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(attachment.created_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {attachment.uploadedBy.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownload(attachment)}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Paperclip className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No files available</h3>
                                    <p className="text-muted-foreground">
                                        No files have been shared with you for this project yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* File Categories */}
                {attachments.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Images */}
                        {imageFiles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Image className="h-5 w-5" />
                                        Images ({imageFiles.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {imageFiles.slice(0, 5).map((file) => (
                                            <div key={file.id} className="flex items-center justify-between text-sm">
                                                <span className="truncate flex-1">{file.file_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {imageFiles.length > 5 && (
                                            <div className="text-xs text-muted-foreground text-center py-2">
                                                +{imageFiles.length - 5} more images
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Documents */}
                        {documentFiles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Documents ({documentFiles.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {documentFiles.slice(0, 5).map((file) => (
                                            <div key={file.id} className="flex items-center justify-between text-sm">
                                                <span className="truncate flex-1">{file.file_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {documentFiles.length > 5 && (
                                            <div className="text-xs text-muted-foreground text-center py-2">
                                                +{documentFiles.length - 5} more documents
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Other Files */}
                        {otherFiles.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <File className="h-5 w-5" />
                                        Other Files ({otherFiles.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {otherFiles.slice(0, 5).map((file) => (
                                            <div key={file.id} className="flex items-center justify-between text-sm">
                                                <span className="truncate flex-1">{file.file_name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {otherFiles.length > 5 && (
                                            <div className="text-xs text-muted-foreground text-center py-2">
                                                +{otherFiles.length - 5} more files
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
