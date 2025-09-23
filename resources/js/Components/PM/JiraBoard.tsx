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
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { JiraColumn, type JiraColumnType } from './JiraColumn';
import { IssueCard, type IssueCardProps } from './IssueCard';
import { Button } from '@/Components/ui/button';
import { Plus, Filter, Search, MoreHorizontal, Settings, Users } from 'lucide-react';

interface JiraBoardProps {
  columns: JiraColumnType[];
  onCardMove?: (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => void;
  onColumnMove?: (columnId: number, newIndex: number) => void;
  onCardCreate?: (columnId: number) => void;
  onCardEdit?: (card: IssueCardProps['issue']) => void;
  onCardClick?: (card: IssueCardProps['issue']) => void;
  onColumnCreate?: () => void;
  onColumnEdit?: (columnId: number) => void;
}

export function JiraBoard({
  columns,
  onCardMove,
  onColumnMove,
  onCardCreate,
  onCardEdit,
  onCardClick,
  onColumnCreate,
  onColumnEdit,
}: JiraBoardProps) {
  const [activeCard, setActiveCard] = useState<IssueCardProps['issue'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = Number(active.id.toString().replace('card-', ''));
    
    // Find the card being dragged
    const card = columns
      .flatMap(col => col.cards)
      .find(card => card.id === cardId);
    
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Only handle card-to-column/card movements here
    if (activeId.startsWith('card-') && (overId.startsWith('column-') || overId.startsWith('card-'))) {
      const cardId = Number(activeId.replace('card-', ''));
      
      // Find the source column
      const sourceColumn = columns.find(col => 
        col.cards.some(card => card.id === cardId)
      );
      
      let targetColumn;
      
      if (overId.startsWith('column-')) {
        const targetColumnId = Number(overId.replace('column-', ''));
        targetColumn = columns.find(col => col.id === targetColumnId);
      } else if (overId.startsWith('card-')) {
        const targetCardId = Number(overId.replace('card-', ''));
        targetColumn = columns.find(col => 
          col.cards.some(card => card.id === targetCardId)
        );
      }

      // Only trigger onCardMove if moving between different columns during drag
      if (sourceColumn && targetColumn && sourceColumn.id !== targetColumn.id) {
        // This will show immediate visual feedback
        // The actual move will be handled in handleDragEnd
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = Number(activeId.replace('column-', ''));
      const overColumnId = Number(overId.replace('column-', ''));
      
      if (activeColumnId !== overColumnId) {
        const oldIndex = columns.findIndex(col => col.id === activeColumnId);
        const newIndex = columns.findIndex(col => col.id === overColumnId);
        
        if (oldIndex !== -1 && newIndex !== -1 && onColumnMove) {
          onColumnMove(activeColumnId, newIndex);
        }
      }
      setActiveCard(null);
      return;
    }

    // Handle card movement
    if (activeId.startsWith('card-')) {
      const cardId = Number(activeId.replace('card-', ''));
      let toColumnId: number;
      let newIndex: number = 0;

      if (overId.startsWith('column-')) {
        // Dropped on column
        toColumnId = Number(overId.replace('column-', ''));
        const targetColumn = columns.find(col => col.id === toColumnId);
        newIndex = targetColumn ? targetColumn.cards.length : 0;
      } else if (overId.startsWith('card-')) {
        // Dropped on another card
        const targetCardId = Number(overId.replace('card-', ''));
        const targetColumn = columns.find(col => 
          col.cards.some(card => card.id === targetCardId)
        );
        
        if (targetColumn) {
          toColumnId = targetColumn.id;
          newIndex = targetColumn.cards.findIndex(card => card.id === targetCardId);
        } else {
          setActiveCard(null);
          return;
        }
      } else {
        setActiveCard(null);
        return;
      }

      // Find source column
      const fromColumn = columns.find(col => 
        col.cards.some(card => card.id === cardId)
      );

      if (fromColumn && onCardMove) {
        onCardMove(cardId, fromColumn.id, toColumnId, newIndex);
      }
    }

    setActiveCard(null);
  };

  // Filter and search logic
  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards.filter(card => {
      const matchesSearch = !searchQuery || 
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.key.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesAssignee = !filterAssignee || 
        card.assignee?.name.toLowerCase().includes(filterAssignee.toLowerCase());

      return matchesSearch && matchesAssignee;
    })
  }));

  const totalIssues = columns.reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Board Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Board</h2>
            <div className="text-sm text-muted-foreground">
              {totalIssues} issues
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button size="sm" onClick={onColumnCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add column
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border bg-background border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <input
            type="text"
            placeholder="Filter by assignee..."
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-48 text-foreground placeholder:text-muted-foreground"
          />
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More filters
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto bg-muted/30">
          <div className="flex gap-4 p-4 min-w-max h-full">
            <SortableContext
              items={filteredColumns.map(col => `column-${col.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map((column) => (
                <div key={column.id} className="w-80 h-full">
                  <JiraColumn
                    column={column}
                    onCardCreate={() => onCardCreate?.(column.id)}
                    onCardEdit={onCardEdit}
                    onCardClick={onCardClick}
                    onColumnEdit={() => onColumnEdit?.(column.id)}
                  />
                </div>
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <div className="w-80 h-full">
              <div className="h-full bg-background border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <Button
                  variant="ghost"
                  onClick={onColumnCreate}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another column
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <IssueCard
              issue={activeCard}
              className="rotate-6 shadow-lg"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}