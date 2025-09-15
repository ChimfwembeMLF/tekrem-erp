import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import ChatInput from './ChatInput';
// import EmojiMartPicker from './EmojiMartPicker';
// Common emojis for quick reactions (reuse from LiveChat)
const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

// 
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

interface GuestChatInterfaceProps {
  messages: Message[];
  conversation: Conversation | null;
  guestSession: GuestSession | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  isLoading: boolean;
  showGuestForm: boolean;
  guestInfo: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    inquiry_type: string;
  };
  setGuestInfo: (info: any) => void;
  onSendMessage: () => void;
  onUpdateGuestInfo: () => void;
  onCloseGuestForm: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
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
}: GuestChatInterfaceProps) {
  // Attachment preview state for new ChatInput (derived from attachments)
  const [attachmentPreviews, setAttachmentPreviews] = useState<Array<{ url: string; name: string; type: string; onRemove: () => void }>>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Handle file upload (non-image)
  const handleFileUpload = (files: FileList) => {
    if (!files.length) return;
    const newFiles = Array.from(files).slice(0, 5 - attachments.length);
  setAttachments((prev: File[]) => [...prev, ...newFiles].slice(0, 5));
  };

  // Handle image upload
  const handleImageUpload = (files: FileList) => {
    if (!files.length) return;
    const newFiles = Array.from(files).slice(0, 5 - attachments.length);
  setAttachments((prev: File[]) => [...prev, ...newFiles].slice(0, 5));
  };
  // Sync attachmentPreviews with attachments state
  React.useEffect(() => {
    setAttachmentPreviews(
      attachments.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type,
        onRemove: () => {
          setAttachments((prev: File[]) => prev.filter((f: File) => f.name !== file.name));
        },
      }))
    );
  }, [attachments, setAttachments]);

  // Modal state for attachment previews
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ url: string; name: string; type: string } | null>(null);

  // Handle emoji select
  const handleEmojiSelect = (emoji: string) => {
  setNewMessage((prev: string) => prev + emoji);
    setShowEmojiPicker(false);
  };
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isGuestMessage = (message: Message) => {
    // Guest messages have no user_id and are not AI responses
    return !message.user && !isAIMessage(message);
  };

  const isAIMessage = (message: Message) => {
    return message.metadata?.is_ai_response === true;
  };

  const isHumanAgentMessage = (message: Message) => {
    return message.user && !isAIMessage(message);
  };

  const getMessageSender = (message: Message) => {
    if (isAIMessage(message)) {
      // Prefer backend Remy branding if present
      if (message.metadata?.remy_branding?.display_name) {
        return message.metadata.remy_branding.display_name;
      }
      if (message.metadata?.remy_name) {
        return message.metadata.remy_name;
      }
      return 'Remy';
    }
    if (isHumanAgentMessage(message)) {
      return message.user?.name || 'Agent';
    }
    // For guest messages, show guest name if available
    if (isGuestMessage(message)) {
      const guestName = message.metadata?.guest_name || guestSession?.guest_name;
      return guestName || 'You';
    }
    return 'Unknown';
  };

  const getGuestDisplayInfo = (message: Message) => {
    if (!isGuestMessage(message)) return null;

    const guestName = message.metadata?.guest_name || guestSession?.guest_name;
    const guestEmail = message.metadata?.guest_email || guestSession?.guest_email;

    if (guestName && guestEmail) {
      return `${guestName} (${guestEmail})`;
    }
    if (guestName) {
      return guestName;
    }
    if (guestEmail) {
      return guestEmail;
    }
    return 'You';
  };

  // Guest Information Form
  if (showGuestForm) {
    return (
      <div className="min-h-[350px] mx-4 my-10 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm mb-1">Welcome to TekRem Support</h3>
          <p className="text-xs text-muted-foreground">
            Please provide your information to help us assist you better.
          </p>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-3">
            <div>
              <Label htmlFor="guest_name" className="text-xs">Name</Label>
              <Input
                id="guest_name"
                value={guestInfo.guest_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestInfo({ ...guestInfo, guest_name: e.target.value })}
                placeholder="Your name"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="guest_email" className="text-xs">Email</Label>
              <Input
                id="guest_email"
                type="email"
                value={guestInfo.guest_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestInfo({ ...guestInfo, guest_email: e.target.value })}
                placeholder="your.email@example.com"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="guest_phone" className="text-xs">Phone (Optional)</Label>
              <Input
                id="guest_phone"
                value={guestInfo.guest_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestInfo({ ...guestInfo, guest_phone: e.target.value })}
                placeholder="+260 XXX XXX XXX"
                className="h-8 text-sm"
              />
            </div>

            <div>
              <Label htmlFor="inquiry_type" className="text-xs">How can we help you?</Label>
              <Select
                value={guestInfo.inquiry_type}
                onValueChange={(value: string) => setGuestInfo({ ...guestInfo, inquiry_type: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="sales">Sales & Pricing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="border-t p-3 flex-shrink-0">
          <div className="flex space-x-2">
            <Button onClick={onUpdateGuestInfo} className="flex-1 h-8 text-sm">
              Start Chat
            </Button>
            <Button variant="outline" onClick={onCloseGuestForm} className="h-8 text-sm">
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-2">Welcome to TekRem Support!</h3>
              <p className="text-xs text-muted-foreground mb-4">
                We're here to help. Send us a message and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">Web Development</Badge>
                <Badge variant="outline" className="text-xs">Mobile Apps</Badge>
                <Badge variant="outline" className="text-xs">AI Solutions</Badge>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isGuestMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-[80%] ${isGuestMessage(message) ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <Avatar className="w-6 h-6 flex-shrink-0">
                  <AvatarFallback className={`text-xs ${isAIMessage(message) ? 'bg-purple-100 text-purple-600' : ''}`}>
                    {isGuestMessage(message) ? (
                      <User className="w-3 h-3" />
                    ) : isAIMessage(message) ? (
                      <Bot className="w-3 h-3" />
                    ) : (
                      message.user?.name?.charAt(0) || 'S'
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className={`rounded-lg px-3 py-2 ${
                  isGuestMessage(message)
                    ? 'bg-primary text-primary-foreground'
                    : isAIMessage(message)
                    ? 'bg-purple-50 border border-purple-200'
                    : 'bg-muted'
                }`}>
                  {/* Message Header - Show sender info for non-guest messages */}
                  {!isGuestMessage(message) && (
                    <div className="flex items-center gap-1 mb-1">
                      {isAIMessage(message) ? (
                        <>
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">
                            {getMessageSender(message)}
                          </span>
                        </>
                      ) : isHumanAgentMessage(message) ? (
                        <>
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-600">{message.user?.name || 'Agent'}</span>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Guest message header - show guest info when available */}
                  {isGuestMessage(message) && (message.metadata?.guest_name || guestSession?.guest_name) && (
                    <div className="flex items-center gap-1 mb-1">
                      <User className="w-3 h-3 text-primary-foreground/70" />
                      <span className="text-xs font-medium text-primary-foreground/90">
                        {getGuestDisplayInfo(message)}
                      </span>
                    </div>
                  )}

                  {/* Message body: render markdown and attachments */}
                  <div className={`text-sm break-words ${isAIMessage(message) ? 'text-gray-800' : ''}`}>
                    <ReactMarkdown>{message.message}</ReactMarkdown>
                    {/* Render all attachments (images and files) for any sender */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((att: any, idx: number) => (
                          att.url && att.type && att.type.startsWith('image/') ? (
                            <img
                              key={idx}
                              src={att.url}
                              alt={att.name || 'attachment'}
                              className="max-h-32 max-w-[120px] rounded border object-contain"
                              style={{ width: 'auto', height: '80px' }}
                            />
                          ) : att.url ? (
                            <a
                              key={idx}
                              href={att.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-blue-600 border hover:underline max-w-[120px] truncate"
                            >
                              <span className="truncate">{att.name || 'Download attachment'}</span>
                            </a>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${
                      isGuestMessage(message)
                        ? 'text-primary-foreground/70'
                        : isAIMessage(message)
                        ? 'text-purple-600/70'
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.created_at)}
                    </span>
                    {isGuestMessage(message) && (
                      <span className={`text-xs ${
                        message.status === 'read'
                          ? 'text-primary-foreground/70'
                          : 'text-primary-foreground/50'
                      }`}>
                        {message.status === 'read' ? '✓✓' : '✓'}
                      </span>
                    )}
                    {/* No extra label for Remy, branding is above */}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ChatInput from LiveChat */}
      <div className="border-t p-3 flex-shrink-0 relative">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={e => { e?.preventDefault(); onSendMessage(); }}
          isLoading={isLoading}
          onKeyDown={onKeyPress}
          onEmojiClick={() => setShowEmojiPicker(v => !v)}
          showEmojiPicker={showEmojiPicker}
          onFileUpload={handleFileUpload}
          onImageUpload={handleImageUpload}
          attachmentPreviews={attachmentPreviews}
        />

        {/* Attachment Preview Grid (2x2) */}
        {attachmentPreviews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {attachmentPreviews.slice(0, 4).map((att, idx) => (
              <div key={idx} className="relative group border rounded p-1 bg-gray-50 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => setPreviewModal(att)}
              >
                {att.type.startsWith('image/') ? (
                  <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded" />
                ) : (
                  <iframe src={att.url} title={att.name} className="h-24 w-full rounded bg-white" />
                )}
                <div className="absolute top-1 right-1">
                  <Button size="icon" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); att.onRemove(); }}>
                    ×
                  </Button>
                </div>
                <div className="text-xs mt-1 truncate w-full text-center">{att.name}</div>
              </div>
            ))}
            {attachmentPreviews.length > 4 && (
              <button className="col-span-2 text-xs text-blue-600 underline mt-2" onClick={() => setShowMoreModal(true)}>
                Show {attachmentPreviews.length - 4} more...
              </button>
            )}
          </div>
        )}

        {/* Show More Modal */}
        {showMoreModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-lg" onClick={() => setShowMoreModal(false)}>×</button>
              <div className="grid grid-cols-2 gap-2">
                {attachmentPreviews.slice(4).map((att, idx) => (
                  <div key={idx} className="border rounded p-1 bg-gray-50 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => setPreviewModal(att)}
                  >
                    {att.type.startsWith('image/') ? (
                      <img src={att.url} alt={att.name} className="h-24 w-full object-cover rounded" />
                    ) : (
                      <iframe src={att.url} title={att.name} className="h-24 w-full rounded bg-white" />
                    )}
                    <div className="text-xs mt-1 truncate w-full text-center">{att.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Individual Preview Modal */}
        {previewModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 max-w-lg w-full relative flex flex-col items-center">
              <button className="absolute top-2 right-2 text-lg" onClick={() => setPreviewModal(null)}>×</button>
              <div className="w-full flex flex-col items-center">
                {previewModal.type.startsWith('image/') ? (
                  <img src={previewModal.url} alt={previewModal.name} className="max-h-[60vh] w-auto object-contain rounded" />
                ) : (
                  <iframe src={previewModal.url} title={previewModal.name} className="h-[60vh] w-full rounded bg-white" />
                )}
                <div className="text-xs mt-2 truncate w-full text-center">{previewModal.name}</div>
              </div>
            </div>
          </div>
        )}
        {showEmojiPicker && (
          <div className="absolute bottom-14 left-0 z-50 bg-white border rounded shadow-md p-2 w-64">
            <div className="mb-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Quick Emojis</span>
              <button
                className="text-blue-500 text-xs underline"
                type="button"
                onClick={() => setShowEmojiPicker(false)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1 mb-2">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-lg p-1 hover:bg-gray-100 rounded"
                  onClick={() => handleEmojiSelect(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="border-t my-2" />
            <div className="text-xs text-gray-400 mb-1">All Emojis</div>      
          </div>
        )}

        {/* Status indicator */}
        {conversation?.assignee ? (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            You're chatting with {conversation.assignee.name}
          </p>
        ) : (
          <div className="my-2 text-center">
            <p className="text-xs text-muted-foreground">
              Waiting for an agent to join...
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Bot className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-600">Remy is helping you</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
