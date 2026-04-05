import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useTranslate from '@/Hooks/useTranslate';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { Ticket, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Props {
  source: string;
  token: string;
  theme?: string;
  primary_color?: string;
  categories: Category[];
}

// ─── Iframe pointer-events helpers ────────────────────────────────────────────
// When this page is embedded as a same-origin <iframe>, we can reach up and
// toggle pointer-events on the frame element itself so the host page stays
// fully interactive everywhere except the widget.
// For cross-origin iframes, frameElement is null – the functions are no-ops.
const frameEl =
  typeof window !== 'undefined'
    ? (window.frameElement as HTMLIFrameElement | null)
    : null;

const lockFrame = () => { if (frameEl) frameEl.style.pointerEvents = 'auto'; };
const unlockFrame = () => { if (frameEl) frameEl.style.pointerEvents = 'none'; };

export default function TicketForm({
  source,
  token,
  theme = 'light',
  primary_color,
  categories,
}: Props) {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category_id: '',
    requester_name: '',
    requester_email: '',
    source,
  });

  // ── Theme ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [theme]);

  // ── Form ───────────────────────────────────────────────────────────────────
  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!token) throw new Error('API Token is missing. Please contact administrator.');
      await axios.post('/api/v1/tickets', formData, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setSuccess(true);
      toast.success(
        t('support.ticket_created_success', 'Your support ticket has been created successfully.')
      );
      setFormData(prev => ({
        ...prev, title: '', description: '', priority: 'medium', category_id: '',
      }));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message
        || error.message
        || t('support.ticket_created_error', 'An error occurred while creating the ticket.')
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Open / close ───────────────────────────────────────────────────────────
  const openWidget = () => {
    if (success) setSuccess(false);
    lockFrame(); // keep frame interactive for the full panel
    setIsOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateOpen(true)));
    
    // Notify parent to resize iframe
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ticket-widget-open' }, '*');
    }
  };

  const closeWidget = () => {
    setAnimateOpen(false);
    setTimeout(() => {
      setIsOpen(false);
      // Panel is gone – only the tiny launcher area should capture events
      // We rely on the launcher's onMouseEnter to re-lock when needed
      unlockFrame();
      
      // Notify parent to shrink iframe back down
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'ticket-widget-close' }, '*');
      }
    }, 280); // wait for exit animation
  };

  const accentColor = primary_color || '#8b5cf6';

  // ── Closed state: just the launcher button ─────────────────────────────────
  if (!isOpen) {
    return (
      <>
        <Head title={t('support.create_ticket', 'Create Support Ticket')} />
        <Toaster position="top-center" />

        {/*
          The host page embeds this page as a FULL-SCREEN transparent iframe:
          ──────────────────────────────────────────────────────────────────────
          <iframe
            src="https://your-app.com/widget?token=TOKEN&source=website"
            style="position:fixed;inset:0;width:100%;height:100%;border:none;
                   z-index:2147483647;pointer-events:none;background:transparent;"
            allowtransparency="true"
          ></iframe>
          ──────────────────────────────────────────────────────────────────────
          That one line is all that's needed. `pointer-events:none` on the iframe
          keeps the host page fully interactive. When the user hovers/clicks the
          launcher below, this component calls window.frameElement.style.pointerEvents
          = 'auto' so the button (and panel when open) become clickable.
        */}
        <div
          className="widget-launcher"
          onMouseEnter={lockFrame}
          onMouseLeave={unlockFrame}
        >
          <button
            className="launcher-btn"
            onClick={openWidget}
            title={t('support.contact_support', 'Contact Support')}
            style={{ background: accentColor }}
          >
            <img src="/public/favicon.svg" alt="Support" className="launcher-logo" />
            <span className="launcher-ripple" />
          </button>
        </div>

        <style>{`
          html, body {
            background: transparent !important;
            margin: 0; padding: 0;
          }

          .widget-launcher {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            padding: 24px;
            /* Only the button area is interactive – handled via onMouseEnter/Leave */
            pointer-events: none;
          }

          .launcher-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
            position: relative;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            pointer-events: auto;
            flex-shrink: 0;
          }
          .launcher-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.55);
          }
          .launcher-btn:active { transform: scale(0.95); }

          .launcher-logo {
            width: 28px; height: 28px;
            object-fit: contain;
            position: relative; z-index: 1;
            filter: brightness(0) invert(1);
          }

          .launcher-ripple {
            position: absolute; inset: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            animation: ripplePulse 2.5s ease-in-out infinite;
          }

          @keyframes ripplePulse {
            0%, 100% { transform: scale(1);    opacity: 0.4; }
            50%       { transform: scale(1.35); opacity: 0;   }
          }
        `}</style>
      </>
    );
  }

  // ── Open state: full panel ─────────────────────────────────────────────────
  return (
    <>
      <Head title={t('support.create_ticket', 'Create Support Ticket')} />
      <Toaster position="top-center" />

      <div className={`widget-wrap ${animateOpen ? 'widget-open' : ''}`}>
        {success ? (
          <div className="widget-panel flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Ticket className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {t('support.ticket_submitted', 'Ticket Submitted!')}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t('support.ticket_submitted_desc', 'We have received your support request and will be in touch shortly.')}
            </p>
            <Button
              className="w-full font-medium"
              onClick={() => { setSuccess(false); closeWidget(); }}
            >
              {t('common.close', 'Close')}
            </Button>
          </div>
        ) : (
          <div className="widget-panel flex flex-col">
            {/* Header */}
            <div
              className="panel-header shrink-0 p-4 rounded-t-xl"
              style={{ backgroundColor: accentColor, color: '#ffffff' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <h3 className="text-lg font-bold">
                    {t('support.contact_support', 'Contact Support')}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90">
                    {t('support.contact_support_desc', 'Fill out the form below to submit a ticket.')}
                  </p>
                </div>
                <button
                  onClick={closeWidget}
                  className="ml-2 text-white hover:text-white/80 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable form body */}
            <div className="p-4 overflow-y-auto grow bg-background custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('support.name', 'Your Name')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={formData.requester_name}
                      onChange={e => handleChange('requester_name', e.target.value)}
                      placeholder="John Doe"
                      className="bg-muted/50 focus:bg-background h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('support.email', 'Email Address')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.requester_email}
                      onChange={e => handleChange('requester_email', e.target.value)}
                      placeholder="john@example.com"
                      className="bg-muted/50 focus:bg-background h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('support.subject', 'Subject')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    value={formData.title}
                    onChange={e => handleChange('title', e.target.value)}
                    placeholder="Brief description of the issue"
                    className="bg-muted/50 focus:bg-background h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('support.category', 'Category')}
                    </label>
                    <Select
                      value={formData.category_id}
                      onValueChange={val => handleChange('category_id', val)}
                    >
                      <SelectTrigger className="bg-muted/50 focus:bg-background h-9">
                        <SelectValue placeholder={t('support.select_category', 'Select Category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t('support.priority', 'Priority')}
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={val => handleChange('priority', val)}
                    >
                      <SelectTrigger className="bg-muted/50 focus:bg-background h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">     {t('support.priority_low', 'Low')}    </SelectItem>
                        <SelectItem value="medium">  {t('support.priority_medium', 'Medium')} </SelectItem>
                        <SelectItem value="high">    {t('support.priority_high', 'High')}   </SelectItem>
                        <SelectItem value="urgent">  {t('support.priority_urgent', 'Urgent')} </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('support.description', 'Description')} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={e => handleChange('description', e.target.value)}
                    placeholder="Please describe your issue in detail..."
                    className="resize-none bg-muted/50 focus:bg-background min-h-[100px]"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 bg-background border-t shrink-0">
              <Button
                onClick={handleSubmit}
                className="w-full font-bold shadow-md hover:shadow-lg transition-all"
                disabled={loading}
                style={{ backgroundColor: accentColor, color: '#ffffff' }}
              >
                {loading
                  ? t('common.submitting', 'Submitting...')
                  : t('support.submit_ticket', 'Submit Ticket')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

        html, body {
          background: transparent !important;
          margin: 0; padding: 0;
          font-family: 'Sora', system-ui, sans-serif;
          overflow: hidden;
        }
        *, *::before, *::after { box-sizing: border-box; }

        .widget-wrap {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          pointer-events: none;
        }

        @media (min-width: 640px) {
          .widget-wrap {
            align-items: flex-end;
            justify-content: flex-end;
            padding: 24px;
          }
        }

        .widget-panel {
          width: 100%;
          height: 100vh;
          max-width: 100%;
          background: var(--background, #fff);
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
          pointer-events: auto;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          transition:
            opacity   0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
            transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (min-width: 640px) {
          .widget-panel {
            width: 380px;
            height: min(680px, calc(100vh - 48px));
            border-radius: 20px;
            transform-origin: bottom right;
          }
        }

        .widget-open .widget-panel {
          opacity: 1;
          transform: none;
        }

        .custom-scrollbar::-webkit-scrollbar       { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track  { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb  { background: rgba(0,0,0,0.15); border-radius: 4px; }
      `}</style>
    </>
  );
}