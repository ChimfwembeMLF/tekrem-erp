import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
    Ticket,
    Send,
    ArrowLeft,
    Paperclip,
    X,
    AlertCircle,
    HelpCircle,
    Upload
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { Badge } from '@/Components/ui';
import useTranslate from '@/Hooks/useTranslate';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    categories: Category[];
    priorities: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
}

export default function Create({ categories }: Props) {
    const route = useRoute();
    const { t } = useTranslate();

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        category_id: '',
        subject: '',
        description: '',
        priority: 'medium',
        attachments: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('category_id', data.category_id);
        formData.append('subject', data.subject);
        formData.append('description', data.description);
        formData.append('priority', data.priority);

        data.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        post(route('customer.support.store'), {
            data: formData,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('attachments', [...data.attachments, ...files]);
    };

    const removeFile = (index: number) => {
        const newAttachments = data.attachments.filter((_, i) => i !== index);
        setData('attachments', newAttachments);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // const getPriorityColor = (priority: string) => {
    //     switch (priority) {
    //         case 'high':
    //             return 'text-red-600';
    //         case 'medium':
    //             return 'text-yellow-600';
    //         case 'low':
    //             return 'text-green-600';
    //         default:
    //             return 'text-muted-foreground';
    //     }
    // };

    return (
        <CustomerLayout>
            <Head title="Create Support Ticket" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Support Ticket</h1>
                        <p className="text-muted-foreground">
                            Get help from our support team
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="col-span col-span-2">
                        {/* Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ticket className="h-5 w-5" />
                                    Ticket Details
                                </CardTitle>
                                <CardDescription>
                                    Please provide detailed information about your issue
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="title">{t('support.title', 'Title')} *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder={t('support.title_placeholder', 'Brief description of the issue')}
                                            className={errors.title ? 'border-red-500' : ''}
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">{t('support.description', 'Description')} *</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder={t('support.description_placeholder', 'Detailed description of the issue, steps to reproduce, etc.')}
                                            rows={6}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="category_id">Category</Label>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(value) => setData('category_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            <div>
                                                                <div className="font-medium">{category.name}</div>
                                                                {category.description && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {category.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.category_id && (
                                                <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="priority">{t('support.priority', 'Priority')} *</Label>
                                            <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                                                <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">
                                                        <Badge variant="outline">
                                                            {t('support.priority_low', 'Low')}
                                                        </Badge>
                                                    </SelectItem>
                                                    <SelectItem value="medium">
                                                        <Badge variant="default">
                                                            {t('support.priority_medium', 'Medium')}
                                                        </Badge>
                                                    </SelectItem>
                                                    <SelectItem value="high">
                                                        <Badge variant="secondary">
                                                            {t('support.priority_high', 'High')}
                                                        </Badge>
                                                    </SelectItem>
                                                    <SelectItem value="urgent">
                                                        <Badge variant="destructive">
                                                            {t('support.priority_urgent', 'Urgent')}
                                                        </Badge>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.priority && (
                                                <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex items-center gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            <Send className="mr-2 h-4 w-4" />
                                            {processing ? 'Creating Ticket...' : 'Create Ticket'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.history.back()}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="col-span col-span-1">
                        {/* File Attachments */}
                        {/* File Attachments */}
                        <Card className="sticky top-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Paperclip className="h-4 w-4" />
                                    Attachments
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    PDF, DOC, images, ZIP — max 10MB each
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">

                                {/* Drop Zone */}
                                <Label htmlFor="attachments" className="cursor-pointer block">
                                    <div
                                        className={`
                    relative flex flex-col items-center justify-center gap-2
                    rounded-xl border-2 border-dashed p-6 text-center
                    transition-all duration-200
                    border-muted-foreground/25 hover:border-primary/50
                    hover:bg-primary/5 group
                `}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                Drop files here
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                or <span className="text-primary underline underline-offset-2">browse to upload</span>
                                            </p>
                                        </div>
                                        <Input
                                            id="attachments"
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                                        />
                                    </div>
                                </Label>

                                {/* File List */}
                                {data.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {data.attachments.length} file{data.attachments.length > 1 ? 's' : ''} added
                                        </p>
                                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                            {data.attachments.map((file, index) => {
                                                const isImage = file.type.startsWith('image/');
                                                const url = isImage ? URL.createObjectURL(file) : null;
                                                const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';

                                                return (
                                                    <div
                                                        key={index}
                                                        className="group flex items-center gap-3 rounded-lg border bg-muted/40 p-2.5 hover:bg-muted transition-colors"
                                                    >
                                                        {/* Thumbnail or Icon */}
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-muted border flex items-center justify-center">
                                                            {isImage ? (
                                                                <img
                                                                    src={url!}
                                                                    alt={file.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-muted-foreground">{ext}</span>
                                                            )}
                                                        </div>

                                                        {/* File Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">{file.name}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-0.5">{formatFileSize(file.size)}</p>
                                                        </div>

                                                        {/* Remove */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                            onClick={() => removeFile(index)}
                                                            tabIndex={-1}
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {errors.attachments && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.attachments}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>



                {/* Help Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <HelpCircle className="h-5 w-5" />
                                Before Creating a Ticket
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-medium">Check Our Resources</h4>
                                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                    <li>• Browse our Knowledge Base for common solutions</li>
                                    <li>• Check the FAQ section for quick answers</li>
                                    <li>• Review your account settings and permissions</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Response Times</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    <span className="text-sm"><strong>High Priority:</strong> Within 2 hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                                    <span className="text-sm"><strong>Medium Priority:</strong> Within 24 hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-green-600" />
                                    <span className="text-sm"><strong>Low Priority:</strong> Within 48 hours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout >
    );
}
