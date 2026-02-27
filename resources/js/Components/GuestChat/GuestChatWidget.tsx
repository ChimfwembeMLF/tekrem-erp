import React, { useState, useEffect, useRef, useCallback } from 'react';
import { requestNotificationPermission, getFcmToken, listenForForegroundMessages } from '../../firebase-messaging';
import { Card, CardContent } from '@/Components/ui/card';
import { toast } from 'sonner';
import GuestChatHeader from './GuestChatHeader';
import GuestChatInterface from './GuestChatInterface';
import Logo from '../../../../public/favicon.svg';

/* ─── types ─────────────────────────────────────────────────── */
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

const CSRF = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

/* ─── component ─────────────────────────────────────────────── */
export default function GuestChatWidget() {
  const [isOpen,        setIsOpen]        = useState(false);
  const [isMinimized,   setIsMinimized]   = useState(false);
  const [initialized,   setInitialized]   = useState(false);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [conversation,  setConversation]  = useState<Conversation | null>(null);
  const [guestSession,  setGuestSession]  = useState<GuestSession | null>(null);
  const [newMessage,    setNewMessage]    = useState('');
  const [attachments,   setAttachments]   = useState<File[]>([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo,     setGuestInfo]     = useState({
    guest_name: '', guest_email: '', guest_phone: '', inquiry_type: 'general',
  });
  const [initError,     setInitError]     = useState<string | null>(null);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isTyping,      setIsTyping]      = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [animateOpen,   setAnimateOpen]   = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── init ─────────────────────────────────────────── */
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setInitError(null);
      setConnectionStatus('connecting');
      // Try to resume session from localStorage
      const storedSessionId = localStorage.getItem('guest_chat_session_id');
      const res = await fetch('/guest-chat/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF() },
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

  // FCM push notification registration
  useEffect(() => {
    async function setupPush() {
      if ('Notification' in window && window.navigator.serviceWorker) {
        await requestNotificationPermission();
        const token = await getFcmToken();
        if (token && guestSession) {
          // Send token to backend to associate with session
          fetch('/guest-chat/push-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF() },
            body: JSON.stringify({ session_id: guestSession.session_id, token }),
          });
        }
        listenForForegroundMessages(payload => {
          // Optionally show toast or notification in-app
          toast('New chat message', { description: payload?.notification?.body });
        });
      }
    }
    if (initialized && guestSession) setupPush();
  }, [initialized, guestSession]);

  useEffect(() => {
    if (isOpen && !initialized) initializeSession();
  }, [isOpen, initialized, initializeSession]);

  /* ── polling ──────────────────────────────────────── */
  const fetchMessages = useCallback(async () => {
    if (!initialized) return;
    try {
      const res = await fetch('/guest-chat/messages', {
        headers: { 'X-CSRF-TOKEN': CSRF() },
      });
      if (!res.ok) return;
      const data = await res.json();
      const next: Message[] = data.messages ?? [];
      setMessages(prev => {
        if (next.length > prev.length && !isOpen)
          setUnreadCount(c => c + (next.length - prev.length));
        return next;
      });
      if (data.conversation) setConversation(data.conversation);
      if (connectionStatus === 'disconnected') setConnectionStatus('connected');
    } catch {
      setConnectionStatus('disconnected');
    }
  }, [initialized, isOpen, connectionStatus]);

  // Mark messages as read when widget is open and messages change
  useEffect(() => {
    if (!isOpen || !initialized || messages.length === 0) return;
    fetch('/guest-chat/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF() },
      body: JSON.stringify({ message_ids: messages.filter(m => m.status !== 'read').map(m => m.id) }),
    });
  }, [isOpen, initialized, messages]);

  useEffect(() => {
    if (isOpen && initialized) {
      pollRef.current = setInterval(fetchMessages, 5000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }
  }, [isOpen, initialized, fetchMessages]);

  /* ── send ─────────────────────────────────────────── */
  const sendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || isLoading) return;
    try {
      setIsLoading(true);
      const fd = new FormData();
      fd.append('message', newMessage);
      fd.append('message_type', 'text');
      attachments.forEach(f => fd.append('attachments[]', f));
      const res = await fetch('/guest-chat/send', {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': CSRF() },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        // File size error handling
        if (data.errors && data.errors['attachments.0']) {
          const maxMb = 10;
          toast.error(`File too large. Max size is ${maxMb}MB.`);
        } else {
          toast.error('Failed to send message. Please try again.');
        }
        return;
      }
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      setAttachments([]);
      if (data.ai_response) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, data.ai_response]);
        }, 1200);
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGuestInfo = async () => {
    try {
      const res = await fetch('/guest-chat/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF() },
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

  /* ── open/close animation ─────────────────────────── */
  const openWidget = () => {
    setIsOpen(true);
    setUnreadCount(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateOpen(true)));
  };

  const closeWidget = () => {
    setAnimateOpen(false);
    setTimeout(() => setIsOpen(false), 280);
  };

  /* ── launcher button ──────────────────────────────── */
  if (!isOpen) {
    return (
      <div className="widget-launcher">
        <button className="launcher-btn" onClick={openWidget} title="Open chat">
          <img src={Logo} alt="Chat" className="launcher-logo" />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
          <span className="launcher-ripple" />
        </button>
        <style>{`
          .widget-launcher {
            position: fixed; bottom: 24px; right: 24px; z-index: 999;
          }
          .launcher-btn {
            width: 56px; height: 56px; border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 24px rgba(99,102,241,0.45);
            position: relative; overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .launcher-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 32px rgba(99,102,241,0.55);
          }
          .launcher-btn:active { transform: scale(0.95); }
          .launcher-logo { width: 28px; height: 28px; object-fit: contain; position: relative; z-index: 1; }
          .unread-badge {
            position: absolute; top: -3px; right: -3px;
            min-width: 20px; height: 20px; border-radius: 10px;
            background: #ef4444; color: #fff;
            font-size: 10px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            padding: 0 4px; z-index: 2;
            border: 2px solid #fff;
            animation: badgePop 0.3s ease-out;
          }
          @keyframes badgePop { 0% { transform: scale(0); } 80% { transform: scale(1.15); } 100% { transform: scale(1); } }
          .launcher-ripple {
            position: absolute; inset: 0; border-radius: 50%;
            background: rgba(255,255,255,0.2);
            animation: ripplePulse 2.5s ease-in-out infinite;
          }
          @keyframes ripplePulse {
            0%,100% { transform: scale(1); opacity: 0.4; }
            50%      { transform: scale(1.35); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  /* ── error state ──────────────────────────────────── */
  if (initError) {
    return (
      <div className="widget-error-wrap">
        <div className="widget-error-card">
          <div className="error-icon">⚠️</div>
          <h3>Connection Error</h3>
          <p>{initError}</p>
          <button className="error-retry" onClick={initializeSession}>
            {isLoading ? 'Retrying…' : 'Try Again'}
          </button>
          <button className="error-close" onClick={closeWidget}>Close</button>
        </div>
        <style>{`
          .widget-error-wrap {
            position: fixed; bottom: 24px; right: 24px; z-index: 1000;
          }
          .widget-error-card {
            width: 320px; background: #fff; border-radius: 16px;
            padding: 28px 24px; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            border: 1px solid #fee2e2;
          }
          .error-icon { font-size: 32px; margin-bottom: 10px; }
          .widget-error-card h3 { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 6px; }
          .widget-error-card p { font-size: 13px; color: #6b7280; margin: 0 0 20px; line-height: 1.5; }
          .error-retry {
            width: 100%; height: 40px; border-radius: 10px;
            background: linear-gradient(135deg, #8b5cf6, #6366f1);
            color: #fff; font-size: 13px; font-weight: 600;
            border: none; cursor: pointer; margin-bottom: 8px;
          }
          .error-close {
            width: 100%; height: 36px; background: none;
            border: none; color: #9ca3af; cursor: pointer; font-size: 13px;
          }
        `}</style>
      </div>
    );
  }

  /* ── chat panel ───────────────────────────────────── */
  return (
    <div className={`widget-wrap ${animateOpen ? 'widget-open' : ''}`}>
      <div className={`widget-panel ${isMinimized ? 'panel-minimized' : ''}`}>
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
          <div className="panel-body">
            <GuestChatInterface
              messages={messages}
              conversation={conversation}
              guestSession={guestSession}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
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
              messagesEndRef={messagesEndRef}
              isTyping={isTyping}
              connectionStatus={connectionStatus}
            />
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

        .widget-wrap {
          position: fixed; z-index: 1000;
          /* Mobile: full screen */
          inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding: 0;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .widget-wrap {
            inset: auto;
            bottom: 24px; right: 24px;
            align-items: flex-end; justify-content: flex-end;
          }
        }

        .widget-panel {
          width: 100%;
          height: 100dvh;
          max-width: 100%;
          background: #fff;
          border-radius: 0;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          pointer-events: auto;
          opacity: 0; transform: translateY(20px) scale(0.97);
          transition: opacity 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (min-width: 640px) {
          .widget-panel {
            width: 380px;
            height: min(680px, calc(100dvh - 48px));
            border-radius: 20px;
            transform-origin: bottom right;
          }
        }

        .widget-open .widget-panel {
          opacity: 1; transform: none;
        }

        .panel-minimized {
          height: auto !important;
        }

        .panel-body {
          flex: 1; overflow: hidden;
          display: flex; flex-direction: column;
        }

        * { box-sizing: border-box; }
        body { font-family: 'Sora', system-ui, sans-serif; }
      `}</style>
    </div>
  );
}