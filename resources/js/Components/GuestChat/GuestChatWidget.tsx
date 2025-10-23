import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send, Paperclip, Image } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';

import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { toast } from 'sonner';
import GuestChatHeader from './GuestChatHeader';
import GuestChatInterface from './GuestChatInterface';
import Logo from '../../../../public/favicon.svg'
interface Message {
  id: number;
  message: string;
  message_type: string;
  attachments?: any[];
  status: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  } | null;
  metadata?: any;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  assignee?: {
    id: number;
    name: string;
  } | null;
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

export default function GuestChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  // Refactored: maintain File[] for attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    inquiry_type: 'general',
  });
  const [initError, setInitError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session when widget is first opened
  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeSession();
    }
  }, [isOpen, isInitialized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds when chat is open
  useEffect(() => {
    if (isOpen && isInitialized) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isInitialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setInitError(null);
      const response = await fetch('/guest-chat/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuestSession(data.session);
        setConversation(data.conversation);
        setMessages(data.messages || []);
        setIsInitialized(true);
        console.debug('Guest chat initialized successfully:', data);

        // Show guest form if no name is provided
        if (!data.session.guest_name) {
          setShowGuestForm(true);
        }
      } else {
        setInitError('Failed to initialize chat session. Please try again.');
        toast.error('Failed to initialize chat session');
      }
    } catch (error) {
      setInitError('Failed to connect to chat service. Please check your connection and try again.');
      toast.error('Failed to connect to chat service');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!isInitialized) return;

    try {
      const response = await fetch('/guest-chat/messages', {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];

        // Check for new messages and update unread count
        if (newMessages.length > messages.length && !isOpen) {
          setUnreadCount(prev => prev + (newMessages.length - messages.length));
        }

        setMessages(newMessages);
        if (data.conversation) {
          setConversation(data.conversation);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const updateGuestInfo = async () => {
    try {
      const response = await fetch('/guest-chat/update-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(guestInfo),
      });

      if (response.ok) {
        const data = await response.json();
        setGuestSession(data.session);
        setShowGuestForm(false);
        toast.success('Information updated successfully');
      } else {
        toast.error('Failed to update information');
      }
    } catch (error) {
      toast.error('Failed to update information');
    }
  };

  const sendMessage = async () => {
  if ((!newMessage.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('message', newMessage);
      formData.append('message_type', 'text');
      // Attach all files/images robustly
      if (attachments && attachments.length > 0) {
        attachments.forEach((file, idx) => {
          formData.append('attachments[]', file);
        });
      }

      const response = await fetch('/guest-chat/send', {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
  setAttachments([]);

        // Handle AI response if present
        if (data.ai_response) {
          setTimeout(() => {
            setMessages(prev => [...prev, data.ai_response]);
          }, 1000);
        }

        if (conversation) {
          setConversation(prev => prev ? { ...prev, last_message_at: new Date().toISOString() } : null);
        }
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Clear unread count when opening
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Widget trigger button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 md:bottom-6 md:right-6 bottom-6 right-6 w-auto flex justify-end md:justify-end px-0 md:px-0">
        <Button
          onClick={toggleWidget}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 relative"
          size="icon"
        >
          <img className='w-32' src={Logo} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/90">
        <div className="p-8 bg-white rounded-lg shadow-xl border max-w-sm w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Chat Initialization Error</h2>
          <p className="text-sm text-red-600 mb-4">{initError}</p>
          <Button onClick={initializeSession} className="w-full">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center md:bottom-6 md:right-6 md:left-auto md:inset-auto md:justify-end md:items-end px-0 md:px-0 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} md:translate-x-0 md:opacity-100`}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <Card
        className={`w-full h-full max-w-none md:w-96 md:h-[calc(100vh-4rem)] shadow-2xl rounded-none md:rounded-t-lg transition-all duration-200 ${isMinimized ? 'h-16' : ''}`}
      >
        <GuestChatHeader
          guestSession={guestSession}
          conversation={conversation}
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          onClose={() => setIsOpen(false)}
          onShowGuestForm={() => setShowGuestForm(true)}
        />

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100% - 4rem)' }}>
            <GuestChatInterface
              messages={messages}
              conversation={conversation}
              guestSession={guestSession}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              attachments={attachments}
              setAttachments={setAttachments}
              isLoading={isLoading}
              showGuestForm={showGuestForm}
              guestInfo={guestInfo}
              setGuestInfo={setGuestInfo}
              onSendMessage={sendMessage}
              onUpdateGuestInfo={updateGuestInfo}
              onCloseGuestForm={() => setShowGuestForm(false)}
              onKeyPress={handleKeyPress}
              messagesEndRef={messagesEndRef}
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
