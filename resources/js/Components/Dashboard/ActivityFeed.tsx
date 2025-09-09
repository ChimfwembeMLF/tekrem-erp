import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  UserPlus,
  FileText,
  Ticket,
  MessageSquare,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslate from '@/Hooks/useTranslate';

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
}

export default function ActivityFeed({ activities, maxItems = 8 }: ActivityFeedProps) {
  const { t } = useTranslate();

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="h-3 w-3" />;
      case 'message-square':
        return <MessageSquare className="h-3 w-3" />;
      case 'ticket':
        return <Ticket className="h-3 w-3" />;
      case 'file-text':
        return <FileText className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'user_registered':
        return 'default';
      case 'communication':
        return 'secondary';
      case 'ticket':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t('dashboard.recent_activity', 'Recent Activity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, maxItems).map((activity, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className={cn("p-2 rounded-full", getActivityColor(activity.color))}>
                {getActivityIcon(activity.icon)}
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <Badge variant={getActivityBadgeVariant(activity.type)} className="text-xs">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t('dashboard.no_activity', 'No recent activity')}</p>
            </div>
          )}
          
          {activities.length > maxItems && (
            <div className="text-center pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {t('dashboard.showing_activities', 'Showing {count} of {total} activities', {
                  count: maxItems,
                  total: activities.length,
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
