import React from 'react';
import { Badge } from '@/Components/ui/badge';
import { Link2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusBadgeProps {
  isLinked: boolean;
  syncStatus?: 'synced' | 'pending' | 'error';
  className?: string;
  showIcon?: boolean;
}

export default function SyncStatusBadge({ 
  isLinked, 
  syncStatus = 'synced',
  className,
  showIcon = true 
}: SyncStatusBadgeProps) {
  if (!isLinked) {
    return null;
  }

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: CheckCircle,
          label: 'Synced'
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Link2,
          label: 'Syncing...'
        };
      case 'error':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
          label: 'Sync Error'
        };
      default:
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Link2,
          label: 'Linked'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.color, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
