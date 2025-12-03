import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    FileText,
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    Plus,
    X,
    Hash,
    Eye
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
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
    tags: string[];
}

interface Props {
    template: PromptTemplate;
}

interface FormData {
    name: string;
    slug: string;
    category: string;
    description: string;
    template: string;
    variables: string[];
    is_public: boolean;
    tags: string[];
}

export default function Edit({ template }: Props) {
    const { t } = useTranslate();
    const route = useRoute();
    const [newVariable, setNewVariable] = useState('');
    const [newTag, setNewTag] = useState('');
    const [previewMode, setPreviewMode] = useState(false);

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: template.name,
        slug: template.slug,
        category: template.category,
        description: template.description,
        template: template.template,
        variables: template.variables || [],
        is_public: template.is_public,
        tags: template.tags || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ai.prompt-templates.update', template.id), {
            onSuccess: () => {
                // Success handled by backend
            },
        });
    };

    const addVariable = () => {
        if (newVariable.trim() && !data.variables.includes(newVariable.trim())) {
            setData('variables', [...data.variables, newVariable.trim()]);
            setNewVariable('');
        }
    };

    const removeVariable = (variable: string) => {
        setData('variables', data.variables.filter(v => v !== variable));
    };

    const addTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData('tags', [...data.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setData('tags', data.tags.filter(t => t !== tag));
    };

    const extractVariables = () => {
        const regex = /\{\{([^}]+)\}\}/g;
        const matches = [...data.template.matchAll(regex)];
        const extractedVars = matches.map(match => match[1].trim());
        const uniqueVars = [...new Set(extractedVars)];
        setData('variables', uniqueVars);
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

    return (
        <AppLayout
            title={t('Edit Prompt Template')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.prompt-templates.show', template.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Template')}
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {t('Edit Prompt Template')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Update template configuration and content')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? t('Edit Mode') : t('Preview Mode')}
                        </Button>
                    </div>
                </div>
            )}
        >
            <Head title={t('Edit Prompt Template')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* System Template Warning */}
                        {template.is_system && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('This is a system template. Changes may affect core functionality.')}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    {t('Basic Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Template identification and categorization')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('Template Name')} *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t('Enter template name')}
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">{t('Slug')} *</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) => setData('slug', e.target.value)}
                                            placeholder={t('template-slug')}
                                            required
                                        />
                                        {errors.slug && (
                                            <p className="text-sm text-red-600">{errors.slug}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('Description')} *</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('Describe what this template does...')}
                                        rows={3}
                                        required
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">{t('Category')} *</Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) => setData('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('Select category')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="crm">
                                                    <Badge className={getCategoryColor('crm')}>CRM</Badge>
                                                </SelectItem>
                                                <SelectItem value="finance">
                                                    <Badge className={getCategoryColor('finance')}>Finance</Badge>
                                                </SelectItem>
                                                <SelectItem value="support">
                                                    <Badge className={getCategoryColor('support')}>Support</Badge>
                                                </SelectItem>
                                                <SelectItem value="marketing">
                                                    <Badge className={getCategoryColor('marketing')}>Marketing</Badge>
                                                </SelectItem>
                                                <SelectItem value="general">
                                                    <Badge className={getCategoryColor('general')}>General</Badge>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center justify-between">
                                            <span>{t('Public Template')}</span>
                                            <Switch
                                                checked={data.is_public}
                                                onCheckedChange={(checked) => setData('is_public', checked)}
                                            />
                                        </Label>
                                        <p className="text-xs text-gray-600">
                                            {t('Allow other users to see and use this template')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Template Content */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center">
                                            <FileText className="h-5 w-5 mr-2" />
                                            {t('Template Content')}
                                        </CardTitle>
                                        <CardDescription>
                                            {t('Use {{variable}} syntax for dynamic values')}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={extractVariables}
                                    >
                                        <Hash className="h-4 w-4 mr-2" />
                                        {t('Extract Variables')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {previewMode ? (
                                    <div className="bg-gray-50 p-4 rounded-lg border min-h-[200px]">
                                        <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
                                            {data.template}
                                        </pre>
                                    </div>
                                ) : (
                                    <Textarea
                                        value={data.template}
                                        onChange={(e) => setData('template', e.target.value)}
                                        placeholder={t('Enter your prompt template with {{variables}}...')}
                                        rows={12}
                                        className="font-mono text-sm"
                                        required
                                    />
                                )}
                                {errors.template && (
                                    <p className="text-sm text-red-600">{errors.template}</p>
                                )}
                                <p className="text-xs text-gray-600">
                                    {t('Character count')}: {data.template.length}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Variables */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Hash className="h-5 w-5 mr-2" />
                                    {t('Template Variables')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Define variables that can be used in the template')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        value={newVariable}
                                        onChange={(e) => setNewVariable(e.target.value)}
                                        placeholder={t('Variable name (e.g., client_name)')}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                                    />
                                    <Button type="button" onClick={addVariable} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {data.variables.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {data.variables.map((variable, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {variable}
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariable(variable)}
                                                    className="ml-2 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {t('No variables added yet. Click "Extract Variables" to detect them automatically.')}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Tags')}</CardTitle>
                                <CardDescription>
                                    {t('Add tags to help categorize and search for this template')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex space-x-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder={t('Add a tag...')}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" onClick={addTag} variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {data.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {data.tags.map((tag, index) => (
                                            <Badge key={index} variant="outline">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-2 hover:text-red-600"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <Link href={route('ai.prompt-templates.show', template.id)}>
                                <Button type="button" variant="outline">
                                    {t('Cancel')}
                                </Button>
                            </Link>

                            <div className="flex items-center space-x-2">
                                {processing && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t('Saving changes...')}
                                    </div>
                                )}
                                <Button
                                    type="submit"
                                    disabled={processing || !data.name || !data.template}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {t('Save Changes')}
                                </Button>
                            </div>
                        </div>

                        {/* Validation Errors */}
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('Please fix the following errors:')}
                                    <ul className="mt-2 list-disc list-inside">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field} className="text-sm">{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
