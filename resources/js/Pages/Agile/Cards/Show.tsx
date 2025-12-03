import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Edit, Trash2, Calendar, Target, Users, Flag } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { LinkedItemIndicator } from '@/Components/HybridSync';

interface BoardCard {
  id: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  due_date?: string;
  assignee?: any;
  reporter?: any;
  column: any;
  board: any;
  sprint?: any;
  epic?: any;
  task?: any;
}

interface CardShowProps {
  auth: { user: any };
  card: BoardCard;
  project: any;
}

export default function CardShow({ auth, card, project }: CardShowProps) {
  const route = useRoute();

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors];
  };

  const getTypeColor = (type: string) => {
    const colors = {
      story: 'bg-blue-100 text-blue-800',
      task: 'bg-gray-100 text-gray-800',
      bug: 'bg-red-100 text-red-800',
      epic: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors];
  };

  return (
    <AppLayout
      title={card.title}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight">{card.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              <Link href={route('agile.board.show', card.board.id)} className="hover:underline">
                {card.board.name}
              </Link>
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={route('agile.cards.edit', card.id)}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this card?')) {
                  router.delete(route('agile.cards.destroy', card.id));
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={card.title} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Details</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getTypeColor(card.type)}>
                        {card.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(card.priority)}>
                        {card.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {card.description || 'No description provided'}
                    </p>
                  </div>
                  
                  {project.methodology === 'hybrid' && card.task && (
                    <LinkedItemIndicator type="card" linkedItem={card.task} />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Story Points:</span>
                    <span className="font-medium">{card.story_points || 'Not set'}</span>
                  </div>
                  
                  {card.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Due:</span>
                      <span className="font-medium">
                        {new Date(card.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {card.assignee && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Assignee:</span>
                      <span className="font-medium">{card.assignee.name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Flag className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{card.column.name}</span>
                  </div>
                  
                  {card.sprint && (
                    <div className="pt-3 border-t">
                      <span className="text-xs text-gray-600">Sprint:</span>
                      <p className="font-medium text-sm">{card.sprint.name}</p>
                    </div>
                  )}
                  
                  {card.epic && (
                    <div className="pt-3 border-t">
                      <span className="text-xs text-gray-600">Epic:</span>
                      <p className="font-medium text-sm">{card.epic.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
