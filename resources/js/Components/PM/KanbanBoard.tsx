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
  horizontalListSortingStrategy,
  useSortable,
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
  comments_count?: number;
  attachments_count?: number;
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
  onColumnMove?: (columnId: number, newIndex: number) => void;
  onCardCreate?: (columnId: number, data: { title: string; done: boolean; priority: string; due_date: string | null; assignee_id?: number; type?: string }, done: () => void) => void;
  onColumnCreate?: (name: string, done: () => void) => void;
  onCardEdit?: (card: CardType) => void;
  employees?: { id: number; name: string }[];
  className?: string;
}

export function KanbanBoard({
  columns: initialColumns,
  onCardMove,
  onColumnMove,
  onCardCreate,
  onCardEdit,
  onColumnCreate,
  employees = [],
  className = '',
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<number | null>(null);
  const [overColumnId, setOverColumnId] = useState<number | null>(null);
  // Jira-like add card/column state
  const [addingCardColumnId, setAddingCardColumnId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [loading, setLoading] = useState(false);
  // DnD placement indicator state
  const [overCardId, setOverCardId] = useState<number | null>(null);
  const [overCardPosition, setOverCardPosition] = useState<'above' | 'below' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Card drag
    if (typeof active.id === 'number' || !isNaN(Number(active.id))) {
      const activeCardData = findCard(Number(active.id));
      setActiveCard(activeCardData || null);
      setActiveColumnId(null);
    } else if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      // Column drag
      setActiveCard(null);
      setActiveColumnId(Number(active.id.replace('column-', '')));
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    // Card drag
    if (typeof active.id === 'number' || !isNaN(Number(active.id))) {
      const activeId = Number(active.id);
      const overId = Number(over.id);
      const activeCard = findCard(activeId);
      const overCard = findCard(overId);
      const overColumn = findColumn(overId);
      const activeColumn = findColumnByCardId(activeId);
      if (!activeCard || !activeColumn) return;
      if (overCard) {
        // Over a card: show horizontal bar above or below
        setOverCardId(overId);
        // Optionally, use pointer position to determine above/below
        setOverCardPosition('below'); // For simplicity, always below. Can be improved with pointer position.
      } else {
        setOverCardId(null);
        setOverCardPosition(null);
      }
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
      setOverColumnId(null);
    } else if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      // Column drag
      if (typeof over.id === 'string' && over.id.startsWith('column-')) {
        setOverColumnId(Number(over.id.replace('column-', '')));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveCard(null);
      setActiveColumnId(null);
      setOverColumnId(null);
      setOverCardId(null);
      setOverCardPosition(null);
      return;
    }
    // Card drag
    if (typeof active.id === 'number' || !isNaN(Number(active.id))) {
      const activeId = Number(active.id);
      const overId = Number(over.id);
      const activeCard = findCard(activeId);
      const overCard = findCard(overId);
      const overColumn = findColumn(overId);
      if (!activeCard) {
        setActiveCard(null);
        setActiveColumnId(null);
        setOverColumnId(null);
        setOverCardId(null);
        setOverCardPosition(null);
        return;
      }
      const activeColumn = findColumnByCardId(activeId);
      if (!activeColumn) {
        setActiveCard(null);
        setActiveColumnId(null);
        setOverColumnId(null);
        setOverCardId(null);
        setOverCardPosition(null);
        return;
      }
      // If dropping on a card, insert before/after that card using placement indicator
      if (overCard) {
        const targetColumn = findColumnByCardId(overId);
        if (!targetColumn) {
          setActiveCard(null);
          setActiveColumnId(null);
          setOverColumnId(null);
          setOverCardId(null);
          setOverCardPosition(null);
          return;
        }
        const activeIndex = activeColumn.cards.findIndex((card) => card.id === activeId);
        let overIndex = targetColumn.cards.findIndex((card) => card.id === overId);
        // Use overCardPosition to determine drop index
        if (overCardId === overId && overCardPosition === 'below') {
          overIndex += 1;
        }
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
      setActiveColumnId(null);
      setOverColumnId(null);
      setOverCardId(null);
      setOverCardPosition(null);
    } else if (typeof active.id === 'string' && active.id.startsWith('column-')) {
      // Column drag
      if (typeof over.id === 'string' && over.id.startsWith('column-')) {
        const activeColId = Number(active.id.replace('column-', ''));
        const overColId = Number(over.id.replace('column-', ''));
        const oldIndex = columns.findIndex(col => col.id === activeColId);
        const newIndex = columns.findIndex(col => col.id === overColId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newColumns = arrayMove(columns, oldIndex, newIndex);
          setColumns(newColumns);
          onColumnMove?.(activeColId, newIndex);
        }
      }
      setActiveCard(null);
      setActiveColumnId(null);
      setOverColumnId(null);
      setOverCardId(null);
      setOverCardPosition(null);
    }
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

  // Placement indicator for columns
  const renderColumnIndicator = (columnId: number) => {
    if (overColumnId === columnId && activeColumnId !== null) {
      return (
        <div className="flex flex-col items-center mx-1 my-2" style={{ minHeight: 120 }}>
          <span className="w-2 h-2 bg-blue-500 rounded-full mb-1" />
          <span className="flex-1 w-0.5 bg-blue-400" />
          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
        </div>
      );
    }
    return null;
  };

  // Handlers for Jira-like add card UX
  const handleAddCardClick = (colId: number) => {
    setAddingCardColumnId(colId);
    setNewCardTitle('');
    setAddingColumn(false);
    setTimeout(() => {
      const input = document.getElementById('kanban-new-card-input');
      if (input) (input as HTMLInputElement).focus();
    }, 100);
  };
  const handleAddCardChange = (v: string) => setNewCardTitle(v);
  // Accepts all card data from KanbanColumn
  const handleAddCardSubmit = (colId: number, data: { title: string; done: boolean; priority: string; due_date: string | null; assignee_id?: number; type?: string }) => {
    if (!data.title.trim() || loading) return;
    setLoading(true);
    // Ensure type and priority are always present
    const payload = {
      ...data,
      priority: data.priority || 'medium',
      type: data.type || 'task',
    };
    onCardCreate?.(colId, payload, () => {
      setLoading(false);
      setAddingCardColumnId(null);
      setNewCardTitle('');
    });
  };
  const handleAddCardCancel = () => {
    setAddingCardColumnId(null);
    setNewCardTitle('');
  };
  // Handlers for Jira-like add column UX
  const handleAddColumnClick = () => {
    setAddingColumn(true);
    setAddingCardColumnId(null);
    setNewColumnName('');
    setTimeout(() => {
      const input = document.getElementById('kanban-new-column-input');
      if (input) (input as HTMLInputElement).focus();
    }, 100);
  };
  const handleAddColumnChange = (v: string) => setNewColumnName(v);
  const handleAddColumnSubmit = () => {
    if (!newColumnName.trim() || loading) return;
    setLoading(true);
    onColumnCreate?.(newColumnName, () => {
      setLoading(false);
      setAddingColumn(false);
      setNewColumnName('');
    });
  };
  const handleAddColumnCancel = () => {
    setAddingColumn(false);
    setNewColumnName('');
  };

  return (
    <div
      className={`flex gap-4 pb-4 min-h-[60vh] w-full ${className}`}
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext
          items={columns.map(col => `column-${col.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <React.Fragment key={column.id}>
              <SortableColumn id={`column-${column.id}`}>
                <KanbanColumn
                  column={column}
                  onCardEdit={onCardEdit}
                  addingCard={addingCardColumnId === column.id}
                  newCardTitle={addingCardColumnId === column.id ? newCardTitle : ''}
                  loading={loading}
                  onAddCardClick={() => handleAddCardClick(column.id)}
                  onAddCardChange={handleAddCardChange}
                  onAddCardSubmit={data => handleAddCardSubmit(column.id, data)}
                  onAddCardCancel={handleAddCardCancel}
                  overCardId={overCardId}
                  overCardPosition={overCardPosition}
                  employees={employees}
                />
              </SortableColumn>
              {renderColumnIndicator(column.id)}
              {/* Card placement indicator (horizontal/vertical) */}
              {/* You can enhance this further for more advanced placement cues */}
            </React.Fragment>
          ))}
        </SortableContext>
        <DragOverlay>
          {activeCard ? <KanbanCard card={activeCard} isDragging /> : null}
        </DragOverlay>
      </DndContext>
      {/* Jira-like Add Column UX at end */}
      <div className="min-w-[320px] w-80 flex flex-col justify-start mt-2">
        {addingColumn ? (
          <div>
            <input
              id="kanban-new-column-input"
              className="flex-1 rounded border px-2 py-2 text-sm w-full"
              placeholder="Enter column name..."
              value={newColumnName}
              disabled={loading}
              autoFocus
              onChange={e => handleAddColumnChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddColumnSubmit();
                if (e.key === 'Escape') handleAddColumnCancel();
              }}
              onBlur={handleAddColumnCancel}
            />
            <div className="flex justify-end gap-2 mt-1">
              <Button size="icon" variant="default" disabled={loading || !newColumnName.trim()} onClick={handleAddColumnSubmit} aria-label="Add">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </Button>
              <Button size="icon" variant="ghost" onClick={handleAddColumnCancel} aria-label="Cancel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-2 hover:border-primary"
            onClick={handleAddColumnClick}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Column
          </Button>
        )}
      </div>
    </div>
  );

  // Sortable wrapper for columns
  function SortableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          transition,
          opacity: isDragging ? 0.5 : 1,
        }}
        className={isDragging ? 'z-50' : ''}
      >
        {children}
      </div>
    );
  }
}