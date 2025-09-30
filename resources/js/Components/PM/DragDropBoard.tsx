import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { router } from '@inertiajs/react';

interface BoardCard {
  id: number;
  title: string;
  description?: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: {
    id: number;
    name: string;
    email: string;
  };
  labels: string[];
  story_points?: number;
}

interface BoardColumn {
  id: number;
  name: string;
  order: number;
  cards: BoardCard[];
}

interface DragDropBoardProps {
  columns: BoardColumn[];
  boardId: number;
  projectId: number;
  onCardMove?: (cardId: number, fromColumnId: number, toColumnId: number, newOrder: number) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const typeColors = {
  task: 'bg-blue-100 text-blue-800',
  bug: 'bg-red-100 text-red-800',
  story: 'bg-green-100 text-green-800',
  epic: 'bg-purple-100 text-purple-800',
};

export default function DragDropBoard({ columns, boardId, projectId, onCardMove }: DragDropBoardProps) {
  const [boardColumns, setBoardColumns] = useState(columns);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId);
    const destColumnId = parseInt(destination.droppableId);
    const cardId = parseInt(draggableId);

    // Find source and destination columns
    const sourceColumn = boardColumns.find(col => col.id === sourceColumnId);
    const destColumn = boardColumns.find(col => col.id === destColumnId);

    if (!sourceColumn || !destColumn) {
      return;
    }

    // Moving within the same column
    if (sourceColumnId === destColumnId) {
      const newCards = Array.from(sourceColumn.cards);
      const [movedCard] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, movedCard);

      const newColumns = boardColumns.map(col =>
        col.id === sourceColumnId
          ? { ...col, cards: newCards }
          : col
      );

      setBoardColumns(newColumns);
    } else {
      // Moving between different columns
      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);
      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      const newColumns = boardColumns.map(col => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: sourceCards };
        } else if (col.id === destColumnId) {
          return { ...col, cards: destCards };
        }
        return col;
      });

      setBoardColumns(newColumns);
    }

    // Call the callback if provided
    onCardMove?.(cardId, sourceColumnId, destColumnId, destination.index);

    // Send the update to the backend
    router.post(`/pm/boards/${boardId}/cards/${cardId}/move`, {
      column_id: destColumnId,
      order: destination.index,
    }, {
      preserveState: true,
      preserveScroll: true,
      onError: () => {
        // Revert the optimistic update on error
        setBoardColumns(columns);
      }
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {boardColumns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg p-4">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {column.name}
                  <span className="ml-2 text-sm text-gray-500">
                    ({column.cards.length})
                  </span>
                </h3>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={column.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    } rounded-lg p-2 transition-colors`}
                  >
                    {column.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {card.title}
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {/* Card Type and Priority */}
                                <div className="flex items-center gap-2">
                                  <Badge className={typeColors[card.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
                                    {card.type}
                                  </Badge>
                                  <Badge className={priorityColors[card.priority]}>
                                    {card.priority}
                                  </Badge>
                                  {card.story_points && (
                                    <Badge variant="outline">
                                      {card.story_points} pts
                                    </Badge>
                                  )}
                                </div>

                                {/* Labels */}
                                {card.labels.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {card.labels.slice(0, 3).map((label, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {label}
                                      </Badge>
                                    ))}
                                    {card.labels.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{card.labels.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Assignee */}
                                {card.assignee && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {getInitials(card.assignee.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-gray-600">
                                      {card.assignee.name}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add Card Button */}
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        router.visit(`/pm/projects/${projectId}/boards/${boardId}/cards/create?column_id=${column.id}`);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add a card
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}

        {/* Add Column Button */}
        <div className="flex-shrink-0 w-80">
          <Button
            variant="ghost"
            className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-700"
            onClick={() => {
              router.visit(`/pm/projects/${projectId}/boards/${boardId}/columns/create`);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another list
          </Button>
        </div>
      </div>
    </DragDropContext>
  );
}

// To use this component, you'll need to install the drag and drop library:
// npm install @hello-pangea/dnd

// Then in your Board Show component, replace the static board with:
/*
<DragDropBoard
  columns={board.columns}
  boardId={board.id}
  projectId={project.id}
  onCardMove={(cardId, fromColumnId, toColumnId, newOrder) => {
    // Optional: Handle real-time updates
    console.log(`Card ${cardId} moved from ${fromColumnId} to ${toColumnId} at position ${newOrder}`);
  }}
/>
*/
