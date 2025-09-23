import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';

export type CardType = {
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

export type ColumnType = {
  id: number;
  name: string;
  order?: number;
  color?: string;
  is_done_column?: boolean;
  cards: CardType[];
};

interface KanbanColumnProps {
  column: ColumnType;
  onCardCreate?: () => void;
  onCardEdit?: (card: CardType) => void;
}

export function KanbanColumn({ column, onCardCreate, onCardEdit }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const cardIds = column.cards.map((card) => card.id);

  return (
    <div className="bg-muted rounded-lg min-w-[320px] w-80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          {column.color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          <span className="font-semibold text-gray-700">{column.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
            {column.cards.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCardCreate}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 px-2 py-2 space-y-3 min-h-[200px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-8 border-2 border-dashed border-gray-200 rounded-lg">
              No cards
            </div>
          )}
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={() => onCardEdit?.(card)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}