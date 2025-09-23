import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { SprintForm, type SprintFormData } from './SprintForm';
import { Plus, Calendar, Target, Users, BarChart3, Edit, Trash2, Play, Pause, CheckCircle } from 'lucide-react';

export type Sprint = {
  id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  reports: SprintReport[];
  cards?: any[];
};

export type SprintReport = {
  id: number;
  user_id: number;
  summary?: string;
  completed_points?: number;
  incomplete_points?: number;
  velocity?: number;
  metrics?: Record<string, any>;
};

interface SprintManagementProps {
  sprints: Sprint[];
  boardId: number;
  onSprintCreate?: (sprintData: SprintFormData) => void;
  onSprintEdit?: (sprint: Sprint) => void;
  onSprintDelete?: (sprintId: number) => void;
  onSprintStatusChange?: (sprintId: number, newStatus: string) => void;
}

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-700 border-gray-300',
  active: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-gray-100 text-gray-500 border-gray-300',
};

const statusIcons: Record<string, React.ReactNode> = {
  planned: <Calendar className="h-3 w-3" />,
  active: <Play className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  archived: <Pause className="h-3 w-3" />,
};

export function SprintManagement({
  sprints,
  boardId,
  onSprintCreate,
  onSprintEdit,
  onSprintDelete,
  onSprintStatusChange,
}: SprintManagementProps) {
  const [sprintFormOpen, setSprintFormOpen] = useState(false);
  const [sprintFormMode, setSprintFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const handleCreateSprint = () => {
    setSprintFormMode('create');
    setSelectedSprint(null);
    setSprintFormOpen(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setSprintFormMode('edit');
    setSelectedSprint(sprint);
    setSprintFormOpen(true);
  };

  const handleSprintSave = (data: SprintFormData) => {
    if (sprintFormMode === 'create') {
      onSprintCreate?.(data);
    } else if (selectedSprint) {
      onSprintEdit?.({ ...selectedSprint, ...data });
    }
  };

  const getSprintDuration = (sprint: Sprint) => {
    if (!sprint.start_date || !sprint.end_date) return null;
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const getSprintProgress = (sprint: Sprint) => {
    if (!sprint.start_date || !sprint.end_date) return null;
    const now = new Date();
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    
    if (now < start) return { percentage: 0, status: 'upcoming' };
    if (now > end) return { percentage: 100, status: 'past' };
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentage = Math.min(100, Math.max(0, (elapsed / total) * 100));
    
    return { percentage: Math.round(percentage), status: 'active' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sprints</h3>
          <p className="text-sm text-gray-600">Manage your development cycles</p>
        </div>
        <Button onClick={handleCreateSprint}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {sprints.filter(s => s.status === 'planned').length}
              </p>
              <p className="text-xs text-gray-500">Planned</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Play className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {sprints.filter(s => s.status === 'active').length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {sprints.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {sprints.reduce((total, sprint) => total + (sprint.reports?.length || 0), 0)}
              </p>
              <p className="text-xs text-gray-500">Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints List */}
      <div className="space-y-4">
        {sprints.length === 0 && (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No sprints created yet</p>
            <p className="text-sm text-gray-400 mb-4">Get started by creating your first sprint</p>
            <Button onClick={handleCreateSprint}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Sprint
            </Button>
          </div>
        )}

        {sprints.map((sprint) => {
          const progress = getSprintProgress(sprint);
          const duration = getSprintDuration(sprint);
          
          return (
            <div key={sprint.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              {/* Sprint Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{sprint.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${statusColors[sprint.status || 'planned']}`}>
                      {statusIcons[sprint.status || 'planned']}
                      <span className="ml-1 capitalize">{sprint.status || 'planned'}</span>
                    </span>
                  </div>
                  {sprint.goal && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <Target className="h-3 w-3 mr-1" />
                      {sprint.goal}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSprint(sprint)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSprintDelete?.(sprint.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Sprint Details */}
              <div className="space-y-4">
                {/* Dates and Duration */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {sprint.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(sprint.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {sprint.end_date && (
                    <div className="flex items-center gap-1">
                      <span>→</span>
                      <span>{new Date(sprint.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {duration && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border">
                      {duration}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {progress && sprint.status === 'active' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Sprint Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span>{sprint.cards?.length || 0} cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3 text-gray-400" />
                    <span>{sprint.reports?.length || 0} reports</span>
                  </div>
                  {sprint.reports && sprint.reports.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-gray-400" />
                      <span>
                        {sprint.reports[sprint.reports.length - 1]?.completed_points || 0} pts completed
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  {sprint.status === 'planned' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSprintStatusChange?.(sprint.id, 'active')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start Sprint
                    </Button>
                  )}
                  {sprint.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSprintStatusChange?.(sprint.id, 'completed')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete Sprint
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sprint Form Modal */}
      <SprintForm
        isOpen={sprintFormOpen}
        onClose={() => setSprintFormOpen(false)}
        onSave={handleSprintSave}
        initialData={selectedSprint ? {
          id: selectedSprint.id,
          name: selectedSprint.name,
          goal: selectedSprint.goal || '',
          start_date: selectedSprint.start_date || '',
          end_date: selectedSprint.end_date || '',
          status: selectedSprint.status || 'planned',
          board_id: boardId,
        } : {}}
        boardId={boardId}
        mode={sprintFormMode}
      />
    </div>
  );
}