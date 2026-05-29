import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/ui/sheet';
import {
    ArrowLeft,
    Clock,
    FileText,
    Paperclip,
    MessageCircle,
    MoreVertical,
    Plus,
    Search,
    Send,
    Sparkles,
    Users,
    X,
} from 'lucide-react';

interface ConversationUser {
    id: number;
    name: string;
    email?: string;
    profile_photo_url?: string;
}

interface ConversationType {
    id: number;
    title: string;
    conversable_type?: string;
    status: string;
    priority?: string;
    last_message_at: string;
    unread_count?: number;
    created_at: string;
}

interface MessageType {
    id: number;
    conversation_id: number;
    message: string;
    user_id: number;
    user?: ConversationUser;
    attachments?: Array<{
        name?: string;
        file_name?: string;
        path?: string;
        file_path?: string;
        size?: number;
        file_size?: number;
        type?: string;
        mime_type?: string;
        url?: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface MessageAttachment {
    name?: string;
    file_name?: string;
    path?: string;
    file_path?: string;
    size?: number;
    file_size?: number;
    type?: string;
    mime_type?: string;
    url?: string;
}

interface PaginatedConversations {
    data: ConversationType[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface Props {
    conversations: PaginatedConversations;
    filters: Record<string, any>;
    selectedConversation?: ConversationType;
    messages?: MessageType[];
    auth: { user: ConversationUser };
}

const STATUS_CLASSES: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    resolved: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    closed: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASSES[status?.toLowerCase()] ?? STATUS_CLASSES.closed}`}>
        {status}
    </span>
);

const Avatar: React.FC<{ name?: string; photoUrl?: string; size?: 'sm' | 'md' }> = ({ name, photoUrl, size = 'md' }) => {
    const safeName = name ?? '';
    const initials = safeName
        .split(' ')
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || '?';
    const palette = [
        'bg-violet-200 text-violet-800 dark:bg-violet-900/60 dark:text-violet-200',
        'bg-teal-200 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
        'bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
        'bg-sky-200 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
        'bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
    ];
    const color = palette[(safeName.charCodeAt(0) || 0) % palette.length];
    const dim = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-10 w-10 text-[13px]';

    if (photoUrl) {
        return <img src={photoUrl} alt={safeName} className={`flex-shrink-0 rounded-full object-cover ${dim}`} />;
    }

    return (
        <div className={`flex-shrink-0 rounded-full flex items-center justify-center font-semibold select-none ${dim} ${color}`}>
            {initials}
        </div>
    );
};

const EmptyState: React.FC<{ label: string; sublabel?: string }> = ({ label, sublabel }) => (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center select-none pointer-events-none">
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
            <MessageCircle className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {sublabel && <p className="text-xs text-zinc-400 dark:text-zinc-500">{sublabel}</p>}
    </div>
);

function formatTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);

    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatFull(value?: string): string {
    if (!value) return '';
    return new Date(value).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CustomerConversationsIndex({ conversations, selectedConversation, messages, auth }: Props) {
    const route = useRoute();
    const currentUserId = auth.user.id;

    const [activeConversation, setActiveConversation] = useState<ConversationType | null>(selectedConversation ?? conversations.data[0] ?? null);
    const [activeMessages, setActiveMessages] = useState<MessageType[]>(messages ?? []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
    const [searchQuery, setSearchQuery] = useState('');
    const [newConversationOpen, setNewConversationOpen] = useState(false);
    const [newConversationTitle, setNewConversationTitle] = useState('');
    const [creatingConversation, setCreatingConversation] = useState(false);
    const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);
    const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
    const [conversationMediaSheetOpen, setConversationMediaSheetOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!newConversationOpen) {
            setNewConversationTitle('');
        }
    }, [newConversationOpen]);

    const filteredConversations = useMemo(
        () => conversations.data.filter((conversation) => (conversation.title ?? '').toLowerCase().includes(searchQuery.toLowerCase())),
        [conversations.data, searchQuery]
    );

    const conversationAttachments = useMemo(() => {
        return activeMessages.flatMap((message) =>
            (message.attachments ?? []).map((attachment, index) => ({
                messageId: message.id,
                messageAuthor: message.user?.name ?? 'Support',
                messageCreatedAt: message.created_at,
                attachment,
                index,
            }))
        );
    }, [activeMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    useEffect(() => {
        if (selectedConversation) {
            setActiveConversation(selectedConversation);
        }
    }, [selectedConversation?.id]);

    useEffect(() => {
        if (messages) {
            setActiveMessages(messages);
        }
    }, [messages]);

    const buildAttachmentUrl = (attachment: MessageAttachment) => {
        const path = attachment.url ?? attachment.file_path ?? attachment.path;
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path;
        return `/storage/${path}`;
    };

    const getAttachmentName = (attachment: MessageAttachment, fallbackIndex: number) =>
        attachment.file_name ?? attachment.name ?? `Attachment ${fallbackIndex + 1}`;

    const getAttachmentType = (attachment: MessageAttachment) =>
        attachment.mime_type ?? attachment.type ?? '';

    const isImageAttachment = (attachment: MessageAttachment) =>
        getAttachmentType(attachment).startsWith('image/');

    const getAttachmentPreviewUrl = (file: File) => URL.createObjectURL(file);

    const getFileSizeLabel = (sizeInBytes?: number) => {
        if (!sizeInBytes) return '';
        if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        return `${(sizeInBytes / 1024 / 1024).toFixed(1)} MB`;
    };

    const handleAttachmentSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedAttachments(Array.from(event.target.files ?? []));
    };

    const handleSelectConversation = (conversation: ConversationType) => {
        setActiveConversation(conversation);
        setActiveMessages([]);
        setSidebarOpen(false);

        fetch(`/customer/conversations/${conversation.id}/messages`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
            .then((data: MessageType[]) => setActiveMessages(data))
            .catch(() => setActiveMessages([]));

        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSendMessage = async (event: React.FormEvent) => {
        event.preventDefault();

        if ((!newMessage.trim() && selectedAttachments.length === 0) || !activeConversation || sending) return;

        setSending(true);
        const optimistic: MessageType = {
            id: Date.now(),
            conversation_id: activeConversation.id,
            message: newMessage.trim(),
            user_id: currentUserId,
            user: auth.user,
            attachments: selectedAttachments.map((file) => ({
                name: file.name,
                file_name: file.name,
                type: file.type,
                mime_type: file.type,
                size: file.size,
                file_size: file.size,
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        setActiveMessages((previous) => [...previous, optimistic]);
        setNewMessage('');

        try {
            const axios = (await import('axios')).default;
            const payload = new FormData();
            payload.append('message', optimistic.message || ' ');
            selectedAttachments.forEach((file) => payload.append('attachments[]', file));

            const { data } = await axios.post(route('customer.conversations.messages.store', activeConversation.id), payload);

            if (data?.chat) {
                setActiveMessages((previous) => previous.map((message) => (message.id === optimistic.id ? data.chat : message)));
            }

            setSelectedAttachments([]);
            if (attachmentInputRef.current) {
                attachmentInputRef.current.value = '';
            }
        } catch {
            setActiveMessages((previous) => previous.filter((message) => message.id !== optimistic.id));
            setNewMessage(optimistic.message);
            setSelectedAttachments([]);
            if (attachmentInputRef.current) {
                attachmentInputRef.current.value = '';
            }
            toast.error('Failed to send message');
        } finally {
            setSending(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    };

    const handleCreateConversation = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newConversationTitle.trim()) return;

        setCreatingConversation(true);
        try {
            const axios = (await import('axios')).default;
            const { data: conversation } = await axios.post('/customer/conversations', { title: newConversationTitle });
            setActiveConversation(conversation);
            setActiveMessages([]);
            setNewConversationOpen(false);
            setNewConversationTitle('');
            toast.success('Conversation created!');
        } catch {
            toast.error('Failed to create conversation');
        } finally {
            setCreatingConversation(false);
        }
    };

    const clearSelectedAttachments = () => {
        setSelectedAttachments([]);
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
    };

    const removeSelectedAttachment = (indexToRemove: number) => {
        setSelectedAttachments((previous) => previous.filter((_, index) => index !== indexToRemove));
        if (attachmentInputRef.current) {
            attachmentInputRef.current.value = '';
        }
    };

    const renderSelectedAttachmentTile = (file: File, index: number) => {
        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? getAttachmentPreviewUrl(file) : null;

        return (
            <button
                key={`${file.name}-${index}`}
                type="button"
                onClick={() => setMediaSheetOpen(true)}
                className="group relative h-16 w-16 overflow-hidden rounded-xl border border-zinc-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                title={`${file.name}${file.type ? ` (${file.type})` : ''}${file.size ? ` - ${getFileSizeLabel(file.size)}` : ''}`}
            >
                <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    {previewUrl ? (
                        <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
                    ) : (
                        <FileText className="h-6 w-6 text-zinc-400" />
                    )}
                </div>
            </button>
        );
    };

    return (
        <CustomerLayout>
            <Head title="Conversations" />

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
                        <p className="text-muted-foreground">Support chat with the TekRem team</p>
                    </div>

                    <Sheet open={newConversationOpen} onOpenChange={setNewConversationOpen}>
                        <SheetTrigger asChild>
                            <Button className="rounded-full px-5">
                                <Plus className="mr-2 h-4 w-4" />
                                New conversation
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-lg">
                            <SheetHeader>
                                <SheetTitle>Create a conversation</SheetTitle>
                                <SheetDescription>
                                    Start a new support thread and jump straight into the chat.
                                </SheetDescription>
                            </SheetHeader>

                            <form onSubmit={handleCreateConversation} className="mt-6 space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="conversation-title">Conversation title</Label>
                                    <Input
                                        id="conversation-title"
                                        value={newConversationTitle}
                                        onChange={(event) => setNewConversationTitle(event.target.value)}
                                        placeholder="e.g. Billing question"
                                        disabled={creatingConversation}
                                        autoFocus
                                    />
                                </div>

                                <SheetFooter>
                                    <SheetClose asChild>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </SheetClose>
                                    <Button type="submit" disabled={!newConversationTitle.trim() || creatingConversation}>
                                        {creatingConversation ? 'Creating...' : 'Create conversation'}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="h-[calc(100vh-11rem)] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex h-full flex-col lg:flex-row">
                        <aside className={`flex flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 ${sidebarOpen ? 'w-full lg:w-80' : 'w-0 overflow-hidden lg:w-80'}`}>
                            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-semibold">My conversations</span>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search conversations..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {filteredConversations.length === 0 ? (
                                    <div className="flex h-full items-center justify-center">
                                        <EmptyState label="No conversations" sublabel="Start a new support request" />
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            onClick={() => handleSelectConversation(conversation)}
                                            className={`mb-1 w-full rounded-xl px-4 py-3 text-left transition-colors ${activeConversation?.id === conversation.id ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar name={conversation.title} size="sm" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center justify-between gap-2">
                                                        <p className="truncate text-sm font-semibold">{conversation.title}</p>
                                                        <span className="text-[11px] opacity-70">{formatTime(conversation.last_message_at)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <StatusBadge status={conversation.status} />
                                                        {(conversation.unread_count ?? 0) > 0 && (
                                                            <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                                {conversation.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conversation.conversable_type && (
                                                        <p className="mt-1 text-[10px] opacity-70">{conversation.conversable_type.split('\\').pop()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {conversations.last_page > 1 && (
                                <div className="border-t border-zinc-100 px-4 py-3 text-center text-[11px] text-zinc-400 dark:border-zinc-800">
                                    Page {conversations.current_page} of {conversations.last_page}
                                </div>
                            )}
                        </aside>

                        <main className="flex min-w-0 flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
                            {activeConversation ? (
                                <>
                                    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSidebarOpen(true)}
                                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
                                            >
                                                <span className="sr-only">Open conversations</span>
                                                <MessageCircle className="h-4 w-4" />
                                            </button>
                                            <Avatar name={activeConversation.title} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="truncate text-base font-semibold">{activeConversation.title}</h2>
                                                    <StatusBadge status={activeConversation.status} />
                                                </div>
                                                <p className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <Clock className="h-3 w-3" />
                                                    Updated {formatTime(activeConversation.last_message_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setConversationMediaSheetOpen(true)}
                                                disabled={conversationAttachments.length === 0}
                                            >
                                                All media
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(250,250,250,0.9))] px-4 py-4 dark:bg-[linear-gradient(180deg,rgba(9,9,11,0.35),rgba(9,9,11,0.75))]">
                                        {activeMessages.length === 0 ? (
                                            <EmptyState
                                                label="No messages yet"
                                                sublabel="Send the first message to start the conversation"
                                            />
                                        ) : (
                                            <div className="space-y-4">
                                                {activeMessages.map((message) => {
                                                    const isMine = message.user_id === currentUserId;
                                                    return (
                                                        <div key={message.id} className={`flex gap-2.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                            {!isMine && <Avatar name={message.user?.name} photoUrl={message.user?.profile_photo_url} size="sm" />}
                                                            <div className={`flex max-w-[72%] flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
                                                                {!isMine && (
                                                                    <span className="px-1 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                                                        {message.user?.name ?? 'Support'}
                                                                    </span>
                                                                )}
                                                                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${isMine ? 'rounded-tr-sm bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'rounded-tl-sm bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'}`}>
                                                                    {message.message}
                                                                </div>
                                                                {Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                                                        {message.attachments.slice(0, 4).map((attachment, index) => {
                                                                            const attachmentUrl = buildAttachmentUrl(attachment);
                                                                            const attachmentName = getAttachmentName(attachment, index);
                                                                            const attachmentType = getAttachmentType(attachment);
                                                                            const attachmentSize = attachment.file_size ?? attachment.size;

                                                                            return (
                                                                                <div
                                                                                    key={`${message.id}-${index}`}
                                                                                    className={`relative h-16 w-16 overflow-hidden rounded-lg border ${isMine ? 'border-white/25 bg-white/10 dark:border-zinc-300' : 'border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900'}`}
                                                                                    title={`${attachmentName}${attachmentType ? ` (${attachmentType})` : ''}${attachmentSize ? ` - ${getFileSizeLabel(attachmentSize)}` : ''}`}
                                                                                >
                                                                                    {isImageAttachment(attachment) && attachmentUrl ? (
                                                                                        <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block h-full w-full">
                                                                                            <img src={attachmentUrl} alt={attachmentName} className="h-full w-full object-cover" />
                                                                                        </a>
                                                                                    ) : (
                                                                                        <a
                                                                                            href={attachmentUrl ?? '#'}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className={`flex h-full w-full items-center justify-center ${isMine ? 'text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-300'}`}
                                                                                        >
                                                                                            <FileText className="h-6 w-6" />
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}

                                                                        {message.attachments.length > 4 && (
                                                                            <div className={`flex h-16 w-16 items-center justify-center rounded-lg border border-dashed text-center ${isMine ? 'border-white/35 bg-white/10 text-white dark:border-zinc-400 dark:text-zinc-800' : 'border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200'}`}>
                                                                                <div>
                                                                                    <div className="text-[11px] font-semibold">+{message.attachments.length - 4}</div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <span className="px-1 text-[10px] text-zinc-400 dark:text-zinc-600">
                                                                    {formatFull(message.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                        <form onSubmit={handleSendMessage} className="flex items-end gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950">
                                            <button
                                                type="button"
                                                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                                onClick={() => attachmentInputRef.current?.click()}
                                                title="Attach files"
                                            >
                                                <Paperclip className="h-4 w-4" />
                                            </button>
                                            <input
                                                ref={attachmentInputRef}
                                                type="file"
                                                multiple
                                                className="hidden"
                                                onChange={handleAttachmentSelection}
                                            />
                                            <textarea
                                                ref={inputRef}
                                                value={newMessage}
                                                onChange={(event) => setNewMessage(event.target.value)}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="min-h-[42px] flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm outline-none ring-0 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' && !event.shiftKey) {
                                                        event.preventDefault();
                                                        void handleSendMessage(event as unknown as React.FormEvent);
                                                    }
                                                }}
                                            />
                                            <Button type="submit" size="icon" disabled={sending || (!newMessage.trim() && selectedAttachments.length === 0)} className="h-10 w-10 rounded-full">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </form>
                                        {selectedAttachments.length > 0 && (
                                            <div className="mt-3 space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Selected media</p>
                                                        <p className="text-xs text-zinc-400">{selectedAttachments.length} item{selectedAttachments.length === 1 ? '' : 's'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {selectedAttachments.length > 1 && (
                                                            <Button type="button" variant="outline" size="sm" onClick={() => setMediaSheetOpen(true)}>
                                                                Add more
                                                            </Button>
                                                        )}
                                                        <Button type="button" variant="ghost" size="sm" onClick={clearSelectedAttachments} className="text-zinc-500">
                                                            Clear all
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    {selectedAttachments.slice(0, 4).map((file, index) => renderSelectedAttachmentTile(file, index))}

                                                    {selectedAttachments.length > 4 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setMediaSheetOpen(true)}
                                                            className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-100 text-center transition hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                                                        >
                                                            <div>
                                                                <Plus className="mx-auto mb-0.5 h-4 w-4 text-zinc-500" />
                                                                <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-200">+{selectedAttachments.length - 4}</p>
                                                                <p className="text-[10px] text-zinc-400">more</p>
                                                            </div>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-1 items-center justify-center p-8 text-center">
                                    <div>
                                        <MessageCircle className="mx-auto mb-3 h-12 w-12 text-zinc-300" />
                                        <h3 className="text-lg font-semibold">Select a conversation</h3>
                                        <p className="text-sm text-zinc-500">Choose a thread from the sidebar to start chatting.</p>
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </div>

            <Sheet open={conversationMediaSheetOpen} onOpenChange={setConversationMediaSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-hidden">
                    <SheetHeader>
                        <SheetTitle>All media</SheetTitle>
                        <SheetDescription>
                            Browse every attachment shared in this conversation.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 flex-1 overflow-y-auto pr-1">
                        {conversationAttachments.length === 0 ? (
                            <div className="flex min-h-[240px] items-center justify-center">
                                <EmptyState label="No media yet" sublabel="Attachments shared here will appear here." />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pb-2">
                                {conversationAttachments.map(({ attachment, index, messageAuthor, messageCreatedAt }) => {
                                    const attachmentUrl = buildAttachmentUrl(attachment);
                                    const attachmentName = getAttachmentName(attachment, index);
                                    const attachmentType = getAttachmentType(attachment);
                                    const attachmentSize = attachment.file_size ?? attachment.size;
                                    const attachmentTitle = `${attachmentName}${attachmentType ? ` (${attachmentType})` : ''}${attachmentSize ? ` - ${getFileSizeLabel(attachmentSize)}` : ''}`;

                                    return (
                                        <div
                                            key={`${attachment.file_name ?? attachment.name ?? 'media'}-${messageAuthor}-${messageCreatedAt}-${index}`}
                                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
                                        >
                                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                                                {isImageAttachment(attachment) && attachmentUrl ? (
                                                    <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block h-full w-full">
                                                        <img src={attachmentUrl} alt={attachmentName} className="h-full w-full object-cover" />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={attachmentUrl ?? '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex h-full items-center justify-center text-zinc-500 dark:text-zinc-300"
                                                    >
                                                        <FileText className="h-10 w-10" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-3">
                                                <div>
                                                    <p className="truncate text-sm font-medium">{attachmentName}</p>
                                                    <p className="text-xs text-zinc-400">{messageAuthor}</p>
                                                    <p className="text-[11px] text-zinc-400">{formatFull(messageCreatedAt)}</p>
                                                </div>
                                                <Button asChild type="button" variant="outline" size="sm" className="w-full">
                                                    <a href={attachmentUrl ?? '#'} target="_blank" rel="noreferrer">
                                                        Open
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {mediaSheetOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
                    <button
                        type="button"
                        className="absolute inset-0 cursor-default"
                        aria-label="Close media sheet"
                        onClick={() => setMediaSheetOpen(false)}
                    />
                    <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
                            <div>
                                <h3 className="text-lg font-semibold">Media</h3>
                                <p className="text-xs text-zinc-400">Preview and manage selected attachments</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setMediaSheetOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {selectedAttachments.map((file, index) => {
                                    const previewUrl = file.type.startsWith('image/') ? getAttachmentPreviewUrl(file) : null;

                                    return (
                                        <div key={`${file.name}-${index}`} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <FileText className="h-10 w-10 text-zinc-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2 p-3">
                                                <div>
                                                    <p className="truncate text-sm font-medium">{file.name}</p>
                                                    <p className="text-xs text-zinc-400">{getFileSizeLabel(file.size)}</p>
                                                </div>
                                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => removeSelectedAttachment(index)}>
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedAttachments.length === 0 && (
                                <div className="flex h-full items-center justify-center py-16">
                                    <EmptyState label="No media selected" sublabel="Use Add media to choose files" />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                            <div className="flex gap-2">
                                <Button type="button" className="flex-1" onClick={() => attachmentInputRef.current?.click()}>
                                    Add media
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setMediaSheetOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CustomerLayout>
    );
}
