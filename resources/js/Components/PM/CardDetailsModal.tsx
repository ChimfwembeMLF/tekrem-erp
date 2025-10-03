import { CardActivityLog } from './CardActivityLog';
import React from 'react';
import { Modal } from '@/Components/ui/modal';
import { CardType } from './KanbanBoard';
import { Badge } from '@/Components/ui/badge';
import { MessageSquare, Paperclip, User, Calendar } from 'lucide-react';
import { CardComments } from './CardComments';
import { CardAttachments } from './CardAttachments';
import { CardSubtasks } from './CardSubtasks';

interface CardDetailsModalProps {
  card: CardType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CardDetailsModal({ card, isOpen, onClose }: CardDetailsModalProps) {
  if (!card) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card.title} size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{card.status}</Badge>
          {card.priority && <Badge variant="secondary">{card.priority}</Badge>}
          {card.story_points && <Badge variant="secondary">{card.story_points} pts</Badge>}
        </div>
        <div className="text-gray-700 text-sm whitespace-pre-line">
          {card.description || <span className="italic text-gray-400">No description</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {card.due_date && (
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(card.due_date).toLocaleDateString()}</span>
          )}
          {card.assignees && card.assignees.length > 0 && (
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {card.assignees.join(', ')}</span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {card.comments_count || 0} Comments</span>
          <span className="flex items-center gap-1"><Paperclip className="h-4 w-4" /> {card.attachments_count || 0} Attachments</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <CardComments cardId={card.id} />
          <CardAttachments cardId={card.id} />
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <CardSubtasks cardId={card.id} />
          <CardActivityLog cardId={card.id} />
        </div>
      </div>
    </Modal>
  );
}
