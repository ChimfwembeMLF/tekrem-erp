import React from 'react';
import { X, ChevronDown, ChevronUp, Settings2, Wifi, WifiOff, Loader2 } from 'lucide-react';
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

const INQUIRY_LABELS: Record<string, { label: string; color: string }> = {
  support: { label: 'Support', color: '#f97316' },
  sales: { label: 'Sales', color: '#10b981' },
  general: { label: 'General', color: '#6366f1' },
};

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981',
  closed: '#ef4444',
  archived: '#6b7280',
  open: '#6366f1',
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
  const statusColor = conversation?.status ? (STATUS_COLORS[conversation.status] ?? STATUS_COLORS.open) : STATUS_COLORS.open;

  const agentName = conversation?.assignee?.name;

  return (
    <header className="relative flex-shrink-0 overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 select-none">

      {/* Animated top bar */}
      <div className="h-[2px] bg-[linear-gradient(90deg,#818cf8,#a78bfa,#c084fc,#818cf8)] bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite]" />

      <div className="flex items-center justify-between gap-2 px-4 py-3">

        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/20">
            <img src={Logo} alt="TekRem" className="w-5 h-5 object-contain" />
            <span
              className="absolute bottom-[1px] right-[1px] w-2 h-2 rounded-full border border-indigo-950"
              style={{ background: statusColor }}
            />
          </div>

          <div className="flex-1 min-w-0">

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-violet-100 truncate">
                TekRem Support
              </span>

              {inquiry && !isMinimized && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-[1px] rounded-full border"
                  style={{
                    color: inquiry.color,
                    borderColor: `${inquiry.color}33`,
                    background: `${inquiry.color}11`,
                  }}
                >
                  {inquiry.label}
                </span>
              )}
            </div>

            {!isMinimized && (
              <div className="mt-0.5 text-[11px] flex items-center gap-1">

                {connectionStatus === 'connecting' && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Loader2 size={10} className="animate-spin" />
                    Connecting…
                  </span>
                )}

                {connectionStatus === 'connected' && agentName && (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Chatting with {agentName}
                  </span>
                )}

                {connectionStatus === 'connected' && !agentName && (
                  <span className="text-violet-300">
                    AI assistant ready
                  </span>
                )}

                {connectionStatus === 'disconnected' && (
                  <span className="flex items-center gap-1 text-red-300">
                    <WifiOff size={10} />
                    Reconnecting…
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
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              <Settings2 size={14} />
            </button>
          )}

          <button
            onClick={onToggleMinimize}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/20 transition"
          >
            <X size={14} />
          </button>

        </div>
      </div>
    </header>
  );
}