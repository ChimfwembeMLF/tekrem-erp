import React, { useState, useEffect, useRef, useCallback } from 'react';
import { requestNotificationPermission, getFcmToken, listenForForegroundMessages } from '../../firebase-messaging';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import GuestChatHeader from './GuestChatHeader';
import GuestChatInterface from './GuestChatInterface';
import { useConversationChannel } from '@/Hooks/useConversationChannel';
import { getBroadcastHeaders } from '@/echo';
import { fetchWithSession } from '@/lib/http';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  message: string;
  message_type: string;
  attachments?: any[];
  status: string;
  created_at: string;
  user?: { id: number; name: string } | null;
  metadata?: any;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  assignee?: { id: number; name: string } | null;
}

interface GuestSession {
  id: number;
  session_id: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  inquiry_type: string;
  display_name: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';


const appendUniqueMessage = (prev: Message[], incoming: Message) => {
  if (prev.some(m => m.id === incoming.id)) {
    return prev;
  }
  return [...prev, incoming];
};

function ChatLauncher({
  unreadCount,
  onOpen,
}: {
  unreadCount: number;
  onOpen: () => void;
}) {
  return (
    <div className="group fixed bottom-5 right-5 z-[999] sm:bottom-6 sm:right-6">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open chat"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/40 animate-launcher-pulse"
        />
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full border border-primary/25"
        />
        <span className="relative z-10 flex animate-launcher-bob items-center justify-center">
          <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
        </span>
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 z-20 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold animate-scale-in border-2 border-background"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>
      <span className="pointer-events-none absolute -top-9 right-0 hidden whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 sm:block">
        Chat with us
      </span>
    </div>
  );
}

export default function GuestChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    guest_name: '', guest_email: '', guest_phone: '', inquiry_type: 'general',
  });
  const [initError, setInitError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [animateOpen, setAnimateOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { typingUsers, notifyTyping } = useConversationChannel({
    conversationId: conversation?.id ?? null,
    currentUserId: guestSession ? `guest_${guestSession.id}` : null,
    typingUrl: '/guest-chat/typing',
    enabled: initialized && !!conversation?.id,
    onMessage: (incoming) => {
      const next = incoming as unknown as Message;
      setMessages(prev => {
        const updated = appendUniqueMessage(prev, next);
        if (!isOpen && updated.length > prev.length) {
          setUnreadCount(c => c + (updated.length - prev.length));
        }
        return updated;
      });
      if (next.metadata?.is_ai_response) {
        setIsAiTyping(false);
      }
    },
  });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, isMinimized]);

  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setInitError(null);
      setConnectionStatus('connecting');
      const storedSessionId = localStorage.getItem('guest_chat_session_id');
      const res = await fetchWithSession('/guest-chat/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: storedSessionId ? JSON.stringify({ session_id: storedSessionId }) : undefined,
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setGuestSession(data.session);
      setConversation(data.conversation);
      setMessages(data.messages ?? []);
      setInitialized(true);
      setConnectionStatus('connected');
      if (data.session.session_id) {
        localStorage.setItem('guest_chat_session_id', data.session.session_id);
      }
      if (!data.session.guest_name) setShowGuestForm(true);
    } catch {
      setInitError('Failed to connect. Please check your connection and try again.');
      setConnectionStatus('disconnected');
      toast.error('Chat unavailable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function setupPush() {
      if ('Notification' in window && window.navigator.serviceWorker) {
        await requestNotificationPermission();
        const token = await getFcmToken();
        if (token && guestSession) {
          fetchWithSession('/guest-chat/push-token', {
            method: 'POST',
            body: JSON.stringify({ session_id: guestSession.session_id, token }),
          }).catch(() => {});
        }
        listenForForegroundMessages((payload: any) => {
          toast('New chat message', { description: payload?.notification?.body });
        });
      }
    }
    if (initialized && guestSession) setupPush();
  }, [initialized, guestSession]);

  useEffect(() => {
    if (isOpen && !initialized) initializeSession();
  }, [isOpen, initialized, initializeSession]);

  useEffect(() => {
    if (window.Echo && initialized) {
      setConnectionStatus('connected');
    }
  }, [initialized, conversation?.id]);

  useEffect(() => {
    if (!isOpen || !initialized || messages.length === 0) return;
    fetchWithSession('/guest-chat/read', {
      method: 'POST',
      body: JSON.stringify({ message_ids: messages.filter(m => m.status !== 'read').map(m => m.id) }),
    }).catch(() => {});
  }, [isOpen, initialized, messages]);

  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || isLoading) return;
    try {
      setIsLoading(true);
      const fd = new FormData();
      fd.append('message', newMessage);
      fd.append('message_type', 'text');
      attachments.forEach(f => fd.append('attachments[]', f));
      const res = await fetchWithSession('/guest-chat/send', {
        method: 'POST',
        headers: getBroadcastHeaders(null),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors && data.errors['attachments.0']) {
          toast.error('File too large. Max size is 10MB.');
        } else {
          toast.error('Failed to send message. Please try again.');
        }
        return;
      }
      setMessages(prev => appendUniqueMessage(prev, data.message));
      setNewMessage('');
      setAttachments([]);
      notifyTyping(false);
      if (data.ai_response) {
        setIsAiTyping(true);
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGuestInfo = async () => {
    try {
      const res = await fetchWithSession('/guest-chat/update-info', {
        method: 'POST',
        body: JSON.stringify(guestInfo),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGuestSession(data.session);
      setShowGuestForm(false);
      toast.success('All set! Starting your chat.');
    } catch {
      toast.error('Failed to update information.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleMessageChange = (value: string) => {
    setNewMessage(value);
    notifyTyping(value.trim().length > 0);
  };

  const openWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateOpen(true)));
  };

  const closeWidget = () => {
    setAnimateOpen(false);
    setTimeout(() => setIsOpen(false), 280);
  };

  if (!isOpen) {
    return <ChatLauncher unreadCount={unreadCount} onOpen={openWidget} />;
  }

  if (initError) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:items-end sm:justify-end sm:p-0">
        <Card className="w-full max-w-sm border-border bg-card shadow-2xl animate-chat-panel-in sm:w-[360px]">
          <CardHeader className="items-center text-center pb-2">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="text-base">Connection Error</CardTitle>
            <CardDescription>{initError}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button onClick={initializeSession} disabled={isLoading} className="w-full">
              {isLoading ? 'Retrying…' : 'Try Again'}
            </Button>
            <Button variant="ghost" onClick={closeWidget} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close chat"
        className={cn(
          'fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm transition-opacity duration-300 sm:hidden',
          animateOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeWidget}
      />

      <div
        className={cn(
          'fixed z-[1000] flex flex-col pointer-events-none',
          'inset-0 sm:inset-auto sm:bottom-6 sm:right-6',
          'sm:h-[min(680px,calc(100dvh-48px))] sm:w-[400px]',
        )}
      >
        <div
          className={cn(
            'pointer-events-auto flex h-full w-full flex-col overflow-hidden border-border bg-background shadow-2xl',
            'sm:rounded-2xl sm:border',
            'transition-all duration-300 ease-out',
            animateOpen
              ? 'animate-chat-panel-in opacity-100'
              : 'opacity-0 translate-y-4 sm:translate-y-6 sm:scale-[0.98]',
            isMinimized && 'sm:!h-auto',
          )}
        >
          <GuestChatHeader
            guestSession={guestSession}
            conversation={conversation}
            isMinimized={isMinimized}
            connectionStatus={connectionStatus}
            onToggleMinimize={() => setIsMinimized(v => !v)}
            onClose={closeWidget}
            onShowGuestForm={() => setShowGuestForm(true)}
          />

          {!isMinimized && (
            <div className="flex min-h-0 flex-1 flex-col bg-background">
              <GuestChatInterface
                messages={messages}
                conversation={conversation}
                guestSession={guestSession}
                newMessage={newMessage}
                setNewMessage={handleMessageChange}
                attachments={attachments}
                setAttachments={setAttachments as any}
                isLoading={isLoading}
                showGuestForm={showGuestForm}
                guestInfo={guestInfo}
                setGuestInfo={setGuestInfo}
                onSendMessage={sendMessage}
                onUpdateGuestInfo={updateGuestInfo}
                onCloseGuestForm={() => setShowGuestForm(false)}
                onKeyPress={handleKeyPress}
                onInputBlur={() => notifyTyping(false)}
                messagesEndRef={messagesEndRef}
                isTyping={isAiTyping}
                typingUsers={typingUsers}
                connectionStatus={connectionStatus}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
