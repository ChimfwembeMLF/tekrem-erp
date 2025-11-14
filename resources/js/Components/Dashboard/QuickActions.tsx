import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
  UserPlus,
  Shield,
  Settings,
  BarChart3,
  Download,
  Grid,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  const { t } = useTranslate();
  const route = useRoute()
  const getActionIcon = (iconName: string) => {
    switch (iconName) {
      case 'user-plus':
        return <UserPlus className="h-4 w-4" />;
      case 'shield':
        return <Shield className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'bar-chart':
        return <BarChart3 className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'grid':
        return <Grid className="h-4 w-4" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  const getActionColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
      case 'green':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'gray':
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
      case 'purple':
        return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
      case 'orange':
        return 'bg-orange-100 text-orange-600 hover:bg-orange-200';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200';
      case 'red':
        return 'bg-red-100 text-red-600 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="h-5 w-5" />
          {t('dashboard.quick_actions', 'Quick Actions')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.quick_actions_desc', 'Common administrative tasks and shortcuts')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={route(action.route)}>
              <div className="group flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-all duration-200 cursor-pointer hover:shadow-sm">                
                <div className={cn(
                  "p-2 rounded-md transition-colors",
                  getActionColorClasses(action.color)
                )}>
                  {getActionIcon(action.icon)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.title}
                    </h4>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {actions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Grid className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('dashboard.no_actions', 'No quick actions available')}</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              {t('dashboard.view_all_admin', 'View All Admin Tools')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
