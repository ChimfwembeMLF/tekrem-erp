import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { MessageCircle, Search, Plus, Clock, User, Users, ArrowLeft } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

interface Chat {
  id: number;
  title: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
  lastMessage?: {
    id: number;
    message: string;
    created_at: string;
    user?: {
      name: string;
    };
  };
  unread_count?: number;
}

interface Props {
  chats: {
    data: Chat[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    status?: string;
    search?: string;
  };
}

export default function Chats({ chats, filters }: Props) {
  const { t } = useTranslate();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

  const handleSearch = () => {
    router.get(route('customer.communications.chats'), {
      search: searchTerm,
      status: statusFilter,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (field: string, value: string) => {
    if (field === 'status') {
      setStatusFilter(value);
    }
    
    router.get(route('customer.communications.chats'), {
      search: searchTerm,
      status: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <CustomerLayout>
      <Head title="Chat Conversations" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('Chat Conversations')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('Manage your chat conversations with our support team')}
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href={route('customer.communications.index')}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('All Communications')}
              </Button>
            </Link>
            <Link href={route('customer.communications.create')}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('New Request')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('Search conversations...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={statusFilter || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Statuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('All Statuses')}</SelectItem>
                    <SelectItem value="active">{t('Active')}</SelectItem>
                    <SelectItem value="pending">{t('Pending')}</SelectItem>
                    <SelectItem value="closed">{t('Closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>
                {t('Search')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat List */}
        <div className="space-y-4">
          {chats.data.length > 0 ? (
            chats.data.map((chat) => (
              <Card key={chat.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <Link href={route('customer.communications.chats.show', chat.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-blue-600" />
                          </div>
                          {chat.unread_count && chat.unread_count > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {chat.unread_count}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {chat.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(chat.status)}>
                                {t(chat.status.charAt(0).toUpperCase() + chat.status.slice(1))}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatTime(chat.updated_at)}
                              </span>
                            </div>
                          </div>
                          
                          {chat.lastMessage && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {chat.lastMessage.user?.name && (
                                <span className="font-medium">{chat.lastMessage.user.name}: </span>
                              )}
                              {chat.lastMessage.message}
                            </p>
                          )}
                          
                          <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {chat.participants.length} {t('participants')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {t('Created')} {new Date(chat.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('No conversations found')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('You haven\'t started any chat conversations yet.')}
                </p>
                <Link href={route('customer.communications.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Start a Conversation')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {chats.last_page > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {chats.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => link.url && router.get(link.url)}
                  disabled={!link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
