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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Plus, Filter, Search, MoreHorizontal, Settings, Users, Archive, Copy, Trash2, Star } from 'lucide-react';

interface JiraBoardProps {
  columns: JiraColumnType[];
  boardId?: number;
  onCardMove?: (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => void;
  onColumnMove?: (columnId: number, newIndex: number) => void;
  onCardCreate?: (columnId: number) => void;
  onCardEdit?: (card: IssueCardProps['issue']) => void;
  onCardClick?: (card: IssueCardProps['issue']) => void;
  onCardArchive?: (cardId: number) => void;
  onCardDuplicate?: (cardId: number) => void;
  onCardDelete?: (cardId: number) => void;
  onColumnCreate?: () => void;
  onColumnEdit?: (columnId: number) => void;
  onColumnArchive?: (columnId: number) => void;
  onColumnDelete?: (columnId: number) => void;
  onBoardShare?: () => void;
  onBoardSettings?: () => void;
  onBoardArchive?: () => void;
  onBoardDuplicate?: () => void;
}

export function JiraBoard({
  columns,
  boardId,
  onCardMove,
  onColumnMove,
  onCardCreate,
  onCardEdit,
  onCardClick,
  onCardArchive,
  onCardDuplicate,
  onCardDelete,
  onColumnCreate,
  onColumnEdit,
  onColumnArchive,
  onColumnDelete,
  onBoardShare,
  onBoardSettings,
  onBoardArchive,
  onBoardDuplicate,
}: JiraBoardProps) {
  const [activeCard, setActiveCard] = useState<IssueCardProps['issue'] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 200, // Add delay for better mobile experience
        tolerance: 5, // More tolerance for touch screens
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
    
    console.log('Drag end event:', { active: active?.id, over: over?.id });
    
    if (!over) {
      console.log('No drop target found');
      setActiveCard(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    console.log('Drag end IDs:', { activeId, overId });

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
      <div className="bg-card border-b border-border p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-lg font-semibold text-foreground">Board</h2>
            <div className="text-sm text-muted-foreground">
              {totalIssues} issues
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap"
              onClick={() => {
                try {
                  onBoardShare?.();
                } catch (error) {
                  console.error('Error sharing board:', error);
                }
              }}
              title="Share board with team members"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap"
              onClick={() => {
                try {
                  onBoardSettings?.();
                } catch (error) {
                  console.error('Error opening board settings:', error);
                }
              }}
              title="Board settings and configuration"
            >
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Configure</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => {
                try {
                  onColumnCreate?.();
                } catch (error) {
                  console.error('Error creating column:', error);
                }
              }}
              className="whitespace-nowrap"
              title="Add new column to board"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden xs:inline">Add column</span>
            </Button>
            
            {/* Board Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      onBoardDuplicate?.();
                    } catch (error) {
                      console.error('Error duplicating board:', error);
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Board
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      onBoardArchive?.();
                    } catch (error) {
                      console.error('Error archiving board:', error);
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Board
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
                      try {
                        // Note: Delete functionality would need to be implemented in backend
                        console.log('Delete board requested');
                      } catch (error) {
                        console.error('Error deleting board:', error);
                      }
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border bg-background border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Filter by assignee..."
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent flex-1 sm:w-48 text-foreground placeholder:text-muted-foreground"
            />
            
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">More filters</span>
            </Button>
          </div>
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
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent -mx-10">
          {/* Mobile scroll hint */}
          {filteredColumns.length > 1 && (
            <div className="sm:hidden px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b border-border text-center">
              ← Scroll horizontally to see all {filteredColumns.length} columns →
            </div>
          )}
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 min-w-max h-full">
            <SortableContext
              items={filteredColumns.map(col => `column-${col.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map((column) => (
                <div key={column.id} className="w-72 sm:w-80 h-full flex-shrink-0">
                  <JiraColumn
                    column={column}
                    onCardCreate={() => onCardCreate?.(column.id)}
                    onCardEdit={onCardEdit}
                    onCardClick={onCardClick}
                    onCardArchive={onCardArchive}
                    onCardDuplicate={onCardDuplicate}
                    onCardDelete={onCardDelete}
                    onColumnEdit={() => onColumnEdit?.(column.id)}
                    onColumnArchive={() => onColumnArchive?.(column.id)}
                    onColumnDelete={() => onColumnDelete?.(column.id)}
                  />
                </div>
              ))}
            </SortableContext>

            {/* Add Column Button */}
            <div className="w-72 sm:w-80 h-full flex-shrink-0">
              <div className="h-full bg-background border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center min-h-[200px]">
                <Button
                  variant="ghost"
                  onClick={onColumnCreate}
                  className="text-muted-foreground hover:text-foreground flex-col gap-2 h-auto py-4"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-sm">Add another column</span>
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