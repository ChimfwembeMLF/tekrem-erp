import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AppLayout from '@/Layouts/AppLayout';
import {
    FileText,
    ArrowLeft,
    Edit,
    Copy,
    Trash2,
    Globe,
    Lock,
    Star,
    TrendingUp,
    Hash,
    AlertCircle,
    Calendar,
    User,
    Tag
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface PromptTemplate {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string;
    template: string;
    variables: string[];
    is_public: boolean;
    is_system: boolean;
    usage_count: number;
    avg_rating: number | null;
    tags: string[];
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    template: PromptTemplate;
}

export default function Show({ template }: Props) {
    const { t } = useTranslate();
    const route = useRoute();
    const [activeTab, setActiveTab] = useState('template');
    const { props } = usePage<any>();

    // Handle flash messages
    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const duplicateTemplate = async () => {
        try {
            const response = await (window as any).axios.post(route('ai.prompt-templates.duplicate', template.id));

            if (response.data.success) {
                toast.success(response.data.message);
                router.visit(route('ai.prompt-templates.edit', response.data.template.id));
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Failed to duplicate template');
        }
    };

    const deleteTemplate = () => {
        if (confirm(t('Are you sure you want to delete this template?'))) {
            router.delete(route('ai.prompt-templates.destroy', template.id), {
                onSuccess: () => {
                    toast.success(t('Template deleted successfully'));
                    router.visit(route('ai.prompt-templates.index'));
                },
                onError: () => toast.error(t('Failed to delete template')),
            });
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            marketing: 'bg-purple-100 text-purple-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const renderStars = (rating: number | null) => {
        if (!rating) return null;

        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
        }

        return <div className="flex items-center space-x-0.5">{stars}</div>;
    };

    return (
        <AppLayout
            title={template.name}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.prompt-templates.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Templates')}
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    {template.name}
                                </h2>
                                {template.is_system && (
                                    <Badge variant="default">{t('System')}</Badge>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{template.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={duplicateTemplate}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('Duplicate')}
                        </Button>
                        <Link href={route('ai.prompt-templates.edit', template.id)}>
                            <Button size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                {t('Edit')}
                            </Button>
                        </Link>
                        {!template.is_system && (
                            <Button variant="destructive" size="sm" onClick={deleteTemplate}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('Delete')}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        >
            <Head title={template.name} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Template Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t('Category')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={getCategoryColor(template.category)}>
                                    {template.category.toUpperCase()}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t('Visibility')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    {template.is_public ? (
                                        <>
                                            <Globe className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">{t('Public')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4 text-gray-600" />
                                            <span className="text-gray-600">{t('Private')}</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">{t('Usage Stats')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{template.usage_count} {t('uses')}</span>
                                    </div>
                                    {template.avg_rating && (
                                        <div className="flex items-center space-x-2">
                                            {renderStars(template.avg_rating)}
                                            <span className="text-sm text-gray-600">
                                                ({template.avg_rating.toFixed(1)})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="template">{t('Template')}</TabsTrigger>
                            <TabsTrigger value="variables">{t('Variables')}</TabsTrigger>
                            <TabsTrigger value="metadata">{t('Metadata')}</TabsTrigger>
                        </TabsList>

                        {/* Template Content */}
                        <TabsContent value="template" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="h-5 w-5 mr-2" />
                                        {t('Template Content')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('The prompt template with variable placeholders')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-50">
                                            {template.template}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Variables */}
                        <TabsContent value="variables" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Hash className="h-5 w-5 mr-2" />
                                        {t('Template Variables')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('Available variables for this template')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {template.variables.length > 0 ? (
                                        <div className="space-y-3">
                                            {template.variables.map((variable, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                                                    <Hash className="h-4 w-4 text-gray-500" />
                                                    <code className="font-mono text-sm">{`{{${variable}}}`}</code>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                {t('No variables defined for this template')}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Metadata */}
                        <TabsContent value="metadata" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <User className="h-5 w-5 mr-2" />
                                            {t('Author Information')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center space-x-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {template.user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{template.user.name}</div>
                                                <div className="text-sm text-gray-600">{template.user.email}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Calendar className="h-5 w-5 mr-2" />
                                            {t('Timestamps')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div>
                                            <div className="text-sm text-gray-600">{t('Created')}</div>
                                            <div className="text-sm font-medium">
                                                {new Date(template.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">{t('Last Updated')}</div>
                                            <div className="text-sm font-medium">
                                                {new Date(template.updated_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {template.tags && template.tags.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Tag className="h-5 w-5 mr-2" />
                                            {t('Tags')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {template.tags.map((tag, index) => (
                                                <Badge key={index} variant="outline">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
