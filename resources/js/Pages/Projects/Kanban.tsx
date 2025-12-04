import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  Plus,
  ChevronLeft,
  Edit,
  Trash2,
  GripVertical,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  Layers
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project, ProjectMilestone } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ProjectKanbanProps {
  auth: {
    user: any;
  };
  project: Project;
  milestones: ProjectMilestone[];
}

type KanbanColumn = {
  id: string;
  title: string;
  status: string;
  color: string;
};

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: 'Backlog', status: 'pending', color: 'bg-gray-100' },
  { id: 'todo', title: 'To Do', status: 'todo', color: 'bg-blue-100' },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', color: 'bg-yellow-100' },
  { id: 'review', title: 'Review', status: 'review', color: 'bg-purple-100' },
  { id: 'completed', title: 'Completed', status: 'completed', color: 'bg-green-100' },
];

export default function ProjectKanban({ auth, project, milestones }: ProjectKanbanProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  
  const [columns, setColumns] = useState<Record<string, ProjectMilestone[]>>(() => {
    const initialColumns: Record<string, ProjectMilestone[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      initialColumns[col.id] = milestones.filter(m => m.status === col.status) || [];
    });
    return initialColumns;
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const movedMilestone = sourceColumn[source.index];

    // Same column reorder
    if (source.droppableId === destination.droppableId) {
      const newColumn = Array.from(sourceColumn);
      newColumn.splice(source.index, 1);
      newColumn.splice(destination.index, 0, movedMilestone);

      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });
    } else {
      // Different column move
      const newSourceColumn = Array.from(sourceColumn);
      const newDestColumn = Array.from(destColumn);

      newSourceColumn.splice(source.index, 1);
      newDestColumn.splice(destination.index, 0, movedMilestone);

      setColumns({
        ...columns,
        [source.droppableId]: newSourceColumn,
        [destination.droppableId]: newDestColumn,
      });

      // Update status on backend
      const newStatus = KANBAN_COLUMNS.find(col => col.id === destination.droppableId)?.status;
      if (newStatus) {
        router.patch(
          route('projects.milestones.update-status', [project.id, movedMilestone.id]),
          { status: newStatus },
          { preserveScroll: true }
        );
      }
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AppLayout
      title={`${project.name} - Kanban Board`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('projects.show', project.id)}>
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </Link>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {project.name} - Kanban Board
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop milestones to update their status
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasPermission('projects.milestones.create') && (
              <Link href={route('projects.milestones.create', project.id)}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Milestone
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`${project.name} - Kanban`} />

      <div className="space-y-6">
        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Layers className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
              </div>
              <Badge className={getPriorityBadgeColor(project.priority || 'medium')}>
                {project.priority?.toUpperCase() || 'MEDIUM'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(project.deadline)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{milestones.length} Milestones</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {KANBAN_COLUMNS.map((column) => (
                <div key={column.id} className="flex flex-col">
                  <div className={`${column.color} p-3 rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-800">
                        {column.title}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {columns[column.id]?.length || 0}
                      </Badge>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 bg-white dark:bg-gray-800 border-2 ${
                          snapshot.isDraggingOver
                            ? 'border-blue-400 border-dashed'
                            : 'border-gray-200 dark:border-gray-700'
                        } rounded-b-lg p-2 min-h-[500px]`}
                      >
                        <div className="space-y-2">
                          {columns[column.id]?.map((milestone, index) => (
                            <Draggable
                              key={milestone.id}
                              draggableId={milestone.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm ${
                                    snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mt-1 cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Link
                                        href={route('projects.milestones.show', [
                                          project.id,
                                          milestone.id,
                                        ])}
                                        className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 block truncate"
                                      >
                                        {milestone.name}
                                      </Link>
                                      {milestone.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                          {milestone.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-2 mt-2">
                                        {milestone.priority && (
                                          <Badge
                                            variant="outline"
                                            className={getPriorityBadgeColor(milestone.priority)}
                                          >
                                            {milestone.priority}
                                          </Badge>
                                        )}
                                        {milestone.due_date && (
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(milestone.due_date)}
                                          </div>
                                        )}
                                      </div>

                                      {milestone.progress !== undefined && (
                                        <div className="mt-2">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-gray-600">Progress</span>
                                            <span className="text-xs font-medium">
                                              {milestone.progress}%
                                            </span>
                                          </div>
                                          <Progress value={milestone.progress} className="h-1" />
                                        </div>
                                      )}

                                      <div className="flex items-center gap-2 mt-2">
                                        <Link
                                          href={route('projects.milestones.edit', [
                                            project.id,
                                            milestone.id,
                                          ])}
                                        >
                                          <Button variant="ghost" size="sm">
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>

                        {columns[column.id]?.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <p className="text-sm">No milestones</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map((column) => {
            const count = columns[column.id]?.length || 0;
            const percentage = milestones.length > 0
              ? Math.round((count / milestones.length) * 100)
              : 0;

            return (
              <Card key={column.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-gray-500">{percentage}% of total</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Help Text */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">How to use the Kanban Board:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Drag and drop milestones between columns to update their status</li>
                  <li>Click on a milestone card to view details</li>
                  <li>Use the edit button to modify milestone information</li>
                  <li>Create new milestones using the "New Milestone" button</li>
                  <li>Progress is automatically calculated based on milestone status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
