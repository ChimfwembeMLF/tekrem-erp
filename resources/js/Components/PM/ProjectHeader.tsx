import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/Components/ui/tabs';
import { 
  Search, 
  Bell, 
  Settings, 
  Plus, 
  Filter,
  MoreHorizontal,
  Star,
  Users,
  Calendar,
  BarChart3,
  Target,
  Layers
} from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Sprint {
  id: number;
  name: string;
  status?: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  reports?: any[];
}

interface Board {
  id: number;
  name: string;
  sprints?: Sprint[];
}

export interface ProjectHeaderProps {
  project: {
    id: number;
    name: string;
    description?: string;
    avatar?: string;
    members?: Member[];
  };
  boards?: Board[];
  activeBoard?: Board;
  selectedBoardId?: string;
  selectedSprintId?: string;
  selectedAssigneeId?: string;
  members?: Member[];
  employees?: { id: number; name: string; email: string; }[];
  currentView?: string;
  onViewChange: (view: string) => void;
  onBoardChange?: (boardId: string) => void;
  onSprintChange?: (sprintId: string) => void;
  onAssigneeChange?: (assigneeId: string) => void;
  onCreateClick?: (view: string) => void;
  onSearchChange?: (query: string) => void;
}

const views = [
  { key: 'board', label: 'Board', icon: <Layers className="h-4 w-4" /> },
  { key: 'backlog', label: 'Backlog', icon: <MoreHorizontal className="h-4 w-4" /> },
  { key: 'timeline', label: 'Timeline', icon: <Calendar className="h-4 w-4" /> },
  { key: 'reports', label: 'Reports', icon: <BarChart3 className="h-4 w-4" /> },
  { key: 'roadmap', label: 'Roadmap', icon: <Target className="h-4 w-4" /> },
];

export function ProjectHeader({ 
  project, 
  boards = [],
  activeBoard, 
  selectedBoardId,
  selectedSprintId,
  selectedAssigneeId,
  employees = [],
  currentView = 'board',
  onViewChange,
  onBoardChange,
  onSprintChange,
  onAssigneeChange,
  onCreateClick,
  onSearchChange
}: ProjectHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K for search focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search issues"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Number keys for view switching
      if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const viewIndex = parseInt(e.key) - 1;
        if (views[viewIndex]) {
          onViewChange(views[viewIndex].key);
        }
        return;
      }

      // 'c' for create
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onCreateClick?.(currentView);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentView, onViewChange, onCreateClick]);
  return (
    <div className="bg-card top-0 z-40">
      {/* Top Navigation Bar */}
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Left side - Project info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm font-bold">
              {project.avatar ? (
                <img src={project.avatar} alt={project.name} className="w-full h-full rounded object-cover" />
              ) : (
                project.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Software project</span>
                <span>•</span>
                <button className="flex items-center gap-1 hover:text-foreground">
                  <Star className="h-3 w-3" />
                  Star
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search issues... (⌘K)"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 w-64"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => onCreateClick?.(currentView)}
              title="Create new item (C)"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {currentView === 'board' ? 'Create Issue' : 
                 currentView === 'backlog' ? 'Add Story' :
                 currentView === 'timeline' ? 'Add Milestone' :
                 currentView === 'reports' ? 'Generate Report' :
                 'Create'}
              </span>
              <span className="sm:hidden">Create</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Views */}
      <div className="px-6 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Proper Tabs Implementation using UI components */}
          <Tabs value={currentView} onValueChange={onViewChange} className="w-auto">
            <TabsList className="grid w-full grid-cols-5">
              {views.map((view, index) => (
                <TabsTrigger 
                  key={view.key} 
                  value={view.key} 
                  className="flex items-center gap-2"
                  title={`${view.label} (${index + 1})`}
                >
                  {view.icon}
                  <span className="hidden sm:inline">{view.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Board and Sprint selector */}
          <div className="flex items-center gap-3 text-sm flex-wrap">
            {boards.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground whitespace-nowrap">Board:</span>
                <Select value={selectedBoardId || activeBoard?.id?.toString() || ""} onValueChange={onBoardChange}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id.toString()}>
                        {board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {activeBoard?.sprints && activeBoard.sprints.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground whitespace-nowrap">Sprint:</span>
                <Select value={selectedSprintId || ""} onValueChange={onSprintChange}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="All sprints" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Sprints</SelectItem>
                    {activeBoard.sprints.map((sprint: Sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{sprint.name}</span>
                          {sprint.status === 'active' && (
                            <span className="text-xs text-green-600">(Active)</span>
                          )}
                          {sprint.status === 'completed' && (
                            <span className="text-xs text-gray-500">(Completed)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {employees.length > 0 && (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground whitespace-nowrap">Assignee:</span>
                <Select value={selectedAssigneeId || ""} onValueChange={onAssigneeChange}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="All assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Assignees</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}