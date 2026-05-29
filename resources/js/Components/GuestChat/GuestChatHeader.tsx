import React from 'react';
import { X, ChevronDown, ChevronUp, Settings2, WifiOff, Loader2 } from 'lucide-react';
import Logo from '../../../../public/favicon.svg';

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

const INQUIRY_LABELS: Record<string, { label: string; colorVar: string }> = {
  support: { label: 'Support', colorVar: '--chart-1' },
  sales: { label: 'Sales', colorVar: '--chart-2' },
  general: { label: 'General', colorVar: '--primary' },
};

const STATUS_COLOR_VARS: Record<string, string> = {
  active: '--chart-2',
  closed: '--destructive',
  archived: '--muted-foreground',
  open: '--primary',
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
  const statusColorVar = conversation?.status
    ? (STATUS_COLOR_VARS[conversation.status] ?? STATUS_COLOR_VARS.open)
    : STATUS_COLOR_VARS.open;

  const agentName = conversation?.assignee?.name;

  return (
    <header className="relative flex-shrink-0 overflow-hidden border-b border-border bg-white dark:bg-gray-900 select-none">

      {/* Animated top bar */}
      {/* <div className="h-[2px] bg-[hsl(var(--primary))]" /> */}

      <div className="flex items-center justify-between gap-2 px-4 py-3">

        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          <div className="relative flex items-center justify-center w-9 h-9 rounded-full border border-border bg-[hsl(var(--card))]">
            <img src={Logo} alt="TekRem" className="w-5 h-5 object-contain" />
            <span
              className="absolute bottom-[1px] right-[1px] w-2 h-2 rounded-full border border-[hsl(var(--card))]"
              style={{ background: `hsl(var(${statusColorVar}))` }}
            />
          </div>

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                Remy
              </span>

              {inquiry && !isMinimized && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-[1px] rounded-full border"
                  style={{
                    color: `hsl(var(${inquiry.colorVar}))`,
                    borderColor: `hsl(var(${inquiry.colorVar}) / 0.25)`,
                    background: `hsl(var(${inquiry.colorVar}) / 0.1)`,
                  }}
                >
                  {inquiry.label}
                </span>
              )}
            </div>

            {!isMinimized && (
              <div className="mt-0.5 text-[11px] flex items-center gap-1">

                {connectionStatus === 'connecting' && (
                  <span className="flex items-center gap-1 text-[hsl(var(--chart-1))]">
                    <Loader2 size={10} className="animate-spin" />
                    Connecting...
                  </span>
                )}

                {connectionStatus === 'connected' && agentName && (
                  <span className="flex items-center gap-1 text-[hsl(var(--chart-2))]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-2))]" />
                    Chatting with {agentName}
                  </span>
                )}

                {connectionStatus === 'connected' && !agentName && (
                  <span className="text-primary dark:text-white flex items-center gap-1">
                    AI assistant ready
                  </span>
                )}

                {connectionStatus === 'disconnected' && (
                  <span className="flex items-center gap-1 text-destructive">
                    <WifiOff size={10} />
                    Reconnecting...
                  </span>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {!isMinimized && guestSession && (
            <button
              onClick={onShowGuestForm}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--foreground)/0.65)] hover:text-foreground hover:bg-[hsl(var(--accent))] transition"
            >
              <Settings2 size={14} />
            </button>
          )}

          <button
            onClick={onToggleMinimize}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--foreground)/0.65)] hover:text-foreground hover:bg-[hsl(var(--accent))] transition"
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[hsl(var(--foreground)/0.65)] hover:text-destructive hover:bg-[hsl(var(--destructive)/0.15)] transition"
          >
            <X size={14} />
          </button>

        </div>
      </div>
    </header>
  );
}