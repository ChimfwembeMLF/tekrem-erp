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
  GripVertical,
  Target,
  Calendar,
  User,
  Tag,
  ArrowUpDown,
  Filter,
  Search,
  Layers,
  Zap
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

interface BacklogItem {
  id: number;
  project_id: number;
  card_id?: number;
  epic_id?: number;
  sprint_id?: number;
  type: 'product' | 'sprint';
  title: string;
  description?: string;
  priority: number;
  story_points?: number;
  status: 'new' | 'ready' | 'in_progress' | 'done' | 'removed';
  assigned_to?: number;
  assignee?: {
    id: number;
    name: string;
  };
  order: number;
  epic?: {
    id: number;
    name: string;
    color: string;
  };
}

interface Sprint {
  id: number;
  name: string;
  status: 'planning' | 'active' | 'completed';
  start_date?: string;
  end_date?: string;
  planned_story_points: number;
  completed_story_points: number;
}

interface Epic {
  id: number;
  name: string;
  color: string;
  description?: string;
}

interface BacklogProps {
  auth: {
    user: any;
  };
  project: {
    id: number;
    name: string;
    methodology: 'waterfall' | 'agile' | 'hybrid';
  };
  productBacklog: BacklogItem[];
  sprintBacklogs: BacklogItem[];
  sprints: Sprint[];
  epics: Epic[];
  activeSprint?: Sprint;
}

export default function Backlog({ 
  auth, 
  project, 
  productBacklog = [], 
  sprintBacklogs  = [],
  sprints = [],
  epics = [],
  activeSprint 
}: BacklogProps) {
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [productItems, setProductItems] = useState<BacklogItem[]>(productBacklog);
  const [sprintItems, setSprintItems] = useState<BacklogItem[]>(sprintBacklogs);

  console.log('[sprintItems]', sprintItems);
  console.log('[sprintBacklogs]',sprintBacklogs)
  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (priority >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (priority >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProductBacklog = productItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || 
      (filterPriority === 'high' && item.priority >= 60) ||
      (filterPriority === 'medium' && item.priority >= 30 && item.priority < 60) ||
      (filterPriority === 'low' && item.priority < 30);
    const matchesEpic = filterEpic === 'all' || item.epic_id?.toString() === filterEpic;
    
    return matchesSearch && matchesPriority && matchesEpic;
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceList = source.droppableId === 'product-backlog' ? [...productItems] : [...sprintItems];
    const destList = destination.droppableId === 'product-backlog' ? [...productItems] : [...sprintItems];

    const [movedItem] = sourceList.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceList.splice(destination.index, 0, movedItem);
      if (source.droppableId === 'product-backlog') {
        setProductItems(sourceList);
      } else {
        setSprintItems(sourceList);
      }
    } else {
      movedItem.type = destination.droppableId === 'product-backlog' ? 'product' : 'sprint';
      movedItem.sprint_id = destination.droppableId === 'sprint-backlog' ? activeSprint?.id : undefined;
      destList.splice(destination.index, 0, movedItem);
      
      if (source.droppableId === 'product-backlog') {
        setProductItems(sourceList);
        setSprintItems(destList);
      } else {
        setSprintItems(sourceList);
        setProductItems(destList);
      }
    }

    // Update backend
    router.put(route('agile.backlog.move', { backlog: movedItem.id }), {
      type: movedItem.type,
      sprint_id: movedItem.sprint_id,
      order: destination.index,
    }, {
      preserveScroll: true,
    });
  };

  const totalSprintPoints = sprintItems.reduce((sum, item) => sum + (item.story_points || 0), 0);
  const sprintCapacity = activeSprint?.planned_story_points || 0;

  return (
    <AppLayout
      title={`Backlog - ${project.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Product Backlog
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('projects.show', project.id)} className="hover:underline">
                {project.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.visit(route('agile.sprints.index', project.id))}>
              <Zap className="h-4 w-4 mr-2" />
              Manage Sprints
            </Button>
            <Button onClick={() => router.visit(route('agile.backlog.create', project.id))}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`Backlog - ${project.name}`} />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search backlog items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High (60+)</SelectItem>
                  <SelectItem value="medium">Medium (30-59)</SelectItem>
                  <SelectItem value="low">Low (0-29)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterEpic} onValueChange={setFilterEpic}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Epic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Epics</SelectItem>
                  {epics.map(epic => (
                    <SelectItem key={epic.id} value={epic.id.toString()}>
                      {epic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Backlog */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Product Backlog
                    </CardTitle>
                    <Badge variant="outline">
                      {filteredProductBacklog.length} items
                    </Badge>
                  </div>
                </CardHeader>
                <Droppable droppableId="product-backlog">
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-96 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                    >
                      {filteredProductBacklog.length > 0 ? (
                        filteredProductBacklog.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                                onClick={() => router.visit(route('agile.backlog.show', [item.id, project.id]))}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div {...provided.dragHandleProps} className="mt-1">
                                      <GripVertical className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-start justify-between gap-4">
                                        <h4 className="font-medium text-sm">{item.title}</h4>
                                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                          P{item.priority}
                                        </Badge>
                                      </div>
                                      
                                      {item.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                          {item.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        {item.story_points && (
                                          <div className="flex items-center gap-1">
                                            <Target className="h-3 w-3" />
                                            <span>{item.story_points} pts</span>
                                          </div>
                                        )}
                                        {item.assignee && (
                                          <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>{item.assignee.name}</span>
                                          </div>
                                        )}
                                        {item.epic && (
                                          <Badge 
                                            variant="outline" 
                                            className="text-xs"
                                            style={{ backgroundColor: item.epic.color + '20', borderColor: item.epic.color }}
                                          >
                                            {item.epic.name}
                                          </Badge>
                                        )}
                                        <Badge variant="outline" className={getStatusColor(item.status)}>
                                          {item.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>No items in product backlog</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => router.visit(route('agile.backlog.create', project.id))}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Item
                          </Button>
                        </div>
                      )}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>

            {/* Sprint Backlog */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Sprint Backlog
                    </CardTitle>
                    {activeSprint && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {activeSprint.name}
                      </Badge>
                    )}
                  </div>
                  {activeSprint && (
                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Story Points</span>
                        <span className={totalSprintPoints > sprintCapacity ? 'text-red-600 font-medium' : ''}>
                          {totalSprintPoints} / {sprintCapacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            totalSprintPoints > sprintCapacity ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min((totalSprintPoints / sprintCapacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardHeader>
                <Droppable droppableId="sprint-backlog">
                  {(provided, snapshot) => (
                    <CardContent
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-96 ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                    >
                      {!activeSprint ? (
                        <div className="text-center py-12 text-gray-500">
                          <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="mb-2">No active sprint</p>
                          <Button 
                            variant="outline"
                            onClick={() => router.visit(route('agile.sprints.create', project.id))}
                          >
                            Start Sprint
                          </Button>
                        </div>
                      ) : sprintItems.length > 0 ? (
                        sprintItems.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`cursor-pointer hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : ''
                                }`}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        {item.story_points && (
                                          <Badge variant="outline" className="text-xs">
                                            {item.story_points} pts
                                          </Badge>
                                        )}
                                        <Badge variant="outline" className={getStatusColor(item.status)}>
                                          {item.status.replace('_', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">Drag items here to add to sprint</p>
                        </div>
                      )}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            </div>
          </div>
        </DragDropContext>
      </div>
    </AppLayout>
  );
}
