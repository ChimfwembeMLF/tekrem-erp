import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { 
  Link2, 
  Unlink, 
  ArrowRight, 
  Search,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Task {
  id: number;
  name: string;
  status: string;
  priority?: string;
  card_id?: number;
  card?: BoardCard;
}

interface BoardCard {
  id: number;
  title: string;
  type: string;
  status: string;
  task_id?: number;
}

interface TaskCardLinkerProps {
  task?: Task;
  card?: BoardCard;
  projectId: number;
  availableCards?: BoardCard[];
  availableTasks?: Task[];
  mode: 'task' | 'card';
}

export default function TaskCardLinker({ 
  task, 
  card, 
  projectId,
  availableCards = [],
  availableTasks = [],
  mode 
}: TaskCardLinkerProps) {
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLinkOptions, setShowLinkOptions] = useState(false);

  const isLinked = mode === 'task' ? !!task?.card_id : !!card?.task_id;
  const linkedItem = mode === 'task' ? task?.card : card?.task;

  const handleCreateLink = (targetId: number) => {
    if (mode === 'task' && task) {
      router.post(route('hybrid.link.task-to-card', { task: task.id }), {
        card_id: targetId
      }, {
        onSuccess: () => setShowLinkOptions(false)
      });
    } else if (mode === 'card' && card) {
      router.post(route('hybrid.link.card-to-task', { card: card.id }), {
        task_id: targetId
      }, {
        onSuccess: () => setShowLinkOptions(false)
      });
    }
  };

  const handleBreakLink = () => {
    if (mode === 'task' && task) {
      router.delete(route('hybrid.unlink.task', task.id));
    } else if (mode === 'card' && card) {
      router.delete(route('hybrid.unlink.card', card.id));
    }
  };

  const filteredItems = mode === 'task' 
    ? availableCards.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableTasks.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Hybrid Mode Sync</CardTitle>
          </div>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            {isLinked ? 'Linked' : 'Not Linked'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLinked && linkedItem ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 flex-1">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">
                    {mode === 'task' ? 'Linked to Card' : 'Linked to Task'}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    {mode === 'task' 
                      ? (linkedItem as BoardCard).title 
                      : (linkedItem as Task).name
                    }
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(
                mode === 'task' 
                  ? (linkedItem as BoardCard).status 
                  : (linkedItem as Task).status
              )}>
                {mode === 'task' 
                  ? (linkedItem as BoardCard).status 
                  : (linkedItem as Task).status
                }
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const targetRoute = mode === 'task' 
                    ? route('agile.cards.show', (linkedItem as BoardCard).id)
                    : route('tasks.show', (linkedItem as Task).id);
                  router.visit(targetRoute);
                }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                View {mode === 'task' ? 'Card' : 'Task'}
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBreakLink}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Changes to status and progress are automatically synced between the task and card.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!showLinkOptions ? (
              <div className="text-center py-4">
                <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-600 mb-4">
                  This {mode === 'task' ? 'task' : 'card'} is not linked to any {mode === 'task' ? 'board card' : 'task'}.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLinkOptions(true)}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Link
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={`Search ${mode === 'task' ? 'cards' : 'tasks'}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLinkOptions(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item: any) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCreateLink(item.id)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {mode === 'task' ? item.title : item.name}
                          </div>
                          {mode === 'task' && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {item.type}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No {mode === 'task' ? 'cards' : 'tasks'} found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
