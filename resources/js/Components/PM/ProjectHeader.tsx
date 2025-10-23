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
  const [isCreating, setIsCreating] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  // Safe callback wrappers with error handling
  const safeOnViewChange = (view: string) => {
    try {
      onViewChange?.(view);
    } catch (error) {
      console.error('Error changing view:', error);
    }
  };

  const safeOnCreateClick = async (view: string) => {
    try {
      setIsCreating(true);
      await onCreateClick?.(view);
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const safeOnBoardChange = (boardId: string) => {
    try {
      onBoardChange?.(boardId);
    } catch (error) {
      console.error('Error changing board:', error);
    }
  };

  const safeOnSprintChange = (sprintId: string) => {
    try {
      onSprintChange?.(sprintId);
    } catch (error) {
      console.error('Error changing sprint:', error);
    }
  };

  const safeOnAssigneeChange = (assigneeId: string) => {
    try {
      onAssigneeChange?.(assigneeId);
    } catch (error) {
      console.error('Error changing assignee:', error);
    }
  };

  // Keyboard shortcuts with improved feedback
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
        if (searchInput) {
          searchInput.focus();
          searchInput.select(); // Select all text for better UX
        }
        return;
      }

      // Number keys for view switching
      if (e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const viewIndex = parseInt(e.key) - 1;
        if (views[viewIndex]) {
          safeOnViewChange(views[viewIndex].key);

          // Provide visual feedback
          const tabElement = document.querySelector(`[value="${views[viewIndex].key}"]`);
          if (tabElement) {
            tabElement.classList.add('ring-2', 'ring-primary');
            setTimeout(() => {
              tabElement.classList.remove('ring-2', 'ring-primary');
            }, 300);
          }
        }
        return;
      }

      // 'c' for create
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        safeOnCreateClick(currentView);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentView]);
  return (
    <div className="bg-card top-0 z-40">
      {/* Top Navigation Bar */}
      <div className="px-3 sm:px-6 py-3 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left side - Project info */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
              {project.avatar ? (
                <img src={project.avatar} alt={project.name} className="w-full h-full rounded object-cover" />
              ) : (
                project.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{project.name}</h1>
            </div>
          </div>

          {/* Search - full width on mobile */}
          <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 w-full text-sm"
              title="Search issues (⌘K)"
            />
          </div>
        </div>
      </div>

      {/* Secondary Navigation - Views */}
      <div className="px-3 sm:px-6 py-2 border-b border-border">
        {/* Proper Tabs Implementation using UI components */}
        <Tabs value={currentView} onValueChange={safeOnViewChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-9 sm:h-10">
            {views.map((view, index) => (
              <TabsTrigger
                key={view.key}
                value={view.key}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3 transition-all"
                title={`${view.label} (${index + 1})`}
                aria-label={`Switch to ${view.label} view (${index + 1})`}
              >
                {view.icon}
                <span className="hidden xs:inline sm:inline truncate">{view.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Board and Sprint selector - Mobile responsive */}
        <div className="mt-3 sm:mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
              {boards.length > 0 && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">Board:</span>
                  <Select
                    value={selectedBoardId || activeBoard?.id?.toString() || ""}
                    onValueChange={safeOnBoardChange}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs sm:text-sm" aria-label="Select board">
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      {boards.map((board) => (
                        <SelectItem key={board.id} value={board.id.toString()}>
                          <span className="truncate" title={board.name}>{board.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeBoard?.sprints && activeBoard.sprints.length > 0 && (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">Sprint:</span>
                  <Select value={selectedSprintId || ""} onValueChange={safeOnSprintChange}>
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs sm:text-sm" aria-label="Select sprint">
                      <SelectValue placeholder="All sprints" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Sprints</SelectItem>
                      {activeBoard.sprints.map((sprint: Sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="truncate" title={sprint.name}>{sprint.name}</span>
                            {sprint.status === 'active' && (
                              <span className="text-xs text-green-600 hidden sm:inline" title="Active sprint">
                                ● Active
                              </span>
                            )}
                            {sprint.status === 'completed' && (
                              <span className="text-xs text-gray-500 hidden sm:inline" title="Completed sprint">
                                ✓ Done
                              </span>
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
                  <span className="text-muted-foreground whitespace-nowrap text-xs sm:text-sm">Assignee:</span>
                  <Select value={selectedAssigneeId || ""} onValueChange={safeOnAssigneeChange}>
                    <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs sm:text-sm" aria-label="Filter by assignee">
                      <SelectValue placeholder="All assignees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All Assignees</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center text-xs">
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate" title={`${employee.name} (${employee.email})`}>
                              {employee.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Create Button - Responsive */}
            <div className="flex-shrink-0">
              <Button
                onClick={() => safeOnCreateClick(currentView)}
                disabled={isCreating}
                className="w-full sm:w-auto gap-2 h-8 text-xs sm:text-sm px-3 sm:px-4 transition-all hover:scale-105 disabled:opacity-50"
                title="Create new item (C)"
                aria-label={`Create new ${currentView} item`}
              >
                {isCreating ? (
                  <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="sm:inline">{isCreating ? 'Creating...' : 'Create'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}