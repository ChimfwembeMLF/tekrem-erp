import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { ArrowLeft, Send, Paperclip, Download, User, Clock, MessageCircle } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  message: string;
  message_type: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  attachments?: Array<{
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
  }>;
}

interface ChatParticipant {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Chat {
  id: number;
  title: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
}

interface Props {
  chat: Chat;
}

export default function ShowChat({ chat }: Props) {
  const { t } = useTranslate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, setData, post, processing, reset, errors } = useForm({
    message: '',
    attachments: [] as File[],
  });

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.message.trim() && selectedFiles.length === 0) {
      toast.error(t('Please enter a message or attach a file'));
      return;
    }

    const formData = new FormData();
    formData.append('message', data.message);
    
    selectedFiles.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    post(route('customer.communications.chats.messages.store', chat.id), {
      data: formData,
      onSuccess: () => {
        reset();
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success(t('Message sent successfully'));
      },
      onError: () => {
        toast.error(t('Failed to send message'));
      },
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
                {t('Back to Chats')}
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {chat.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge className={getStatusColor(chat.status)}>
                  {t(chat.status.charAt(0).toUpperCase() + chat.status.slice(1))}
                </Badge>
                <span className="text-sm text-gray-500">
                  {t('Created')} {new Date(chat.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Messages Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t('Conversation')}
                </CardTitle>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {chat.messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user?.avatar} />
                      <AvatarFallback>
                        {message.user ? getInitials(message.user.name) : 'S'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.user?.name || t('Support Agent')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded p-2">
                                <div className="flex items-center space-x-2">
                                  <Paperclip className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{attachment.file_name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.file_size)})
                                  </span>
                                </div>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Textarea
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder={t('Type your message...')}
                      className="flex-1 min-h-[60px]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={processing || (!data.message.trim() && selectedFiles.length === 0)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                </form>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('Participants')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {chat.participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.user.avatar} />
                      <AvatarFallback>
                        {getInitials(participant.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{participant.user.name}</p>
                      <p className="text-xs text-gray-500">{participant.user.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
