import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Eye, 
  Trash2,
  Settings,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'card_assigned' | 'card_updated' | 'sprint_started' | 'sprint_completed' | 'comment_added' | 'due_date_approaching' | 'board_invitation';
  title: string;
  message: string;
  data: {
    card_id?: number;
    board_id?: number;
    project_id?: number;
    sprint_id?: number;
    user_id?: number;
    [key: string]: any;
  };
  read_at: string | null;
  created_at: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: number) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: number) => void;
  onClearAll: () => void;
}

const notificationIcons = {
  card_assigned: Users,
  card_updated: FileText,
  sprint_started: Calendar,
  sprint_completed: CheckCircle,
  comment_added: MessageSquare,
  due_date_approaching: AlertTriangle,
  board_invitation: Users,
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export default function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read_at;
      case 'read':
        return notification.read_at;
      default:
        return true;
    }
  });

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const today = new Date();
    const notificationDate = new Date(notification.created_at);
    const diffInDays = Math.floor((today.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));

    let group = 'Older';
    if (diffInDays === 0) {
      group = 'Today';
    } else if (diffInDays === 1) {
      group = 'Yesterday';
    } else if (diffInDays <= 7) {
      group = 'This Week';
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    const { data } = notification;
    switch (notification.type) {
      case 'card_assigned':
      case 'card_updated':
        if (data.card_id && data.board_id) {
          window.location.href = `/pm/boards/${data.board_id}/cards/${data.card_id}`;
        }
        break;
      case 'sprint_started':
      case 'sprint_completed':
        if (data.sprint_id && data.board_id) {
          window.location.href = `/pm/boards/${data.board_id}/sprints/${data.sprint_id}`;
        }
        break;
      case 'board_invitation':
        if (data.board_id && data.project_id) {
          window.location.href = `/pm/projects/${data.project_id}/boards/${data.board_id}`;
        }
        break;
      default:
        break;
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const IconComponent = notificationIcons[notification.type] || Bell;
    const isUnread = !notification.read_at;

    return (
      <div
        className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
          isUnread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${isUnread ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <IconComponent className={`h-4 w-4 ${isUnread ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={priorityColors[notification.priority]}>
                    {notification.priority}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isUnread ? (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      // Mark as unread functionality would go here
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Mark as unread
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onClearAll}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear all
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
              
              <TabsContent value={filter} className="mt-0">
                <ScrollArea className="h-96">
                  {Object.keys(groupedNotifications).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mb-2" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                      <div key={group}>
                        <div className="px-4 py-2 bg-gray-100 border-b">
                          <h5 className="text-sm font-medium text-gray-700">{group}</h5>
                        </div>
                        {groupNotifications.map((notification) => (
                          <NotificationItem key={notification.id} notification={notification} />
                        ))}
                      </div>
                    ))
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Usage in your layout or header component:
/*
<NotificationCenter
  notifications={notifications}
  unreadCount={unreadCount}
  onMarkAsRead={(id) => {
    router.post(`/notifications/${id}/read`);
  }}
  onMarkAllAsRead={() => {
    router.post('/notifications/mark-all-read');
  }}
  onDelete={(id) => {
    router.delete(`/notifications/${id}`);
  }}
  onClearAll={() => {
    router.delete('/notifications/clear-all');
  }}
/>
*/
