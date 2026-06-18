import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  UserPlus,
  FileText,
  Ticket,
  MessageSquare,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslate from '@/Hooks/useTranslate';

interface ActivityItem {
  id?: string | number;
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
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(activities.length / maxItems));

  const paginatedActivities = useMemo(() => {
    const start = (page - 1) * maxItems;
    return activities.slice(start, start + maxItems);
  }, [activities, maxItems, page]);

  const rangeStart = activities.length === 0 ? 0 : (page - 1) * maxItems + 1;
  const rangeEnd = Math.min(page * maxItems, activities.length);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  // Reset to page 1 when the activity list changes (e.g. dashboard refresh)
  React.useEffect(() => {
    setPage(1);
  }, [activities.length]);

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
          {paginatedActivities.map((activity, index) => (
            <div
              key={activity.id ?? `${activity.type}-${activity.timestamp}-${index}`}
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
            <div className="flex items-center justify-between gap-2 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Showing {rangeStart}–{rangeEnd} of {activities.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[4.5rem] text-center text-xs text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
