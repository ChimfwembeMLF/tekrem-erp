import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/Components/ui/badge.jsx';
import { Calendar, User, AlertCircle, Clock, MessageSquare, Paperclip } from 'lucide-react';

export type CardType = {
  comments_count?: number;
  attachments_count?: number;
  id: number;
  title: string;
  description?: string;
  key: string | number;
  status?: string;
  assignees?: string[];
  tags?: string[];
  priority?: string;
  story_points?: number;
  due_date?: string;
  epic_id?: number;
  sprint_id?: number;
};

interface KanbanCardProps {
  card: CardType;
  onEdit?: () => void;
  isDragging?: boolean;
}

export function KanbanCard({ card, onEdit, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assigneeColors: Record<string, string> = {
    CK: 'bg-orange-400',
    CM: 'bg-purple-400',
    D: 'bg-red-400',
    default: 'bg-gray-400',
  };

  const priorityColors: Record<string, string> = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };

  const getPriorityIcon = (priority?: string) => {
    if (priority === 'critical' || priority === 'high') {
      return <AlertCircle className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg shadow-sm p-3 border cursor-pointer
        hover:shadow-md transition-shadow
        ${isDragging ? 'opacity-50' : ''}
        ${isOver ? 'ring-2 ring-blue-200' : ''}
      `}
      onClick={onEdit}
    >
      <div className="flex flex-col gap-2">
        {/* Header with title and key */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 flex-1">
            {card.title}
          </h4>
          <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
            {card.key}
          </span>
        </div>

        {/* Description if available */}
        {card.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0 h-5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {/* Left side - Priority and Story Points */}
          <div className="flex items-center gap-2">
            {card.priority && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${priorityColors[card.priority] || ''}`}>
                {getPriorityIcon(card.priority)}
                <span>{card.priority}</span>
              </div>
            )}
            {card.story_points && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                <span>{card.story_points} pts</span>
              </div>
            )}
            {/* Comments and Attachments */}
            {typeof card.comments_count === 'number' && card.comments_count > 0 && (
              <span className="flex items-center gap-1 text-gray-400 ml-2">
                <MessageSquare className="h-3 w-3" />
                {card.comments_count}
              </span>
            )}
            {typeof card.attachments_count === 'number' && card.attachments_count > 0 && (
              <span className="flex items-center gap-1 text-gray-400 ml-2">
                <Paperclip className="h-3 w-3" />
                {card.attachments_count}
              </span>
            )}
          </div>

          {/* Right side - Due date and assignees */}
          <div className="flex items-center gap-2">
            {card.due_date && (
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{new Date(card.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Assignees */}
        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <User className="h-3 w-3 text-gray-400" />
            <div className="flex gap-1">
              {card.assignees.slice(0, 3).map((assignee, index) => (
                <span
                  key={assignee}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white shadow ${
                    assigneeColors[assignee] || assigneeColors.default
                  }`}
                  title={assignee}
                >
                  {assignee}
                </span>
              ))}
              {card.assignees.length > 3 && (
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-gray-200 text-gray-600 border-2 border-white shadow">
                  +{card.assignees.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}