import React, { useState, useRef, useEffect } from 'react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Download, Smile, Image } from 'lucide-react';
import MessageReactions from '@/Components/LiveChat/MessageReactions';
import { toast } from 'sonner';
import { Head, Link, router } from '@inertiajs/react';

// Types matching backend-provided chat props
interface Reaction {
  emoji: string;
  users: number[];
  count: number;
}

interface ChatMessage {
  id: number;
  message: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  attachments?: Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }>;
  reactions?: Reaction[];
}

interface ChatParticipant {
  id: number;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface Chat {
  id: number;
  title: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

interface Props {
  chat: Chat;
}

export default function CustomerChat({ chat }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && selectedFiles.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }
    // TODO: Wire to Inertia post (see ShowChat)
    setMessage('');
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Message sent (demo)');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <CustomerLayout>
      <Head title={`Chat - ${chat.title}`} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={route('customer.communications.chats')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chats
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {chat.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge>{chat.status}</Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(chat.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages Area */}
          <div className="lg:col-span-3">
            <div className="h-[600px] flex flex-col border rounded-lg bg-white dark:bg-gray-900">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.messages.map((msg) => (
                  <div key={msg.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.user?.avatar} />
                      <AvatarFallback>
                        {msg.user ? getInitials(msg.user.name) : 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {msg.user?.name || 'Support Agent'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 relative">
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded p-2">
                                <div className="flex items-center space-x-2">
                                  <Paperclip className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{attachment.file_name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.file_size)})
                                  </span>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => window.open(attachment.file_path, '_blank')}>
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Message Reactions */}
                        <MessageReactions
                          messageId={msg.id}
                          reactions={msg.reactions || []}
                          currentUserId={msg.user?.id || 0}
                          onRefresh={() => {}}
                          style="whatsapp"
                          position="left"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 min-h-[40px]"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!message.trim() && selectedFiles.length === 0}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                </form>
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeFile(idx)}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Emoji Picker (demo only) */}
                {showEmojiPicker && (
                  <div className="absolute bottom-16 right-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 z-50 w-64">
                    <div className="flex flex-wrap gap-2">
                      {["😀","😂","😍","😎","👍","🙏","🎉","😢","😡","🤔"].map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                          onClick={() => { setMessage(m => m + emoji); setShowEmojiPicker(false); }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Sidebar: Participants */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg bg-white dark:bg-gray-900">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">Participants</h2>
              </div>
              <div className="p-4 space-y-3">
                {chat.participants.map((p) => (
                  <div key={p.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={p.user.avatar} />
                      <AvatarFallback>{getInitials(p.user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{p.user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
