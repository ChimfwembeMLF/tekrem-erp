import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IssueCard, type IssueCardProps } from './IssueCard';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Settings, Archive, Trash2, Copy } from 'lucide-react';

export interface JiraColumnType {
  id: number;
  name: string;
  color?: string;
  cards: IssueCardProps['issue'][];
  is_done_column?: boolean;
  wip_limit?: number;
}

interface JiraColumnProps {
  column: JiraColumnType;
  onCardCreate?: () => void;
  onCardEdit?: (card: IssueCardProps['issue']) => void;
  onCardClick?: (card: IssueCardProps['issue']) => void;
  onCardArchive?: (cardId: number) => void;
  onCardDuplicate?: (cardId: number) => void;
  onCardDelete?: (cardId: number) => void;
  onColumnEdit?: () => void;
  onColumnArchive?: () => void;
  onColumnDelete?: () => void;
}

export function JiraColumn({ 
  column, 
  onCardCreate, 
  onCardEdit, 
  onCardClick,
  onCardArchive,
  onCardDuplicate,
  onCardDelete,
  onColumnEdit,
  onColumnArchive,
  onColumnDelete
}: JiraColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `column-${column.id}`,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column-${column.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const wipLimitExceeded = column.wip_limit && column.cards.length > column.wip_limit;

  // Combine refs
  const combinedRef = (node: HTMLElement | null) => {
    setNodeRef(node);
    setSortableNodeRef(node);
  };

  return (
    <div 
      ref={combinedRef}
      style={style}
      className="flex flex-col h-full bg-muted/50 rounded-lg"
    >
      {/* Column Header */}
      <div 
        className="p-3 border-b border-border bg-card rounded-t-lg cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color || 'hsl(var(--muted-foreground))' }}
            />
            <h3 className="font-medium text-foreground text-sm uppercase tracking-wide">
              {column.name}
            </h3>
            <span className={`
              text-xs px-2 py-1 rounded-full font-medium
              ${wipLimitExceeded 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {column.cards.length}
              {column.wip_limit && ` / ${column.wip_limit}`}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                try {
                  onCardCreate?.();
                } catch (error) {
                  console.error('Error creating card:', error);
                }
              }}
              title="Create new issue"
              aria-label="Create new issue in this column"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Column Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  title="Column options"
                  aria-label="Edit column settings"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      onColumnEdit?.();
                    } catch (error) {
                      console.error('Error editing column:', error);
                    }
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    try {
                      onColumnArchive?.();
                    } catch (error) {
                      console.error('Error archiving column:', error);
                    }
                  }}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Column
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete the "${column.name}" column? This will also delete all cards in this column.`)) {
                      try {
                        onColumnDelete?.();
                      } catch (error) {
                        console.error('Error deleting column:', error);
                      }
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* WIP Limit Warning */}
        {wipLimitExceeded && (
          <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
            WIP limit exceeded!
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 space-y-3 overflow-y-auto min-h-32"
      >
        {column.cards.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              No issues
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                try {
                  onCardCreate?.();
                } catch (error) {
                  console.error('Error creating card:', error);
                }
              }}
              className="mt-2 text-xs hover:bg-accent transition-colors"
              title="Create your first issue in this column"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create issue
            </Button>
          </div>
        ) : (
          <SortableContext
            items={column.cards.map(card => `card-${card.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <IssueCard
                key={card.id}
                issue={card}
                onClick={() => onCardClick?.(card)}
                onEdit={() => onCardEdit?.(card)}
                onArchive={() => onCardArchive?.(card.id)}
                onDuplicate={() => onCardDuplicate?.(card.id)}
                onDelete={() => onCardDelete?.(card.id)}
                className="group"
              />
            ))}
          </SortableContext>
        )}
      </div>

      {/* Column Footer */}
      <div className="p-2 bg-white dark:bg-background rounded-b-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            try {
              onCardCreate?.();
            } catch (error) {
              console.error('Error creating card:', error);
            }
          }}
          className="w-full text-left justify-start text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Create new issue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create issue
        </Button>
      </div>
    </div>
  );
}