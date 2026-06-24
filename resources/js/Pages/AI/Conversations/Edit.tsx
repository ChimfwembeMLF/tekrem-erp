import React from 'react';
import {  Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    MessageSquare,
    Bot,
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    Archive
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { AIFormShell, ModuleFormSection, ModuleFormGrid, ModuleFormField } from '@/Components/Module/moduleFormWrappers';

interface Conversation {
    id: number;
    title: string;
    context_type: string | null;
    context_id: number | null;
    messages: Array<{
        role: string;
        content: string;
        timestamp: string;
    }>;
    total_tokens: number;
    total_cost: number;
    message_count: number;
    last_message_at: string;
    is_archived: boolean;
    metadata?: Record<string, any>;
    user: {
        id: number;
        name: string;
        email: string;
    };
    ai_model: {
        id: number;
        name: string;
        type: string;
        service: {
            name: string;
            provider: string;
        };
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    conversation: Conversation;
}

interface FormData {
    title: string;
    metadata: Record<string, any>;
}

export default function Edit({ conversation }: Props) {
    const { t } = useTranslate();

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        title: conversation.title,
        metadata: conversation.metadata || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ai.conversations.update', conversation.id));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZM', {
            style: 'currency',
            currency: 'ZMW',
            minimumFractionDigits: 4,
        }).format(amount);
    };

    const getContextColor = (contextType: string | null) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[contextType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AIFormShell
            title={t('Edit Conversation')}
            description={t('Update conversation details and settings')}
            backHref={route('ai.conversations.show', conversation.id)}
            backLabel={t('Back to Conversation')}
            icon={<MessageSquare className="h-7 w-7" />}
            onSubmit={handleSubmit}
            processing={processing}
            submitLabel={t('Save Changes')}
            maxWidth="4xl"
        >
            <ModuleFormSection title={t('Conversation Information')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">{t('AI Model')}</Label>
                        <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{conversation.ai_model.name}</span>
                            <Badge variant="outline">{conversation.ai_model.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                            {conversation.ai_model.service.name} ({conversation.ai_model.service.provider})
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">{t('Context')}</Label>
                        <div className="flex items-center space-x-2">
                            {conversation.context_type ? (
                                <>
                                    <Badge className={getContextColor(conversation.context_type)}>
                                        {conversation.context_type.toUpperCase()}
                                    </Badge>
                                    {conversation.context_id && (
                                        <span className="text-sm text-gray-600">ID: {conversation.context_id}</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-sm text-gray-500">{t('No context')}</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">{t('Statistics')}</Label>
                        <div className="space-y-1 text-sm">
                            <div>{t('Messages')}: <span className="font-medium">{conversation.message_count}</span></div>
                            <div>{t('Tokens')}: <span className="font-medium">{conversation.total_tokens.toLocaleString()}</span></div>
                            <div>{t('Cost')}: <span className="font-medium">{formatCurrency(conversation.total_cost)}</span></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">{t('Dates')}</Label>
                        <div className="space-y-1 text-sm">
                            <div>{t('Created')}: <span className="font-medium">{formatDate(conversation.created_at)}</span></div>
                            <div>{t('Last Message')}: <span className="font-medium">{formatDate(conversation.last_message_at)}</span></div>
                        </div>
                    </div>
                </div>
                {conversation.is_archived && (
                    <Alert className="mt-4">
                        <Archive className="h-4 w-4" />
                        <AlertDescription>{t('This conversation is currently archived.')}</AlertDescription>
                    </Alert>
                )}
            </ModuleFormSection>

            <ModuleFormSection title={t('Edit Details')} description={t('Update the conversation title and metadata')}>
                <ModuleFormField label={t('Conversation Title')} htmlFor="title" error={errors.title} required>
                    <Input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder={t('Enter a descriptive title for this conversation')}
                    />
                </ModuleFormField>
                <div className="mt-5 space-y-2">
                    <Label className="text-sm font-medium text-gray-600">{t('Metadata')}</Label>
                    <div className="rounded-md bg-gray-50 p-3">
                        {Object.keys(data.metadata).length > 0 ? (
                            <pre className="overflow-x-auto rounded border bg-white p-2 text-xs">
                                {JSON.stringify(data.metadata, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-sm italic text-gray-500">{t('No metadata available')}</p>
                        )}
                    </div>
                </div>
            </ModuleFormSection>

            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {t('Please fix the following errors:')}
                        <ul className="mt-2 list-inside list-disc">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field} className="text-sm">{message}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </AIFormShell>
    );
}
