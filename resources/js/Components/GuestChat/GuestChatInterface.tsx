import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Sparkles, CheckCheck, Check, FileText, ZoomIn, X } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ChatInput from './ChatInput';

const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉', '🙏', '🔥', '✅', '💯'];

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

interface GuestChatInterfaceProps {
  messages: Message[];
  conversation: Conversation | null;
  guestSession: GuestSession | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  attachments: File[];
  setAttachments: (files: File[] | ((prev: File[]) => File[])) => void;
  isLoading: boolean;
  showGuestForm: boolean;
  guestInfo: { guest_name: string; guest_email: string; guest_phone: string; inquiry_type: string };
  setGuestInfo: (info: any) => void;
  onSendMessage: () => void;
  onUpdateGuestInfo: () => void;
  onCloseGuestForm: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'disconnected';
}

const fmt = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const isAI = (m: Message) => m.metadata?.is_ai_response === true;
const isAgent = (m: Message) => !!m.user && !isAI(m);
const isGuest = (m: Message) => !m.user && !isAI(m);

const senderName = (m: Message, gs?: GuestSession | null) => {
  if (isAI(m)) return m.metadata?.remy_branding?.display_name ?? m.metadata?.remy_name ?? 'Remy';
  if (isAgent(m)) return m.user?.name ?? 'Agent';
  if (isGuest(m)) return m.metadata?.guest_name ?? gs?.guest_name ?? 'You';
  return '?';
};

function Lightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[min(90vw,600px)] rounded-2xl bg-white p-3 shadow-[0_24px_64px_rgba(0,0,0,0.4)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
        <img src={url} alt={name} className="block max-h-[70vh] w-full rounded-[10px] object-contain" />
        <p className="mt-2 text-center text-xs text-gray-500">{name}</p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, guestSession }: { msg: Message; guestSession: GuestSession | null }) {
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const own = isGuest(msg);
  const ai = isAI(msg);

  const rowCls = `flex items-end gap-1.5 px-1 animate-msg-in ${own ? 'flex-row-reverse' : ''}`;
  const colCls = `flex max-w-[78%] flex-col gap-0.5 ${own ? 'items-end' : ''}`;

  const avatarCls = (kind: 'ai' | 'agent' | 'guest') =>
    `mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
      kind === 'ai'
        ? 'bg-gradient-to-br from-violet-500 to-indigo-500'
        : kind === 'agent'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    }`;

  const bubbleBase = 'relative rounded-2xl px-3.5 py-2.5 text-[13px] leading-6 break-words';
  const bubbleCls = own
    ? `${bubbleBase} text-white bg-gradient-to-br from-violet-500 to-indigo-500 rounded-br-[16px] rounded-bl-[2px] shadow-sm`
    : ai
      ? `${bubbleBase} text-indigo-950 bg-violet-50 border border-violet-100 rounded-tl-[2px]`
      : `${bubbleBase} text-gray-900 bg-white border border-gray-200 rounded-tl-[2px] shadow-[0_1px_3px_rgba(0,0,0,0.06)]`;

  return (
    <div className={rowCls}>
      {!own && (
        <div className={avatarCls(ai ? 'ai' : 'agent')}>{ai ? <Sparkles size={12} /> : <User size={12} />}</div>
      )}

      <div className={colCls}>
        {!own && (
          <span
            className={`px-1 text-[10.5px] font-semibold ${ai ? 'text-violet-700' : 'text-blue-600'}`}
          >
            {senderName(msg, guestSession)}
          </span>
        )}

        <div className={bubbleCls}>
          <div className="prose prose-sm max-w-none prose-p:my-0 prose-p:leading-6 prose-ul:my-2 prose-ol:my-2 prose-a:text-violet-700">
            <ReactMarkdown>{msg.message}</ReactMarkdown>
          </div>

          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {msg.attachments.map((att: any, i: number) =>
                att.url && att.type?.startsWith('image/') ? (
                  <button
                    key={i}
                    className="group relative overflow-hidden rounded-lg"
                    onClick={() => setLightbox({ url: att.url, name: att.name || 'image' })}
                    type="button"
                  >
                    <img
                      src={att.url}
                      alt={att.name}
                      className="h-[75px] w-[100px] rounded-lg object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn size={14} />
                    </span>
                  </button>
                ) : att.url ? (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1 text-[11.5px] transition-colors hover:bg-black/10"
                  >
                    <FileText size={13} />
                    <span>{att.name || 'Download'}</span>
                  </a>
                ) : null,
              )}
            </div>
          )}

          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] opacity-55">{fmt(msg.created_at)}</span>
            {own && (
              <span className="flex opacity-65">{msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />}</span>
            )}
          </div>
        </div>
      </div>

      {own && (
        <div className={avatarCls('guest')}>
          <User size={12} />
        </div>
      )}

      {lightbox && <Lightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </div>
  );
}

function GuestForm({
  guestInfo,
  setGuestInfo,
  onSubmit,
  onSkip,
}: {
  guestInfo: { guest_name: string; guest_email: string; guest_phone: string; inquiry_type: string };
  setGuestInfo: (info: any) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gradient-to-b from-violet-500/5 to-transparent px-5 pb-5 pt-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)]">
          <Bot size={24} />
        </div>
        <h3 className="mb-1 text-base font-bold text-indigo-950">Before we start…</h3>
        <p className="text-xs text-gray-500">Help us personalise your experience</p>
      </div>

      <div className="flex flex-1 flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <Label htmlFor="gf_name" className="text-xs font-semibold text-gray-700">
            Name
          </Label>
          <Input
            id="gf_name"
            className="h-[38px] rounded-[10px] border-gray-200 text-[13px] focus-visible:ring-2 focus-visible:ring-violet-500/20"
            value={guestInfo.guest_name}
            placeholder="Your name"
            onChange={(e) => setGuestInfo({ ...guestInfo, guest_name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="gf_email" className="text-xs font-semibold text-gray-700">
            Email
          </Label>
          <Input
            id="gf_email"
            type="email"
            className="h-[38px] rounded-[10px] border-gray-200 text-[13px] focus-visible:ring-2 focus-visible:ring-violet-500/20"
            value={guestInfo.guest_email}
            placeholder="you@email.com"
            onChange={(e) => setGuestInfo({ ...guestInfo, guest_email: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="gf_phone" className="text-xs font-semibold text-gray-700">
            Phone <span className="font-normal text-gray-400">(optional)</span>
          </Label>
          <Input
            id="gf_phone"
            className="h-[38px] rounded-[10px] border-gray-200 text-[13px] focus-visible:ring-2 focus-visible:ring-violet-500/20"
            value={guestInfo.guest_phone}
            placeholder="+260 XXX XXX XXX"
            onChange={(e) => setGuestInfo({ ...guestInfo, guest_phone: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs font-semibold text-gray-700">How can we help?</Label>
          <Select value={guestInfo.inquiry_type} onValueChange={(v) => setGuestInfo({ ...guestInfo, inquiry_type: v })}>
            <SelectTrigger className="h-[38px] rounded-[10px] border-gray-200 text-[13px] focus:ring-2 focus:ring-violet-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Inquiry</SelectItem>
              <SelectItem value="support">Technical Support</SelectItem>
              <SelectItem value="sales">Sales &amp; Pricing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <button
          className="h-[42px] w-full rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(139,92,246,0.35)] transition-all duration-150 hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(139,92,246,0.45)]"
          onClick={onSubmit}
          type="button"
        >
          Start Chat →
        </button>
        <button
          className="h-9 w-full rounded-xl text-[13px] text-gray-400 transition-colors hover:text-gray-500"
          onClick={onSkip}
          type="button"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="relative flex flex-col items-center px-6 py-10 text-center">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)]" />

      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.3)] animate-float">
        <Sparkles size={26} />
      </div>

      <h3 className="mb-2 text-lg font-bold text-indigo-950">Hi there! 👋</h3>
      <p className="mb-5 max-w-[260px] text-[13px] leading-6 text-gray-500">
        We're here to help with web development, mobile apps, and AI solutions. Ask us anything!
      </p>

      <div className="flex flex-wrap justify-center gap-1.5">
        {['Web Development', 'Mobile Apps', 'AI Solutions', 'Technical Support'].map((t) => (
          <span
            key={t}
            className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-700"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-1.5 px-1">
      <div className="mb-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
        <Sparkles size={10} />
      </div>

      <div className="flex items-center gap-2 rounded-[14px] rounded-bl-[2px] border border-violet-100 bg-violet-50 px-3 py-2">
        <span className="text-[11px] font-semibold text-violet-700">{name}</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300 animate-bounce [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="h-px flex-1 bg-gray-100" />
      <span className="whitespace-nowrap bg-white px-1 text-[10.5px] text-gray-400">{label}</span>
      <span className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function GuestChatInterface({
  messages,
  conversation,
  guestSession,
  newMessage,
  setNewMessage,
  attachments,
  setAttachments,
  isLoading,
  showGuestForm,
  guestInfo,
  setGuestInfo,
  onSendMessage,
  onUpdateGuestInfo,
  onCloseGuestForm,
  onKeyPress,
  messagesEndRef,
  isTyping = false,
  connectionStatus = 'connected',
}: GuestChatInterfaceProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiAnim, setEmojiAnim] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [transcriptSent, setTranscriptSent] = useState(false);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const sendTranscript = async () => {
    if (!conversation || transcriptSent) return;
    setTranscriptLoading(true);
    try {
      await fetch('/guest-chat/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversation.id }),
      });
      setTranscriptSent(true);
    } catch {
      setTranscriptSent(false);
    } finally {
      setTranscriptLoading(false);
    }
  };

  // Show rating UI when conversation is ended
  useEffect(() => {
    if (conversation && conversation.status === 'ended' && !ratingSubmitted) {
      setShowRating(true);
    }
  }, [conversation, ratingSubmitted]);

  const submitRating = async (value: number) => {
    setRating(value);
    try {
      await fetch('/guest-chat/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversation?.id, rating: value }),
      });
      setRatingSubmitted(true);
      setShowRating(false);
    } catch {
      setRatingSubmitted(true);
      setShowRating(false);
    }
  };

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const attachmentPreviews = useMemo(
    () =>
      attachments.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        onRemove: () => setAttachments((prev: File[]) => prev.filter((f) => f !== file)),
      })),
    [attachments, setAttachments],
  );

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(newMessage + emoji);
    setEmojiAnim(emoji);
    setTimeout(() => setEmojiAnim(null), 400);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (files: FileList) => {
    const arr = Array.from(files).slice(0, 5 - attachments.length);
    setAttachments((prev: File[]) => [...prev, ...arr].slice(0, 5));
  };

  const grouped = useMemo(() => {
    const out: { date: string; msgs: Message[] }[] = [];
    let last = '';
    for (const m of messages) {
      const label = getDateLabel(m.created_at);
      if (label !== last) {
        out.push({ date: label, msgs: [] });
        last = label;
      }
      out[out.length - 1].msgs.push(m);
    }
    return out;
  }, [messages]);

  if (showGuestForm) {
    return (
      <GuestForm
        guestInfo={guestInfo}
        setGuestInfo={setGuestInfo}
        onSubmit={onUpdateGuestInfo}
        onSkip={onCloseGuestForm}
      />
    );
  }

  return (
    <div
      className={`flex h-full flex-col overflow-hidden transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto bg-gray-50 px-3.5 py-4 [scrollbar-width:thin]">
        {messages.length === 0 && <WelcomeScreen />}

        {grouped.map((group) => (
          <React.Fragment key={group.date}>
            <DateDivider label={group.date} />
            {group.msgs.map((m) => (
              <MessageBubble key={m.id} msg={m} guestSession={guestSession} />
            ))}
          </React.Fragment>
        ))}

        {isTyping && <TypingIndicator name="Remy" />}
        <div ref={messagesEndRef} />
      </div>

      {/* CSAT Rating UI & Transcript */}
      {showRating && (
        <div className="absolute left-0 right-0 bottom-20 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.06)] py-4 text-center z-50">
          <div className="text-base font-semibold text-indigo-950 mb-2">How was your chat experience?</div>
          <div className="flex justify-center gap-2 mb-1">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                className={`text-3xl transition-transform ${rating === val ? 'scale-125' : ''}`}
                onClick={() => submitRating(val)}
                disabled={ratingSubmitted}
                aria-label={`Rate ${val} star${val > 1 ? 's' : ''}`}
                type="button"
              >
                <span role="img" aria-label={`${val} star`}>{val <= (rating ?? 0) ? '★' : '☆'}</span>
              </button>
            ))}
          </div>
          {ratingSubmitted && <div className="text-sm text-emerald-600 mt-1">Thank you for your feedback!</div>}
          <div className="mt-3">
            <button
              className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:opacity-60"
              onClick={sendTranscript}
              disabled={transcriptSent || transcriptLoading}
              type="button"
            >
              {transcriptLoading ? 'Sending…' : transcriptSent ? 'Transcript sent!' : 'Email me this conversation'}
            </button>
          </div>
        </div>
      )}

      <div className="relative shrink-0 border-t border-gray-100 bg-white px-3 py-2">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={() => onSendMessage()}
          isLoading={isLoading}
          onKeyDown={onKeyPress}
          onEmojiClick={() => setShowEmojiPicker((v) => !v)}
          showEmojiPicker={showEmojiPicker}
          onFileUpload={handleFileUpload}
          onImageUpload={handleFileUpload}
          attachmentPreviews={attachmentPreviews}
        />

        {showEmojiPicker && (
          <div className="absolute bottom-[calc(100%+6px)] left-3 z-50 min-w-[200px] rounded-[14px] border border-gray-200 bg-white p-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] animate-popup">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-gray-500">
              <span>Quick Reactions</span>
              <button
                className="inline-flex items-center text-gray-400 transition-colors hover:text-gray-500"
                onClick={() => setShowEmojiPicker(false)}
                type="button"
              >
                <X size={12} />
              </button>
            </div>

            <div className="grid w-full grid-cols-6 gap-[2px]">
              {quickEmojis.map((e) => (
                <button
                  key={e}
                  className={`rounded-md bg-transparent p-1 text-[18px] transition-[background,transform] duration-100 hover:scale-110 hover:bg-gray-100 ${
                    emojiAnim === e ? 'animate-pop' : ''
                  }`}
                  onClick={() => handleEmojiSelect(e)}
                  type="button"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-1 min-h-4 text-center text-[10.5px]">
          {connectionStatus === 'connected' && conversation?.assignee && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Chatting with {conversation.assignee.name}
            </span>
          )}

          {connectionStatus === 'connected' && !conversation?.assignee && (
            <span className="inline-flex items-center gap-1 text-violet-700">
              <Sparkles size={10} /> Assisted by Remy AI
            </span>
          )}

          {connectionStatus === 'connecting' && <span className="text-amber-600">Connecting…</span>}
          {connectionStatus === 'disconnected' && (
            <span className="text-red-600">Connection lost. Trying to reconnect…</span>
          )}
        </div>
      </div>
    </div>
  );
}
