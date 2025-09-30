import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  Bug,
  Lightbulb,
  CheckSquare,
  User,
  Target,
  Edit,
  Archive,
  Copy,
  Trash2
} from 'lucide-react';

export interface IssueCardProps {
  issue: {
    id: number;
    title: string;
    key: string;
    type?: 'story' | 'task' | 'bug' | 'epic' | 'subtask';
    priority?: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
    status?: string;
    assignee?: {
      id: number;
      name: string;
      avatar?: string;
    } | null;
    labels?: Array<{
      id: number;
      name: string;
      color?: string;
    }>;
    story_points?: number;
    due_date?: string;
    comments_count?: number;
    attachments_count?: number;
    subtasks_count?: number;
    completed_subtasks_count?: number;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
}

const typeIcons = {
  story: <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />,
  task: <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
  bug: <Bug className="h-4 w-4 text-red-600 dark:text-red-400" />,
  epic: <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
  subtask: <ArrowUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
};

const priorityIcons = {
  highest: <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />,
  high: <ArrowUp className="h-4 w-4 text-orange-500 dark:text-orange-400" />,
  medium: <Minus className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
  low: <ArrowDown className="h-4 w-4 text-green-500 dark:text-green-400" />,
  lowest: <ArrowDown className="h-4 w-4 text-muted-foreground" />,
};

const priorityColors = {
  highest: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
  lowest: 'border-l-muted',
};

export function IssueCard({ 
  issue, 
  onClick, 
  onEdit,
  onArchive,
  onDuplicate,
  onDelete,
  className = '' 
}: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `card-${issue.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click events during drag
    if (isDragging) return;
    e.preventDefault();
    try {
      onClick?.();
    } catch (error) {
      console.error('Error handling card click:', error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    // Prevent edit events during drag
    if (isDragging) return;
    e.stopPropagation();
    try {
      onEdit?.();
    } catch (error) {
      console.error('Error handling card edit:', error);
    }
  };

  // Format due date with better logic
  const formatDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { text: 'Overdue', className: 'text-red-600' };
      } else if (diffDays === 0) {
        return { text: 'Today', className: 'text-orange-600' };
      } else if (diffDays === 1) {
        return { text: 'Tomorrow', className: 'text-yellow-600' };
      } else if (diffDays <= 7) {
        return { text: `${diffDays} days`, className: 'text-blue-600' };
      } else {
        return { text: date.toLocaleDateString(), className: 'text-muted-foreground' };
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return { text: 'Invalid date', className: 'text-muted-foreground' };
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`
        bg-card rounded-lg border p-3 cursor-pointer
        hover:shadow-md transition-shadow duration-200
        ${isDragging ? 'shadow-lg transform rotate-1' : ''}
        ${priorityColors[issue.priority || 'medium']}
        ${className}
      `}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {/* Header with type, key, and actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {typeIcons[issue.type || 'task']}
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {issue.key}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {issue.priority && priorityIcons[issue.priority]}
          {/* Card Actions Dropdown */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 hover:bg-accent rounded transition-all"
                  title="Card options"
                  aria-label="Card options"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      onEdit?.();
                    } catch (error) {
                      console.error('Error editing card:', error);
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Issue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      onDuplicate?.();
                    } catch (error) {
                      console.error('Error duplicating card:', error);
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Issue
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      onArchive?.();
                    } catch (error) {
                      console.error('Error archiving card:', error);
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Issue
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${issue.title}"? This action cannot be undone.`)) {
                      try {
                        onDelete?.();
                      } catch (error) {
                        console.error('Error deleting card:', error);
                      }
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Issue
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground mb-3 leading-5">
        {issue.title}
      </h3>

      {/* Labels */}
      {issue.labels && issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {issue.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-1 text-xs rounded text-foreground"
              style={{
                backgroundColor: label.color || 'hsl(var(--muted))',
                color: '#374151'
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks progress */}
      {issue.subtasks_count && issue.subtasks_count > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckSquare className="h-3 w-3" />
            <span>
              {issue.completed_subtasks_count || 0}/{issue.subtasks_count}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-green-500 h-1 rounded-full transition-all"
              style={{
                width: `${((issue.completed_subtasks_count || 0) / issue.subtasks_count) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Story points */}
          {issue.story_points && (
            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {issue.story_points}
              </span>
            </div>
          )}

          {/* Due date with smart formatting */}
          {issue.due_date && (
            <div className={`flex items-center gap-1 text-xs ${formatDueDate(issue.due_date).className}`}>
              <Calendar className="h-3 w-3" />
              <span title={new Date(issue.due_date).toLocaleDateString()}>
                {formatDueDate(issue.due_date).text}
              </span>
            </div>
          )}

          {/* Comments */}
          {issue.comments_count && issue.comments_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageSquare className="h-3 w-3" />
              <span>{issue.comments_count}</span>
            </div>
          )}

          {/* Attachments */}
          {issue.attachments_count && issue.attachments_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Paperclip className="h-3 w-3" />
              <span>{issue.attachments_count}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {issue.assignee ? (
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {issue.assignee.avatar ? (
              <img
                src={issue.assignee.avatar}
                alt={issue.assignee.name}
                className="w-full h-full object-cover"
                title={issue.assignee.name}
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {issue.assignee.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
            <User className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}