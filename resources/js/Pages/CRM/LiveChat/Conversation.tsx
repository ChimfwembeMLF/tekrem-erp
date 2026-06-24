import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { toast } from 'sonner';
import useTypedPage from '@/Hooks/useTypedPage';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  Send,
  Paperclip,
  ArrowLeft,
  MoreVertical,
  Archive,
  User,
  Users,
  Clock,
  Check,
  CheckCheck,
  Reply,
  Download,
  Eye,
  MessageCircle,
  Smile,
  StickyNote,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Image,
  File,
  FileText,
  Video,
  Music,
  Archive as ArchiveIcon,
  Maximize2,
  ZoomIn,
  Minimize2,
  Expand,
  Shrink,
  Pin,
  Sparkles
} from 'lucide-react';
import { Conversation, ChatMessage, InertiaSharedProps } from '@/types/index';
import MessageActions from '@/Components/LiveChat/MessageActions';
import MessageReactions from '@/Components/LiveChat/MessageReactions';
import MessageEdit from '@/Components/LiveChat/MessageEdit';
import MessageComments from '@/Components/LiveChat/MessageComments';
import MessageEditHistory from '@/Components/LiveChat/MessageEditHistory';
import PinnedMessages from '@/Components/LiveChat/PinnedMessages';
import ConversationDetailsSheet from '@/Components/LiveChat/ConversationDetailsSheet';
import useRoute from '@/Hooks/useRoute';
import { useConversationChannel } from '@/Hooks/useConversationChannel';
import { getBroadcastHeaders } from '@/echo';

interface ConversationProps extends InertiaSharedProps {
  conversation: Conversation;
  pinnedMessages?: ChatMessage[];
  clients: any[];
  leads: any[];
  staff: any[];
  userRole: string;
  embedded?: boolean;
  // Project-specific props
  project?: any;
  teamMembers?: any[];
  isProjectChat?: boolean;
  isCustomerView?: boolean;
}

export default function ConversationView({
  conversation,
  pinnedMessages = [],
  clients,
  leads,
  staff,
  userRole,
  project,
  teamMembers = [],
  isProjectChat = false,
  isCustomerView = false,
  embedded = false,
  messages: messagesProp,
}: ConversationProps & { messages?: any[] }) {
  const route = useRoute();
  const page = useTypedPage();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [newNote, setNewNote] = useState('');
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [showComments, setShowComments] = useState<ChatMessage | null>(null);
  const [showEditHistory, setShowEditHistory] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
    '🙌', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [liveMessages, setLiveMessages] = useState<any[]>(
    isCustomerView && messagesProp ? messagesProp : conversation.messages || []
  );

  const pageUser = page.props.auth?.user;
  const typingUrl = isCustomerView
    ? route('customer.conversations.typing', conversation.id)
    : route('crm.livechat.typing', conversation.id);

  const { typingUsers, notifyTyping } = useConversationChannel({
    conversationId: conversation.id,
    currentUserId: pageUser?.id ?? null,
    typingUrl,
    onMessage: (incoming) => {
      setLiveMessages(prev => {
        if (prev.some(m => m.id === incoming.id)) {
          return prev;
        }
        return [...prev, incoming];
      });
    },
  });

  const appendMessage = (incoming: any) => {
    setLiveMessages(prev => {
      if (prev.some(m => m.id === incoming.id)) {
        return prev;
      }
      return [...prev, incoming];
    });
  };

  const messages = liveMessages;

  useEffect(() => {
    scrollToBottom();
  }, [liveMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0 && selectedImages.length === 0) return;

    const hasAttachments = selectedFiles.length > 0 || selectedImages.length > 0;
    const hasImages = selectedImages.length > 0;

    // Show sending notification
    const toastId = toast.loading('Sending message...', {
      description: hasAttachments ? 'Uploading files...' : 'Delivering your message'
    });

    try {
      const formData = new FormData();

      formData.append('message', message.trim() || (hasAttachments ? 'Attachment' : ''));
      formData.append('message_type', hasImages ? 'image' : hasAttachments ? 'file' : 'text');

      if (replyTo?.id) {
        formData.append('reply_to_id', replyTo.id.toString());
      }

      // Add files to form data
      let attachmentIndex = 0;
      selectedFiles.forEach((file) => {
        formData.append(`attachments[${attachmentIndex}]`, file);
        attachmentIndex++;
      });

      // Add images to form data
      selectedImages.forEach((image) => {
        formData.append(`attachments[${attachmentIndex}]`, image);
        attachmentIndex++;
      });

      // Use fetch for AJAX request instead of Inertia
      const sendUrl = isCustomerView
        ? route('customer.conversations.messages.store', conversation.id)
        : route('crm.livechat.send-message', conversation.id);

      const { data } = await window.axios.post(sendUrl, formData, {
        headers: getBroadcastHeaders(null),
      });

      const sentMessage = data.message ?? data.chat;
      if (sentMessage) {
        appendMessage(sentMessage);
      }

      notifyTyping(false);

      // Success notification
      toast.success('Message sent!', {
        id: toastId,
        description: hasAttachments
          ? `Message with ${selectedFiles.length + selectedImages.length} attachment(s) sent successfully`
          : 'Your message has been delivered'
      });

      setMessage('');
      setReplyTo(null);
      setSelectedFiles([]);
      setSelectedImages([]);
      setShowEmojiPicker(false);
    } catch (error: unknown) {
      console.error('Failed to send message:', error);

      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 419) {
        toast.error('Session expired', {
          id: toastId,
          description: 'Redirecting to login…',
        });
        window.dispatchEvent(new CustomEvent('session-expired'));
        return;
      }

      // Error notification
      toast.error('Failed to send message', {
        id: toastId,
        description: 'Please check your connection and try again',
        action: {
          label: 'Retry',
          onClick: () => handleSendMessage(e)
        }
      });
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Add files to selected files array (non-images)
    setSelectedFiles(prev => [...prev, ...Array.from(files)]);

    toast.success(`${files.length} file(s) selected`, {
      description: `Ready to send ${files.length} file${files.length > 1 ? 's' : ''}`
    });

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Add images to selected images array
    setSelectedImages(prev => [...prev, ...Array.from(files)]);

    toast.success(`${files.length} image(s) selected`, {
      description: `Ready to send ${files.length} image${files.length > 1 ? 's' : ''}`
    });

    // Clear the input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const openImagePreview = (index: number) => {
    setPreviewImageIndex(index);
    setImagePreviewOpen(true);
  };

  const getFileIcon = (fileName: string) => {
    if (!fileName || typeof fileName !== 'string') {
      return <File className="h-4 w-4 text-gray-500" />;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'zip':
      case 'rar':
        return <ArchiveIcon className="h-4 w-4 text-yellow-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-4 w-4 text-pink-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const toastId = toast.loading('Adding note...', {
      description: 'Saving internal note'
    });

    try {
      const formData = new FormData();
      formData.append('message', newNote.trim());
      formData.append('message_type', 'text');
      formData.append('is_internal_note', '1'); // Use '1' for true in FormData

      // Use fetch for AJAX request instead of Inertia
      const sendUrl = isCustomerView
        ? route('customer.conversations.messages.store', conversation.id)
        : route('crm.livechat.send-message', conversation.id);

      const { data } = await window.axios.post(sendUrl, formData);

      toast.success('Note added!', {
        id: toastId,
        description: 'Internal note has been saved successfully'
      });

      setNewNote('');

      // Refresh the page to show the new note
      router.reload();
    } catch (error) {
      console.error('Failed to add note:', error);

      toast.error('Failed to add note', {
        id: toastId,
        description: 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => handleAddNote()
        }
      });
    }
  };

  const getMessageStatusIcon = (message: ChatMessage) => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isCurrentUser = (userId: number | null) => {
    // Get the current authenticated user ID from the page props
    const currentUserId = page.props.auth.user?.id;
    return userId === currentUserId;
  };

  // Message type detection functions
  const isGuestMessage = (message: ChatMessage) => {
    return !message.user_id && !isAIMessage(message);
  };

  const isAIMessage = (message: ChatMessage) => {
    return message.metadata?.is_ai_response === true;
  };

  const isHumanAgentMessage = (message: ChatMessage) => {
    return message.user_id && !isAIMessage(message);
  };

  const getMessageSender = (message: ChatMessage) => {
    if (isAIMessage(message)) {
      return 'Tekrem AI Assistant';
    }
    if (isHumanAgentMessage(message)) {
      return message.user?.name || 'Agent';
    }
    if (isGuestMessage(message)) {
      const guestName = message.metadata?.guest_name;
      const guestEmail = message.metadata?.guest_email;

      if (guestName && guestEmail) {
        return `${guestName} (${guestEmail})`;
      }
      if (guestName) {
        return guestName;
      }
      if (guestEmail) {
        return guestEmail;
      }
      return 'Guest';
    }
    return 'Unknown';
  };

  const getMessageSenderInitials = (message: ChatMessage) => {
    if (isAIMessage(message)) {
      return 'AI';
    }
    if (isHumanAgentMessage(message)) {
      return getInitials(message.user?.name || 'Agent');
    }
    if (isGuestMessage(message)) {
      const guestName = message.metadata?.guest_name;
      if (guestName) {
        return getInitials(guestName);
      }
      return 'G';
    }
    return 'U';
  };

  // Handler functions for message actions
  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
  };

  const handleEdit = (message: ChatMessage) => {
    setEditingMessage(message);
  };

  const handleShowComments = (message: ChatMessage) => {
    setShowComments(message);
  };

  const handleShowEditHistory = (message: ChatMessage) => {
    setShowEditHistory(message);
  };

  const handleRefresh = () => {
    router.reload();
  };

  const LayoutComponent = isCustomerView ? CustomerLayout : AppLayout;

  const headerContent = embedded ? null : (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isCustomerView && isProjectChat) {
              router.get(route('customer.projects.show', project?.id));
            } else if (isProjectChat) {
              router.get(route('projects.show', project?.id));
            } else {
              router.get(route('crm.livechat.index'));
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isProjectChat ? 'Back to Project' : 'Back to Chat'}
        </Button>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {isProjectChat ? `${project?.name} - Team Chat` : conversation.display_title}
          </h2>
          {isProjectChat && (
            <Badge variant="outline" className="ml-2">
              Project Chat
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
          {conversation.status}
        </Badge>
        <Badge variant="outline">
          {conversation.priority}
        </Badge>
        {!isCustomerView && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailsOpen(true)}
              title="Chat details"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFullScreen(!isFullScreen);
                toast.success(isFullScreen ? 'Exited full screen' : 'Entered full screen', {
                  description: isFullScreen ? 'Chat returned to normal view' : 'Chat is now in full screen mode'
                });
              }}
              title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const chatContainerClass = embedded
    ? 'h-full min-h-0 flex flex-col'
    : isFullScreen
      ? 'fixed inset-0 bg-background z-50 flex flex-col'
      : 'h-[calc(100vh-8rem)] flex flex-col';

  const chatContent = (
    <div className={embedded ? 'h-full flex flex-col min-h-0' : undefined}>
      <Head title={`Chat - ${conversation.display_title}`} />

      <div className={chatContainerClass}>
        {embedded && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-background shrink-0">
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{conversation.display_title}</h3>
              {conversation.conversable && (
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.conversable.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                {conversation.status}
              </Badge>
              {!isCustomerView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailsOpen(true)}
                  title="Chat details"
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        {/* Full-screen header */}
        {isFullScreen && (
          <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isCustomerView && isProjectChat) {
                    router.get(route('customer.projects.show', project?.id));
                  } else if (isProjectChat) {
                    router.get(route('projects.show', project?.id));
                  } else {
                    router.get(route('crm.livechat.index'));
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isProjectChat ? 'Back to Project' : 'Back to Chat'}
              </Button>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                  {isProjectChat ? `${project?.name} - Team Chat` : conversation.display_title}
                </h2>
                {isProjectChat && (
                  <Badge variant="outline" className="ml-2">
                    Project Chat
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                {conversation.status}
              </Badge>
              <Badge variant="outline">
                {conversation.priority}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailsOpen(true)}
                title="Chat details"
                className={`transition-colors ${detailsOpen ? 'bg-muted' : ''}`}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsFullScreen(false);
                  toast.success('Exited full screen', {
                    description: 'Chat returned to normal view'
                  });
                }}
                title="Exit full screen"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col w-full">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <PinnedMessages
              pinnedMessages={pinnedMessages}
              onRefresh={handleRefresh}
            />

            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`message-${msg.id}`}
                  className={`group flex ${isCurrentUser(msg.user_id) ? 'justify-end' :
                    isGuestMessage(msg) ? 'justify-start' :
                      'justify-start'
                    } transition-colors duration-500`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isCurrentUser(msg.user_id) ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                    <Avatar className={`h-8 w-8 ${isAIMessage(msg) ? 'bg-purple-100 border-purple-200' :
                      isGuestMessage(msg) ? 'bg-blue-100 border-blue-200' :
                        ''
                      }`}>
                      <AvatarImage src={msg.user?.profile_photo_url || undefined} />
                      <AvatarFallback className={
                        isAIMessage(msg) ? 'bg-purple-100 text-purple-600' :
                          isGuestMessage(msg) ? 'bg-blue-100 text-blue-600' :
                            ''
                      }>
                        {getMessageSenderInitials(msg)}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`space-y-1 ${isCurrentUser(msg.user_id) ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Pin indicator */}
                      {msg.is_pinned && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          <Pin className="h-3 w-3" />
                          <span>Pinned message</span>
                        </div>
                      )}
                      {/* Reply indicator */}
                      {msg.reply_to && (
                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 rounded p-2 mb-1">
                          <div className="flex items-center gap-1 mb-1">
                            <Reply className="h-3 w-3" />
                            <span>Replying to {msg.reply_to.user?.name}</span>
                          </div>
                          <p className="truncate">{msg.reply_to.message.substring(0, 50)}...</p>
                        </div>
                      )}

                      {/* Message bubble with WhatsApp-style reactions */}
                      <div className="relative">
                        <div
                          className={`rounded-2xl px-3 py-2 shadow-sm ${isCurrentUser(msg.user_id)
                            ? 'bg-primary text-primary-foreground'
                            : isAIMessage(msg)
                              ? 'border border-purple-200 bg-purple-50 text-foreground dark:border-purple-900 dark:bg-purple-950/40'
                              : isGuestMessage(msg)
                                ? 'border border-blue-200 bg-blue-50 text-foreground dark:border-blue-900 dark:bg-blue-950/40'
                                : 'border bg-card text-card-foreground'
                            }`}
                        >
                          {/* Message sender header for non-current user messages */}
                          {!isCurrentUser(msg.user_id) && (
                            <div className="flex items-center gap-1 mb-1">
                              {isAIMessage(msg) ? (
                                <>
                                  <Sparkles className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs font-medium text-purple-600">Tekrem AI Assistant</span>
                                </>
                              ) : isGuestMessage(msg) ? (
                                <>
                                  <User className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs font-medium text-blue-600">{getMessageSender(msg)}</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3 h-3 text-gray-600" />
                                  <span className="text-xs font-medium text-gray-600">{msg.user?.name || 'Agent'}</span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Internal note indicator */}
                          {msg.is_internal_note && (
                            <div className="text-xs opacity-75 mb-1">
                              🔒 Internal Note
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{msg.message}</p>

                          {/* Edit indicator */}
                          {msg.is_edited && (
                            <div className="text-xs opacity-75 mt-1">
                              <span className="italic">edited</span>
                              {msg.edited_at && (
                                <span className="ml-1">
                                  {new Date(msg.edited_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {msg.attachments.map((attachment, index) => {
                                const isImage = attachment.mime_type?.startsWith('image/');

                                if (isImage) {
                                  return (
                                    <div key={index} className="max-w-xs">
                                      <div className="relative group">
                                        <img
                                          src={attachment.url}
                                          alt={attachment.name}
                                          className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                          onClick={() => {
                                            // Open image in new tab for now
                                            window.open(attachment.url, '_blank');
                                          }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/50 hover:bg-black/70"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              window.open(attachment.url, '_blank');
                                            }}
                                          >
                                            <ZoomIn className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 truncate">{attachment.name}</p>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white/10 rounded text-sm">
                                      {getFileIcon(attachment.name)}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{attachment.name}</p>
                                        <p className="text-xs opacity-75">
                                          {attachment.size ? formatFileSize(attachment.size) : 'Unknown size'}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => window.open(attachment.url, '_blank')}
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          )}
                        </div>

                        {/* WhatsApp-style reactions positioned over the message bubble */}
                        <MessageReactions
                          messageId={msg.id}
                          reactions={msg.reactions || []}
                          currentUserId={conversation.creator?.id || 0}
                          onRefresh={handleRefresh}
                          style="whatsapp"
                          position={isCurrentUser(msg.user_id) ? 'right' : 'left'}
                        />
                      </div>

                      {/* Message metadata and actions */}
                      <div className={`flex items-center gap-2 text-xs text-gray-500 mt-1 ${isCurrentUser(msg.user_id) ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="flex items-center gap-1">
                          <span>{formatMessageTime(msg.created_at)}</span>
                          {isCurrentUser(msg.user_id) && getMessageStatusIcon(msg)}
                        </div>

                        {/* Message Actions - includes reactions, comments, edit, etc. */}
                        <MessageActions
                          message={msg}
                          currentUserId={conversation.creator?.id || 0}
                          onReply={handleReply}
                          onShowComments={handleShowComments}
                          onEdit={handleEdit}
                          onShowEditHistory={handleShowEditHistory}
                          onRefresh={handleRefresh}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyTo && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Reply className="h-4 w-4" />
                    <span>Replying to {replyTo.user?.name}</span>
                    <span className="text-gray-500">"{replyTo.message.substring(0, 30)}..."</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReplyTo(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-900">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Images to send:</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={image.name}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImagePreview(index)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeSelectedImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 right-1">
                        <div className="bg-black/50 text-white text-xs px-1 py-0.5 rounded truncate">
                          {image.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-900">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Files to send:</span>
                </div>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeSelectedFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="relative shrink-0 border-t bg-background p-3">
              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-2 rounded-2xl border bg-muted/40 px-3 py-2"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleImageUpload}
                  title="Send images"
                  className="shrink-0 text-muted-foreground"
                >
                  <Image className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleFileUpload}
                  title="Send files"
                  className="shrink-0 text-muted-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="relative min-w-0 flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      notifyTyping(e.target.value.trim().length > 0);
                    }}
                    onBlur={() => notifyTyping(false)}
                    placeholder="Type a message..."
                    className="max-h-32 min-h-[40px] w-full resize-none border-0 bg-transparent py-2 text-sm text-foreground outline-none focus:ring-0"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-4 w-4" />
                </Button>

                <Button
                  type="submit"
                  size="icon"
                  disabled={
                    !message.trim() &&
                    selectedFiles.length === 0 &&
                    selectedImages.length === 0
                  }
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>



              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full right-4 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 z-50 w-[100%]"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium">Choose an emoji</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowEmojiPicker(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                        onClick={() => addEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden File Inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.mp4,.avi,.mov,.mp3,.wav"
                className="hidden"
                onChange={handleFileChange}
              />

              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

        {!isCustomerView && (
          <ConversationDetailsSheet
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            conversation={conversation}
            messages={messages}
            userRole={userRole}
            isProjectChat={isProjectChat}
            teamMembers={teamMembers}
            project={project}
            newNote={newNote}
            onNewNoteChange={setNewNote}
            onAddNote={handleAddNote}
          />
        )}
        </div>
      </div>

      {/* WhatsApp-style Image Preview Modal */}
      {imagePreviewOpen && selectedImages.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setImagePreviewOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Navigation */}
            {selectedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={() => setPreviewImageIndex(prev => prev > 0 ? prev - 1 : selectedImages.length - 1)}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10"
                  onClick={() => setPreviewImageIndex(prev => prev < selectedImages.length - 1 ? prev + 1 : 0)}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Main Image */}
            <div className="max-w-4xl max-h-[80vh] flex items-center justify-center">
              <img
                src={URL.createObjectURL(selectedImages[previewImageIndex])}
                alt={selectedImages[previewImageIndex].name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="bg-black/50 rounded-lg p-4">
                <h3 className="font-medium">{selectedImages[previewImageIndex].name}</h3>
                <p className="text-sm text-gray-300">
                  {formatFileSize(selectedImages[previewImageIndex].size)}
                  {selectedImages.length > 1 && (
                    <span className="ml-2">
                      {previewImageIndex + 1} of {selectedImages.length}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      {editingMessage && (
        <MessageEdit
          message={editingMessage}
          isOpen={!!editingMessage}
          onClose={() => setEditingMessage(null)}
          onRefresh={handleRefresh}
        />
      )}

      {showComments && (
        <MessageComments
          message={showComments}
          currentUserId={conversation.creator?.id || 0}
          isOpen={!!showComments}
          onClose={() => setShowComments(null)}
          onRefresh={handleRefresh}
        />
      )}

      {showEditHistory && (
        <MessageEditHistory
          message={showEditHistory}
          isOpen={!!showEditHistory}
          onClose={() => setShowEditHistory(null)}
        />
      )}
    </div>
  );

  if (embedded) {
    return chatContent;
  }

  return isCustomerView ? (
    <LayoutComponent
      title={`Chat - ${conversation.display_title}`}      
    >
      {!isFullScreen && headerContent}
      {chatContent}
    </LayoutComponent>
  ) : (
    <LayoutComponent
      title={`Chat - ${conversation.display_title}`}
      renderHeader={() => headerContent}
    >
      {chatContent}
    </LayoutComponent>
  );
}
