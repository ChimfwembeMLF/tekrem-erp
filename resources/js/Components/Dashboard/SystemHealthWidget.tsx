import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Server,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useTranslate from '@/Hooks/useTranslate';

interface SystemHealthData {
  database: {
    status: string;
    responseTime: string;
    connections: string;
  };
  cache: {
    status: string;
    responseTime: string;
    driver: string;
  };
  storage: {
    status: string;
    freeSpace: string;
    totalSpace: string;
    usedPercentage: number;
  };
  overallHealth: string;
  lastChecked: string;
}

interface SystemHealthWidgetProps {
  data: SystemHealthData;
}

export default function SystemHealthWidget({ data }: SystemHealthWidgetProps) {
  const { t } = useTranslate();

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const healthItems = [
    {
      name: 'Database',
      icon: Database,
      status: data.database.status,
      details: [
        { label: 'Response Time', value: data.database.responseTime },
        { label: 'Connection', value: data.database.connections },
      ],
    },
    {
      name: 'Cache',
      icon: Server,
      status: data.cache.status,
      details: [
        { label: 'Response Time', value: data.cache.responseTime },
        { label: 'Driver', value: data.cache.driver },
      ],
    },
    {
      name: 'Storage',
      icon: HardDrive,
      status: data.storage.status,
      details: [
        { label: 'Free Space', value: data.storage.freeSpace },
        { label: 'Used', value: `${data.storage.usedPercentage}%` },
      ],
      progress: data.storage.usedPercentage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('dashboard.system_health', 'System Health')}</span>
          <Badge
            variant={data.overallHealth === 'healthy' ? 'default' : 'destructive'}
          >
            {data.overallHealth === 'healthy' ? 'Operational' : 'Issues'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthItems.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className={cn("flex items-center gap-1", getHealthStatusColor(item.status))}>
                {getHealthStatusIcon(item.status)}
                <span className="text-sm capitalize">{item.status}</span>
              </div>
            </div>
            
            {item.progress !== undefined && (
              <Progress value={item.progress} className="h-2" />
            )}
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {item.details.map((detail) => (
                <div key={detail.label} className="flex justify-between">
                  <span>{detail.label}:</span>
                  <span>{detail.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            {t('dashboard.last_checked', 'Last checked')}: {new Date(data.lastChecked).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
