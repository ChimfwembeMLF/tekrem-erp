import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Layers,
  Target,
  ListTodo,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Project, Backlog, Sprint, Epic } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
  project: Project;
  productBacklog: Backlog[];
  sprintBacklogs: Backlog[];
  sprints: Sprint[];
  epics: Epic[];
}

export default function Index({ project, productBacklog, sprintBacklogs, sprints, epics }: Props) {
  const [activeTab, setActiveTab] = useState('product');
  const route = useRoute();
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', icon: null },
      medium: { color: 'bg-blue-100 text-blue-800', icon: null },
      high: { color: 'bg-orange-100 text-orange-800', icon: <ArrowUp className="h-3 w-3" /> },
      critical: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-3 w-3" /> },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={statusColors[status || 'todo'] || 'bg-gray-100 text-gray-800'}>
        {status?.replace('_', ' ') || 'To Do'}
      </Badge>
    );
  };

  const handleMoveToSprint = (backlogId: number, sprintId: string) => {
    router.put(
      route('agile.backlog.move', backlogId),
      {
        type: 'sprint',
        sprint_id: sprintId,
        order: sprintBacklogs.length,
      },
      { preserveState: true }
    );
  };

  const handleMoveToProduct = (backlogId: number) => {
    router.put(
      route('agile.backlog.move', backlogId),
      {
        type: 'product',
        sprint_id: null,
        order: productBacklog.length,
      },
      { preserveState: true }
    );
  };

  const handleDelete = (backlogId: number) => {
    if (confirm('Are you sure you want to remove this item from the backlog?')) {
      router.delete(route('agile.backlog.destroy', backlogId), {
        preserveState: true,
      });
    }
  };

  const handleUpdatePriority = (backlogId: number, priority: string) => {
    router.put(
      route('agile.backlog.update', backlogId),
      { priority },
      { preserveState: true }
    );
  };

  const renderBacklogItem = (item: Backlog) => (
    <div
      key={item.id}
      className="flex items-center justify-between border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">
            {item.card?.title || `Backlog Item #${item.id}`}
          </h3>
          {getPriorityBadge(item.priority)}
          {getStatusBadge(item.status)}
        </div>

        {item.card?.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{item.card.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500">
          {item.story_points !== undefined && (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {item.story_points} pts
            </span>
          )}
          {item.epic && (
            <Badge variant="outline" className="text-xs">
              {item.epic.name}
            </Badge>
          )}
          {item.sprint && (
            <Badge variant="outline" className="text-xs">
              {item.sprint.name}
            </Badge>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleUpdatePriority(item.id, 'critical')}
          >
            Set Critical Priority
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdatePriority(item.id, 'high')}
          >
            Set High Priority
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdatePriority(item.id, 'medium')}
          >
            Set Medium Priority
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleUpdatePriority(item.id, 'low')}
          >
            Set Low Priority
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (item.type === 'product') {
                // Show sprint selector
                const sprintId = prompt('Enter sprint ID:');
                if (sprintId) handleMoveToSprint(item.id, sprintId);
              } else {
                handleMoveToProduct(item.id);
              }
            }}
          >
            {item.type === 'product' ? 'Move to Sprint' : 'Move to Product Backlog'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDelete(item.id)}
          >
            Remove from Backlog
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const productBacklogStats = {
    total: productBacklog.length,
    totalPoints: productBacklog.reduce((sum, item) => sum + (item.story_points || 0), 0),
    byPriority: {
      critical: productBacklog.filter((item) => item.priority === 'critical').length,
      high: productBacklog.filter((item) => item.priority === 'high').length,
      medium: productBacklog.filter((item) => item.priority === 'medium').length,
      low: productBacklog.filter((item) => item.priority === 'low').length,
    },
  };

  const sprintBacklogStats = {
    total: sprintBacklogs.length,
    totalPoints: sprintBacklogs.reduce((sum, item) => sum + (item.story_points || 0), 0),
    completed: sprintBacklogs.filter((item) => item.status === 'done').length,
  };

  return (
    <AppLayout title={`Backlog - ${project.name}`} >

      <div className="">
        <div className="mx-auto max-w-full sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Product Backlog</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage backlog items for {project.name}
              </p>
            </div>
           <Link href={route('agile.backlog.create')}>           
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Backlog Item
            </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Product Backlog</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productBacklogStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {productBacklogStats.totalPoints} story points
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sprint Backlog</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sprintBacklogStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {sprintBacklogStats.completed} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <ArrowUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productBacklogStats.byPriority.critical + productBacklogStats.byPriority.high}
                </div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sprints</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {sprints.filter((s) => s.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sprints.length} total sprints
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Product/Sprint Backlog */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="product">
                <Layers className="mr-2 h-4 w-4" />
                Product Backlog ({productBacklog.length})
              </TabsTrigger>
              <TabsTrigger value="sprint">
                <ListTodo className="mr-2 h-4 w-4" />
                Sprint Backlog ({sprintBacklogs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Product Backlog Items</CardTitle>
                      <CardDescription>
                        All items prioritized for future development
                      </CardDescription>
                    </div>
                    <Select defaultValue="priority">
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="story-points">Story Points</SelectItem>
                        <SelectItem value="created">Created Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {productBacklog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Layers className="mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold">No items in product backlog</h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Add items to start planning your project development.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Backlog Item
                      </Button>
                    </div>
                  ) : (
                    productBacklog.map(renderBacklogItem)
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sprint" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sprint Backlog Items</CardTitle>
                      <CardDescription>
                        Items committed for current and upcoming sprints
                      </CardDescription>
                    </div>
                    {sprints.length > 0 && (
                      <Select defaultValue={sprints.find((s) => s.status === 'active')?.id.toString()}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select sprint" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sprints</SelectItem>
                          {sprints.map((sprint) => (
                            <SelectItem key={sprint.id} value={sprint.id.toString()}>
                              {sprint.name} ({sprint.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sprintBacklogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ListTodo className="mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold">No items in sprint backlog</h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Move items from product backlog to start a sprint.
                      </p>
                    </div>
                  ) : (
                    sprintBacklogs.map(renderBacklogItem)
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Epics Section */}
          {epics.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Active Epics
                </CardTitle>
                <CardDescription>
                  Large features or initiatives spanning multiple sprints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {epics.map((epic) => (
                    <div
                      key={epic.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{epic.name}</h4>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: epic.color || '#gray',
                            color: epic.color || '#gray',
                          }}
                        >
                          {epic.status}
                        </Badge>
                      </div>
                      {epic.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {epic.description}
                        </p>
                      )}
                      {epic.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{epic.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${epic.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
