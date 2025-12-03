import React from 'react';
import { Link } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Link2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';

interface LinkedItemIndicatorProps {
  type: 'task' | 'card';
  linkedItem?: {
    id: number;
    name?: string;
    title?: string;
    status?: string;
  };
  className?: string;
  showLink?: boolean;
}

export default function LinkedItemIndicator({ 
  type, 
  linkedItem,
  className,
  showLink = true 
}: LinkedItemIndicatorProps) {
  const route = useRoute();

  if (!linkedItem) {
    return null;
  }

  const itemName = type === 'task' ? linkedItem.title : linkedItem.name;
  const linkRoute = type === 'task' 
    ? route('agile.cards.show', linkedItem.id)
    : route('tasks.show', linkedItem.id);

  return (
    <div className={cn("flex items-center gap-2 p-2 bg-purple-50 rounded-md border border-purple-200", className)}>
      <Link2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-purple-700 font-medium">
          Linked to {type === 'task' ? 'Card' : 'Task'}
        </div>
        <div className="text-sm text-gray-700 truncate">
          {itemName}
        </div>
      </div>
      {linkedItem.status && (
        <Badge variant="outline" className="text-xs">
          {linkedItem.status}
        </Badge>
      )}
      {showLink && (
        <Link 
          href={linkRoute}
          className="flex-shrink-0 text-purple-600 hover:text-purple-800"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
