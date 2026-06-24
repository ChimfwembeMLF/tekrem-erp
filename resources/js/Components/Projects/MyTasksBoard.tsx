import React, { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Badge } from '@/Components/ui/badge';
import { FolderOpen } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { cn } from '@/lib/utils';

interface BoardCardItem {
  id: number;
  title: string;
  priority?: string;
  story_points?: number;
  due_date?: string;
  column_id?: number;
  project_id?: number;
  status?: string;
  project?: { id: number; name: string };
  epic?: { name: string; color?: string };
}

interface BoardColumnItem {
  id: number | string;
  name: string;
  order?: number;
  wip_limit?: number | null;
  cards: BoardCardItem[];
}

interface Props {
  mode: 'cards' | 'tasks';
  columns: BoardColumnItem[];
  boardId?: number;
}

const priorityDot: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function MyTasksBoard({ mode, columns: initialColumns, boardId }: Props) {
  const route = useRoute();
  const [columns, setColumns] = useState(initialColumns);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumnIndex = columns.findIndex((col) => col.id.toString() === source.droppableId);
    const destColumnIndex = columns.findIndex((col) => col.id.toString() === destination.droppableId);
    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const newColumns = [...columns];
    const sourceColumn = { ...newColumns[sourceColumnIndex], cards: [...newColumns[sourceColumnIndex].cards] };
    const destColumn =
      sourceColumnIndex === destColumnIndex
        ? sourceColumn
        : { ...newColumns[destColumnIndex], cards: [...newColumns[destColumnIndex].cards] };

    const [movedCard] = sourceColumn.cards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.cards.splice(destination.index, 0, movedCard);
      newColumns[sourceColumnIndex] = sourceColumn;
    } else {
      destColumn.cards.splice(destination.index, 0, movedCard);
      newColumns[sourceColumnIndex] = sourceColumn;
      newColumns[destColumnIndex] = destColumn;
    }

    setColumns(newColumns);

    if (mode === 'cards') {
      router.put(
        route('agile.cards.move', { card: movedCard.id }),
        { column_id: Number(destColumn.id), order: destination.index },
        { preserveScroll: true },
      );
      return;
    }

    const projectId = movedCard.project_id ?? movedCard.project?.id;
    if (projectId) {
      router.patch(
        route('projects.tasks.update-status', [projectId, movedCard.id]),
        { status: destColumn.id },
        { preserveScroll: true },
      );
    }
  };

  if (columns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
        No columns to display.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/30"
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-medium">{column.name}</span>
              <Badge variant="secondary" className="text-xs">
                {column.cards.length}
                {column.wip_limit ? `/${column.wip_limit}` : ''}
              </Badge>
            </div>

            <Droppable droppableId={column.id.toString()}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'flex min-h-[200px] flex-1 flex-col gap-2 p-2 transition-colors',
                    snapshot.isDraggingOver && 'bg-primary/5',
                  )}
                >
                  {column.cards.map((card, index) => {
                    const cardHref =
                      mode === 'cards'
                        ? route('agile.cards.show', card.id)
                        : route('projects.tasks.show', [card.project_id ?? card.project?.id, card.id]);

                    return (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={cn(
                              'rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md',
                              dragSnapshot.isDragging && 'rotate-1 shadow-lg',
                            )}
                          >
                            <Link href={cardHref} className="block">
                              <div className="flex items-start gap-2">
                                <span
                                  className={cn(
                                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                                    priorityDot[card.priority || 'medium'] || priorityDot.medium,
                                  )}
                                />
                                <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">
                                  {card.title}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {mode === 'tasks' && card.project && (
                                  <span className="inline-flex items-center gap-1">
                                    <FolderOpen className="h-3 w-3" />
                                    {card.project.name}
                                  </span>
                                )}
                                {card.epic?.name && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {card.epic.name}
                                  </Badge>
                                )}
                                {card.story_points != null && <span>{card.story_points} pts</span>}
                                {card.due_date && (
                                  <span>{new Date(card.due_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
