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
  DropResult
} from '@hello-pangea/dnd';
import { 
  Plus, 
  MoreHorizontal, 
  Settings,
  Users,
  Flag,
  MessageSquare,
  Paperclip,
  Calendar,
  Target,
  Activity,
  X,
  Check,
  Pencil,
  Trash2
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

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface BoardCard {
  id: number;
  board_id: number;
  column_id: number;
  sprint_id?: number;
  epic_id?: number;
  task_id?: number;
  type: 'story' | 'task' | 'bug' | 'epic';
  title: string;
  description?: string;
  assignee_id?: number;
  assignee?: User;
  reporter_id?: number;
  reporter?: User;
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  due_date?: string;
  status: string;
  labels?: string[];
  order: number;
}

interface BoardColumn {
  id: number;
  board_id: number;
  name: string;
  order: number;
  wip_limit?: number;
  cards: BoardCard[];
}

interface Board {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
}

interface Sprint {
  id: number;
  name: string;
  status: 'planning' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
}

interface Epic {
  id: number;
  name: string;
  color: string;
}

interface AgileboardProps {
  auth: {
    user: any;
  };
  project: {
    id: number;
    name: string;
    methodology?: 'waterfall' | 'agile' | 'hybrid';
  };
  board: Board;
  columns?: BoardColumn[];
  cards?: BoardCard[];
  sprints?: Sprint[];
  epics?: Epic[];
  activeSprint?: Sprint;
  embedded?: boolean;
}

export default function AgileBoard({ 
  auth, 
  project, 
  board, 
  columns: initialColumns,
  cards: initialCards = [],
  sprints = [], 
  epics = [], 
  activeSprint,
  embedded = false 
}: AgileboardProps) {
  const route = useRoute();
  const [columns, setColumns] = useState<BoardColumn[]>(
    initialColumns || board.columns || []
  );
  const [selectedSprint, setSelectedSprint] = useState<number | null>(activeSprint?.id || null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editColumnName, setEditColumnName] = useState('');
  const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <Target className="h-3 w-3" />;
      case 'bug': return <Flag className="h-3 w-3" />;
      case 'epic': return <Activity className="h-3 w-3" />;
      default: return <MessageSquare className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'story': return 'text-blue-600';
      case 'bug': return 'text-red-600';
      case 'epic': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceColumnIndex = columns.findIndex(col => col.id.toString() === source.droppableId);
    const destColumnIndex = columns.findIndex(col => col.id.toString() === destination.droppableId);

    if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

    const newColumns = [...columns];
    const sourceColumn = { ...newColumns[sourceColumnIndex] };
    const destColumn = { ...newColumns[destColumnIndex] };

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

    // Update backend
    router.put(route('agile.cards.move', { card: movedCard.id }), {
      column_id: destColumn.id,
      order: destination.index,
    }, {
      preserveScroll: true,
    });
  };

  const boardContent = (
    <>
      <div className={embedded ? "h-[600px] overflow-x-auto" : "h-[calc(100vh-12rem)] overflow-x-auto"}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full p-6">
            {columns.map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {editingColumnId === column.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                autoFocus
                                value={editColumnName}
                                onChange={(e) => setEditColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && editColumnName.trim()) {
                                    router.put(route('agile.columns.update', column.id), {
                                      name: editColumnName.trim()
                                    }, {
                                      preserveScroll: true,
                                      onSuccess: () => {
                                        setEditingColumnId(null);
                                        setEditColumnName('');
                                      }
                                    });
                                  } else if (e.key === 'Escape') {
                                    setEditingColumnId(null);
                                    setEditColumnName('');
                                  }
                                }}
                                className="h-7 text-sm"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  if (editColumnName.trim()) {
                                    router.put(route('agile.columns.update', column.id), {
                                      name: editColumnName.trim()
                                    }, {
                                      preserveScroll: true,
                                      onSuccess: () => {
                                        setEditingColumnId(null);
                                        setEditColumnName('');
                                      }
                                    });
                                  }
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
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
                              <CardTitle className="text-sm font-medium truncate">
                                {column.name}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {column.cards.length}
                              </Badge>
                              {column.wip_limit && column.cards.length > column.wip_limit && (
                                <Badge variant="destructive" className="text-xs">
                                  WIP Exceeded
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                        {editingColumnId !== column.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
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
                                Rename Column
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  router.visit(route('agile.board.settings', board.id));
                                }}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Set WIP Limit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setColumnToDelete(column)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Column
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {column.wip_limit && editingColumnId !== column.id && (
                        <p className="text-xs text-gray-500 mt-1">
                          WIP Limit: {column.wip_limit}
                        </p>
                      )}
                    </CardHeader>
                  
                  <Droppable droppableId={column.id.toString()}>
                    {(provided, snapshot) => (
                      <CardContent
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 space-y-2 overflow-y-auto ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
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
                                onClick={() => router.visit(route('agile.cards.show', card.id))}
                              >
                                <CardContent className="p-3 space-y-2">
                                  {/* Card Type & Priority */}
                                  <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-1 ${getTypeColor(card.type)}`}>
                                      {getTypeIcon(card.type)}
                                      <span className="text-xs font-medium uppercase">
                                        {card.type}
                                      </span>
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getPriorityColor(card.priority)}`}
                                    >
                                      {card.priority}
                                    </Badge>
                                  </div>

                                  {/* Card Title */}
                                  <h4 className="text-sm font-medium leading-tight line-clamp-2">
                                    {card.title}
                                  </h4>

                                  {/* Labels */}
                                  {card.labels && card.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {card.labels.slice(0, 3).map((label, idx) => (
                                        <Badge 
                                          key={idx} 
                                          variant="secondary" 
                                          className="text-xs px-2 py-0"
                                        >
                                          {label}
                                        </Badge>
                                      ))}
                                      {card.labels.length > 3 && (
                                        <Badge variant="secondary" className="text-xs px-2 py-0">
                                          +{card.labels.length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  )}

                                  {/* Card Footer */}
                                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t">
                                    <div className="flex items-center gap-2">
                                      {card.story_points && (
                                        <div className="flex items-center gap-1">
                                          <Target className="h-3 w-3" />
                                          <span>{card.story_points}</span>
                                        </div>
                                      )}
                                      {card.due_date && (
                                        <div className="flex items-center gap-1 text-orange-600">
                                          <Calendar className="h-3 w-3" />
                                          <span>{new Date(card.due_date).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                    {card.assignee && (
                                      <div className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                          {card.assignee.name.charAt(0).toUpperCase()}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Hybrid Mode Indicator */}
                                  {project.methodology === 'hybrid' && card.task_id && (
                                    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                      <Activity className="h-3 w-3" />
                                      <span>Linked to Task</span>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Add Card Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm text-gray-500 hover:text-gray-700"
                          onClick={() => router.visit(route('agile.cards.create', { 
                            board: board.id,
                            column: column.id 
                          }))}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add card
                        </Button>
                      </CardContent>
                    )}
                  </Droppable>
                </Card>
              </div>
            ))}

            {/* Add Column Button/Input */}
            <div className="flex-shrink-0 w-80">
              {isAddingColumn ? (
                <Card className="h-32 flex items-center justify-center">
                  <CardContent className="p-4 w-full">
                    <div className="flex gap-2">
                      <Input
                        autoFocus
                        placeholder="Column name..."
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newColumnName.trim()) {
                            router.post(route('agile.columns.create', board.id), {
                              name: newColumnName.trim(),
                              order: columns.length
                            }, {
                              preserveScroll: true,
                              onSuccess: () => {
                                setNewColumnName('');
                                setIsAddingColumn(false);
                              }
                            });
                          } else if (e.key === 'Escape') {
                            setNewColumnName('');
                            setIsAddingColumn(false);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (newColumnName.trim()) {
                            router.post(route('agile.columns.create', board.id), {
                              name: newColumnName.trim(),
                              order: columns.length
                            }, {
                              preserveScroll: true,
                              onSuccess: () => {
                                setNewColumnName('');
                                setIsAddingColumn(false);
                              }
                            });
                          }
                        }}
                        disabled={!newColumnName.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewColumnName('');
                          setIsAddingColumn(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed hover:border-solid hover:bg-accent"
                  onClick={() => setIsAddingColumn(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Delete Column Confirmation Dialog */}
      <AlertDialog open={!!columnToDelete} onOpenChange={(open) => !open && setColumnToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{columnToDelete?.name}"? 
              {columnToDelete && columnToDelete.cards.length > 0 && (
                <span className="block mt-2 text-red-600 font-semibold">
                  This column contains {columnToDelete.cards.length} card(s). They will need to be moved first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (columnToDelete) {
                  router.delete(route('agile.columns.destroy', columnToDelete.id), {
                    preserveScroll: true,
                    onSuccess: () => setColumnToDelete(null)
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={columnToDelete ? columnToDelete.cards.length > 0 : false}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (embedded) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{board.name}</h3>
            {activeSprint && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Calendar className="h-3 w-3 mr-1" />
                {activeSprint.name}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.visit(route('agile.board.settings', board.id))}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" onClick={() => router.visit(route('agile.cards.create', { board: board.id }))}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>
        {boardContent}
      </>
    );
  }

  return (
    <AppLayout
      title={`${board.name} - ${project.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {board.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            {activeSprint && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Calendar className="h-3 w-3 mr-1" />
                {activeSprint.name}
              </Badge>
            )}
            <Button variant="outline" onClick={() => router.visit(route('agile.board.settings', board.id))}>
              <Settings className="h-4 w-4 mr-2" />
              Board Settings
            </Button>
            <Button onClick={() => router.visit(route('agile.cards.create', { board: board.id }))}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`${board.name} - ${project.name}`} />
      {boardContent}
    </AppLayout>
  );
}
