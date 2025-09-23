import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { KanbanColumn } from './KanbanColumn';
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

interface KanbanBoardProps {
  columns: ColumnType[];
  onCardMove?: (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => void;
  onCardCreate?: (columnId: number) => void;
  onCardEdit?: (card: CardType) => void;
  onColumnCreate?: () => void;
  className?: string;
}

export function KanbanBoard({
  columns: initialColumns,
  onCardMove,
  onCardCreate,
  onCardEdit,
  onColumnCreate,
  className = '',
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeCardData = findCard(active.id as number);
    setActiveCard(activeCardData || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id as number;

    // Find the active card and the column it's being dragged over
    const activeCard = findCard(activeId);
    const overColumn = findColumn(overId);
    const activeColumn = findColumnByCardId(activeId);

    if (!activeCard || !activeColumn) return;

    // If dropping on a column (not a card)
    if (overColumn && activeColumn.id !== overColumn.id) {
      setColumns((columns) => {
        const activeItems = activeColumn.cards;
        const overItems = overColumn.cards;

        // Remove card from active column
        const activeIndex = activeItems.findIndex((item) => item.id === activeId);
        const newActiveItems = activeItems.filter((item) => item.id !== activeId);

        // Add card to over column
        const newOverItems = [...overItems, activeCard];

        return columns.map((column) => {
          if (column.id === activeColumn.id) {
            return { ...column, cards: newActiveItems };
          } else if (column.id === overColumn.id) {
            return { ...column, cards: newOverItems };
          }
          return column;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id as number;
    const overId = over.id as number;

    const activeCard = findCard(activeId);
    const overCard = findCard(overId);
    const overColumn = findColumn(overId);

    if (!activeCard) {
      setActiveCard(null);
      return;
    }

    const activeColumn = findColumnByCardId(activeId);
    if (!activeColumn) {
      setActiveCard(null);
      return;
    }

    // If dropping on a card, insert before/after that card
    if (overCard) {
      const targetColumn = findColumnByCardId(overId);
      if (!targetColumn) {
        setActiveCard(null);
        return;
      }

      const activeIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
      const overIndex = targetColumn.cards.findIndex((card) => card.id === overId);

      if (activeColumn.id === targetColumn.id) {
        // Same column reordering
        setColumns((columns) => {
          return columns.map((column) => {
            if (column.id === activeColumn.id) {
              const newCards = arrayMove(column.cards, activeIndex, overIndex);
              return { ...column, cards: newCards };
            }
            return column;
          });
        });
      } else {
        // Moving between columns
        setColumns((columns) => {
          const newActiveCards = activeColumn.cards.filter((card) => card.id !== activeId);
          const newTargetCards = [...targetColumn.cards];
          newTargetCards.splice(overIndex, 0, activeCard);

          return columns.map((column) => {
            if (column.id === activeColumn.id) {
              return { ...column, cards: newActiveCards };
            } else if (column.id === targetColumn.id) {
              return { ...column, cards: newTargetCards };
            }
            return column;
          });
        });

        // Notify parent component of the move
        onCardMove?.(activeId, activeColumn.id, targetColumn.id, overIndex);
      }
    } else if (overColumn) {
      // Dropping on empty column
      if (activeColumn.id !== overColumn.id) {
        setColumns((columns) => {
          const newActiveCards = activeColumn.cards.filter((card) => card.id !== activeId);
          const newOverCards = [...overColumn.cards, activeCard];

          return columns.map((column) => {
            if (column.id === activeColumn.id) {
              return { ...column, cards: newActiveCards };
            } else if (column.id === overColumn.id) {
              return { ...column, cards: newOverCards };
            }
            return column;
          });
        });

        // Notify parent component of the move
        onCardMove?.(activeId, activeColumn.id, overColumn.id, overColumn.cards.length);
      }
    }

    setActiveCard(null);
  };

  const findCard = (cardId: number): CardType | undefined => {
    for (const column of columns) {
      const card = column.cards.find((card) => card.id === cardId);
      if (card) return card;
    }
    return undefined;
  };

  const findColumn = (columnId: number): ColumnType | undefined => {
    return columns.find((column) => column.id === columnId);
  };

  const findColumnByCardId = (cardId: number): ColumnType | undefined => {
    for (const column of columns) {
      if (column.cards.some((card) => card.id === cardId)) {
        return column;
      }
    }
    return undefined;
  };

  const getAllCardIds = () => {
    return columns.flatMap((column) => column.cards.map((card) => card.id));
  };

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 min-h-[60vh] ${className}`}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={getAllCardIds()} strategy={verticalListSortingStrategy}>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onCardCreate={() => onCardCreate?.(column.id)}
              onCardEdit={onCardEdit}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add Column Button */}
      <div className="min-w-[320px] w-80">
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2 hover:border-primary"
          onClick={onColumnCreate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
    </div>
  );
}