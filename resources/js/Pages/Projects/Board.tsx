import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import {
  Plus,
  MoreHorizontal,
  Settings,
  Calendar,
  X,
  Check,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import useRoute from '@/Hooks/useRoute';
import ProjectAgileTabs from '@/Components/Projects/ProjectAgileTabs';

interface User {
  id: number;
  name: string;
}

interface BoardCard {
  id: number;
  column_id: number;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  due_date?: string;
  assignee?: User;
  order: number;
}

interface BoardColumn {
  id: number;
  name: string;
  order: number;
  wip_limit?: number;
  cards: BoardCard[];
}

interface Board {
  id: number;
  project_id: number;
  name: string;
  columns: BoardColumn[];
}

interface AgileboardProps {
  auth: { user: any };
  project: { id: number; name: string };
  board: Board;
  columns?: BoardColumn[];
  cards?: BoardCard[];
  activeSprint?: { id: number; name: string };
  embedded?: boolean;
}

const priorityDot: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function AgileBoard({
  project,
  board,
  columns: initialColumns,
  activeSprint,
  embedded = false,
}: AgileboardProps) {
  const route = useRoute();
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns || board.columns || []);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editColumnName, setEditColumnName] = useState('');
  const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);

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
      movedCard.column_id = destColumn.id;
      destColumn.cards.splice(destination.index, 0, movedCard);
      newColumns[sourceColumnIndex] = sourceColumn;
      newColumns[destColumnIndex] = destColumn;
    }

    setColumns(newColumns);

    router.put(
      route('agile.cards.move', { card: movedCard.id }),
      { column_id: destColumn.id, order: destination.index },
      { preserveScroll: true }
    );
  };

  const saveColumnName = (columnId: number) => {
    if (!editColumnName.trim()) return;
    router.put(
      route('agile.columns.update', columnId),
      { name: editColumnName.trim() },
      {
        preserveScroll: true,
        onSuccess: () => {
          setEditingColumnId(null);
          setEditColumnName('');
        },
      }
    );
  };

  const addColumn = () => {
    if (!newColumnName.trim()) return;
    router.post(
      route('agile.columns.create', board.id),
      { name: newColumnName.trim(), order: columns.length },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewColumnName('');
          setIsAddingColumn(false);
        },
      }
    );
  };

  const toolbar = (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-foreground">{board.name}</h3>
        {activeSprint && (
          <Badge variant="outline" className="text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            {activeSprint.name}
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => router.visit(route('agile.board.settings', board.id))}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button size="sm" onClick={() => router.visit(route('agile.cards.create', { board: board.id }))}>
          <Plus className="mr-2 h-4 w-4" />
          Add card
        </Button>
      </div>
    </div>
  );

  const boardContent = (
    <>
      {embedded && toolbar}
      <div className={embedded ? 'h-[520px] overflow-x-auto rounded-xl border border-border bg-muted/30' : 'h-[calc(100vh-12rem)] overflow-x-auto'}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full gap-3 p-4">
            {columns.map((column) => {
              const overWip = column.wip_limit && column.cards.length > column.wip_limit;
              return (
                <div key={column.id} className="flex w-72 flex-shrink-0 flex-col">
                  <div className="mb-2 flex items-center justify-between px-1">
                    {editingColumnId === column.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          autoFocus
                          value={editColumnName}
                          onChange={(e) => setEditColumnName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveColumnName(column.id);
                            if (e.key === 'Escape') {
                              setEditingColumnId(null);
                              setEditColumnName('');
                            }
                          }}
                          className="h-8 text-sm"
                        />
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveColumnName(column.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => {
                            setEditingColumnId(null);
                            setEditColumnName('');
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-medium">{column.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {column.cards.length}
                            {column.wip_limit ? `/${column.wip_limit}` : ''}
                          </Badge>
                          {overWip && (
                            <Badge variant="destructive" className="text-xs">
                              WIP
                            </Badge>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingColumnId(column.id);
                                setEditColumnName(column.name);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.visit(route('agile.board.settings', board.id))}>
                              <Settings className="mr-2 h-4 w-4" />
                              WIP limit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setColumnToDelete(column)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>

                  <Droppable droppableId={column.id.toString()}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-1 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                      >
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => router.visit(route('agile.cards.show', card.id))}
                                className={`cursor-pointer rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
                                  snapshot.isDragging ? 'rotate-1 shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span
                                    className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${priorityDot[card.priority] || priorityDot.medium}`}
                                  />
                                  <p className="line-clamp-2 flex-1 text-sm font-medium leading-snug">{card.title}</p>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                  <span>
                                    {card.story_points != null ? `${card.story_points} pts` : ''}
                                    {card.due_date && (
                                      <span className="ml-2">{new Date(card.due_date).toLocaleDateString()}</span>
                                    )}
                                  </span>
                                  {card.assignee && (
                                    <span
                                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
                                      title={card.assignee.name}
                                    >
                                      {card.assignee.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start text-muted-foreground"
                          onClick={() =>
                            router.visit(route('agile.cards.create', { board: board.id, column: column.id }))
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add card
                        </Button>
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}

            <div className="w-72 flex-shrink-0">
              {isAddingColumn ? (
                <div className="rounded-lg border border-border bg-card p-3">
                  <Input
                    autoFocus
                    placeholder="Column name"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addColumn();
                      if (e.key === 'Escape') {
                        setNewColumnName('');
                        setIsAddingColumn(false);
                      }
                    }}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addColumn} disabled={!newColumnName.trim()}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setNewColumnName('');
                        setIsAddingColumn(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="h-12 w-full border-dashed"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add column
                </Button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      <AlertDialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete column</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &quot;{columnToDelete?.name}&quot;?
              {columnToDelete && columnToDelete.cards.length > 0 && (
                <span className="mt-2 block font-medium text-destructive">
                  Move {columnToDelete.cards.length} card(s) first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={columnToDelete ? columnToDelete.cards.length > 0 : false}
              onClick={() => {
                if (columnToDelete) {
                  router.delete(route('agile.columns.destroy', columnToDelete.id), {
                    preserveScroll: true,
                    onSuccess: () => setColumnToDelete(null),
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (embedded) {
    return <>{boardContent}</>;
  }

  return (
    <AppLayout
      title={`${board.name} - ${project.name}`}
      renderHeader={() => (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              <Link href={route('projects.show', project.id)} className="hover:text-foreground">
                {project.name}
              </Link>
            </p>
            <h2 className="text-xl font-semibold tracking-tight">{board.name}</h2>
          </div>
          <div className="flex gap-2">
            {activeSprint && (
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {activeSprint.name}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => router.visit(route('agile.board.settings', board.id))}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" onClick={() => router.visit(route('agile.cards.create', { board: board.id }))}>
              <Plus className="mr-2 h-4 w-4" />
              Add card
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`${board.name} - ${project.name}`} />
      <ProjectAgileTabs projectId={project.id} boardId={board.id} active="board" />
      {boardContent}
    </AppLayout>
  );
}
