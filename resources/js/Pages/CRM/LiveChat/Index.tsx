import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
import {
  MessageCircle,
  Search,
  Plus,
  Bell,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { Conversation, ChatMessage, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';
import { useSessionKeepAlive } from '@/Hooks/useSessionKeepAlive';
import ConversationView from './Conversation';

interface LiveChatIndexProps extends InertiaSharedProps {
  conversations: {
    data: Conversation[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  unreadCount: number;
  filters: {
    status?: string;
    priority?: string;
    search?: string;
    assigned_to_me?: boolean;
    conversation?: number | string;
  };
  userRole: string;
  selectedConversation: Conversation | null;
  pinnedMessages: ChatMessage[];
  clients: { id: number; name: string; email: string }[];
  leads: { id: number; name: string; email: string }[];
  staff: any[];
}

export default function LiveChatIndex({
  conversations,
  unreadCount,
  filters,
  userRole,
  selectedConversation,
  pinnedMessages,
  clients,
  leads,
  staff,
}: LiveChatIndexProps) {
  const route = useRoute();
  useSessionKeepAlive();
  const [search, setSearch] = useState(filters.search || '');
  const [createOpen, setCreateOpen] = useState(false);
  const [entityType, setEntityType] = useState<'App\\Models\\Client' | 'App\\Models\\Lead'>('App\\Models\\Client');
  const [entityId, setEntityId] = useState('');
  const [creating, setCreating] = useState(false);
  const selectedId = selectedConversation?.id ?? null;

  const entityOptions = entityType === 'App\\Models\\Client' ? clients : leads;

  const filterParams = () => ({
    search: search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    assigned_to_me: filters.assigned_to_me || undefined,
  });

  const selectConversation = (id: number) => {
    router.get(
      route('crm.livechat.index'),
      { ...filterParams(), conversation: id },
      { preserveState: true, preserveScroll: true, only: ['selectedConversation', 'pinnedMessages', 'filters'] }
    );
  };

  const clearSelection = () => {
    router.get(route('crm.livechat.index'), filterParams(), {
      preserveState: true,
      only: ['selectedConversation', 'pinnedMessages', 'filters'],
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('crm.livechat.index'), {
      ...filterParams(),
      conversation: selectedId ?? undefined,
    }, { preserveState: true });
  };

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId) return;

    setCreating(true);
    router.post(
      route('crm.livechat.find-or-create'),
      {
        chattable_type: entityType,
        chattable_id: Number(entityId),
      },
      {
        onFinish: () => setCreating(false),
        onSuccess: () => {
          setCreateOpen(false);
          setEntityId('');
        },
      }
    );
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLastMessage = (conversation: Conversation) => {
    const message = conversation.latest_message;
    if (!message?.message) return 'No messages yet';
    const text = typeof message.message === 'string' ? message.message : '';
    return text.length > 32 ? `${text.substring(0, 32)}...` : text;
  };

  return (
    <AppLayout
      title="Chat"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-xl leading-tight">Chat</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {unreadCount}
              </Badge>
            )}
          </div>
          {userRole !== 'customer' && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>
      )}
    >
      <Head title="Chat" />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Start a conversation</SheetTitle>
            <SheetDescription>
              Pick a client or lead to open or create their chat thread.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleCreateConversation} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Contact type</Label>
              <Select
                value={entityType}
                onValueChange={(value: 'App\\Models\\Client' | 'App\\Models\\Lead') => {
                  setEntityType(value);
                  setEntityId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="App\Models\Client">Client</SelectItem>
                  <SelectItem value="App\Models\Lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${entityType.includes('Client') ? 'client' : 'lead'}`} />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No {entityType.includes('Client') ? 'clients' : 'leads'} available
                    </SelectItem>
                  ) : (
                    entityOptions.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name} ({entity.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <SheetFooter className="gap-2 sm:gap-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" disabled={!entityId || creating}>
                {creating ? 'Opening...' : 'Open conversation'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <div className="h-[calc(100vh-8rem)] min-h-[28rem] flex overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* Conversation list — narrow sidebar */}
        <aside
          className={`${
            selectedId ? 'hidden md:flex' : 'flex'
          } w-full md:w-64 lg:w-72 shrink-0 flex-col border-r bg-muted/10`}
        >
          <div className="p-2 border-b">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-9 pl-8 text-sm"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.data.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No conversations</p>
              </div>
            ) : (
              conversations.data.map((conversation) => {
                const isActive = selectedId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`w-full text-left px-2.5 py-2.5 border-b transition-colors hover:bg-muted/60 ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={conversation.conversable?.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            conversation.conversable?.name ||
                            conversation.creator?.name ||
                            'U'
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium truncate text-sm leading-tight">
                            {conversation.display_title || conversation.title || `#${conversation.id}`}
                          </span>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px] shrink-0">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {formatLastMessage(conversation)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {conversations.last_page > 1 && (
            <div className="p-1.5 border-t flex justify-center gap-0.5">
              {conversations.links.map((link, i) => {
                if (!link.url) return null;
                return (
                  <Link key={i} href={link.url} preserveState>
                    <Button
                      variant={link.active ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </aside>

        {/* Chat panel */}
        <main className={`${selectedId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex-col`}>
          {selectedConversation ? (
            <>
              <div className="md:hidden flex items-center gap-2 px-2 py-2 border-b shrink-0">
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Chats
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <ConversationView
                  embedded
                  conversation={selectedConversation}
                  pinnedMessages={pinnedMessages}
                  clients={clients}
                  leads={leads}
                  staff={staff}
                  userRole={userRole}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
              <MessageCircle className="h-14 w-14 mb-3 opacity-25" />
              <h3 className="text-base font-medium text-foreground mb-1">Select a conversation</h3>
              <p className="text-sm text-center max-w-xs">
                Choose a chat from the list or start a new one with a client or lead.
              </p>
              {userRole !== 'customer' && (
                <Button className="mt-4" variant="outline" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New conversation
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}
