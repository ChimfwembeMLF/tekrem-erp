import React from 'react';
import { X, ChevronDown, ChevronUp, Settings2, WifiOff, Loader2, Bot } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

interface GuestSession {
  id: number;
  session_id: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  inquiry_type: string;
  display_name: string;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  assignee?: { id: number; name: string } | null;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

interface GuestChatHeaderProps {
  guestSession: GuestSession | null;
  conversation: Conversation | null;
  isMinimized: boolean;
  connectionStatus?: ConnectionStatus;
  onToggleMinimize: () => void;
  onClose: () => void;
  onShowGuestForm: () => void;
}

const INQUIRY_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  support: { label: 'Support', variant: 'outline' },
  sales: { label: 'Sales', variant: 'secondary' },
  general: { label: 'General', variant: 'default' },
};

export default function GuestChatHeader({
  guestSession,
  conversation,
  isMinimized,
  connectionStatus = 'connected',
  onToggleMinimize,
  onClose,
  onShowGuestForm,
}: GuestChatHeaderProps) {
  const inquiry = guestSession ? (INQUIRY_LABELS[guestSession.inquiry_type] ?? INQUIRY_LABELS.general) : null;
  const agentName = conversation?.assignee?.name;
  const isOnline = connectionStatus === 'connected';

  return (
    <header className="relative shrink-0 border-b border-border bg-card select-none">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />

      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-primary shadow-sm">
            <Bot className="h-5 w-5" />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                isOnline ? 'bg-chart-2' : connectionStatus === 'connecting' ? 'bg-chart-1' : 'bg-destructive'
              }`}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                Remy
              </span>
              {inquiry && !isMinimized && (
                <Badge variant={inquiry.variant} className="h-5 px-2 text-[10px] uppercase tracking-wide">
                  {inquiry.label}
                </Badge>
              )}
            </div>

            {!isMinimized && (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                {connectionStatus === 'connecting' && (
                  <span className="inline-flex items-center gap-1 text-chart-1">
                    <Loader2 size={10} className="animate-spin" />
                    Connecting...
                  </span>
                )}
                {connectionStatus === 'connected' && agentName && (
                  <span className="inline-flex items-center gap-1 text-chart-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                    Chatting with {agentName}
                  </span>
                )}
                {connectionStatus === 'connected' && !agentName && (
                  <span className="inline-flex items-center gap-1 text-primary">
                    AI assistant ready
                  </span>
                )}
                {connectionStatus === 'disconnected' && (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <WifiOff size={10} />
                    Reconnecting...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!isMinimized && guestSession && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowGuestForm}>
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Chat settings</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:inline-flex" onClick={onToggleMinimize}>
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">{isMinimized ? 'Expand' : 'Minimize'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close chat</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
