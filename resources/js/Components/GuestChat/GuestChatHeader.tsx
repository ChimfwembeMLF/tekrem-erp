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
  support:  { label: 'Support',        color: '#f97316' },
  sales:    { label: 'Sales',          color: '#10b981' },
  general:  { label: 'General',        color: '#6366f1' },
};

const STATUS_COLORS: Record<string, string> = {
  active:   '#10b981',
  closed:   '#ef4444',
  archived: '#6b7280',
  open:     '#6366f1',
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
    <header className="chat-header">
      {/* Animated gradient bar */}
      <div className="header-gradient-bar" />

      <div className="header-inner">
        {/* Left: brand + info */}
        <div className="header-left">
          <div className="avatar-ring">
            <img src={Logo} alt="TekRem" className="brand-logo" />
            <span className="online-dot" style={{ background: statusColor }} />
          </div>

          <div className="header-text">
            <div className="header-title-row">
              <span className="header-title">TekRem Support</span>
              {inquiry && !isMinimized && (
                <span className="inquiry-badge" style={{ color: inquiry.color, borderColor: `${inquiry.color}33`, background: `${inquiry.color}11` }}>
                  {inquiry.label}
                </span>
              )}
            </div>

            {!isMinimized && (
              <div className="header-subtitle">
                {connectionStatus === 'connecting' && (
                  <span className="sub-connecting">
                    <Loader2 size={10} className="spin-icon" /> Connecting…
                  </span>
                )}
                {connectionStatus === 'connected' && agentName && (
                  <span className="sub-agent">
                    <span className="agent-dot" />
                    Chatting with {agentName}
                  </span>
                )}
                {connectionStatus === 'connected' && !agentName && (
                  <span className="sub-waiting">AI assistant ready</span>
                )}
                {connectionStatus === 'disconnected' && (
                  <span className="sub-disconnected">
                    <WifiOff size={10} /> Reconnecting…
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="header-actions">
          {!isMinimized && guestSession && (
            <button className="hdr-btn" onClick={onShowGuestForm} title="Update info">
              <Settings2 size={14} />
            </button>
          )}
          <button className="hdr-btn" onClick={onToggleMinimize} title={isMinimized ? 'Expand' : 'Minimize'}>
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button className="hdr-btn hdr-btn-close" onClick={onClose} title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      <style>{`
        .chat-header {
          position: relative;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%);
          overflow: hidden;
          user-select: none;
          flex-shrink: 0;
        }

        .header-gradient-bar {
          height: 2px;
          background: linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #818cf8);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
        @keyframes shimmer { to { background-position: -200% 0; } }

        .header-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px;
          gap: 10px;
        }

        .header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }

        .avatar-ring {
          position: relative; flex-shrink: 0;
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .brand-logo { width: 22px; height: 22px; object-fit: contain; }
        .online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 9px; height: 9px; border-radius: 50%;
          border: 1.5px solid #1e1b4b;
          transition: background 0.3s;
        }

        .header-text { flex: 1; min-width: 0; }
        .header-title-row { display: flex; align-items: center; gap: 6px; }
        .header-title {
          font-size: 14px; font-weight: 650; color: #f5f3ff;
          letter-spacing: -0.01em; truncate;
          font-family: 'Sora', 'DM Sans', system-ui, sans-serif;
        }
        .inquiry-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid; border-radius: 20px;
          padding: 1px 6px; flex-shrink: 0;
        }
        .header-subtitle {
          margin-top: 2px; font-size: 11px; display: flex; align-items: center; gap: 4px;
        }
        .sub-agent { color: #a5f3c0; display: flex; align-items: center; gap: 4px; }
        .agent-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981; flex-shrink: 0;
        }
        .sub-waiting { color: #c4b5fd; }
        .sub-connecting { color: #fcd34d; display: flex; align-items: center; gap: 4px; }
        .sub-disconnected { color: #fca5a5; display: flex; align-items: center; gap: 4px; }
        .spin-icon { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .header-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
        .hdr-btn {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          background: transparent; color: rgba(255,255,255,0.6);
          transition: background 0.15s, color 0.15s;
        }
        .hdr-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .hdr-btn-close:hover { background: rgba(239,68,68,0.25); color: #fca5a5; }
      `}</style>
    </header>
  );
}