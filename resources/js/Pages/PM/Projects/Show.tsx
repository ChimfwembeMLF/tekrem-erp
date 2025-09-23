import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DndContext } from '@dnd-kit/core';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectHeader } from '@/Components/PM/ProjectHeader';
import { JiraBoard } from '@/Components/PM/JiraBoard';
import { JiraCardForm } from '@/Components/PM/JiraCardFormEnhanced';
import AddColumnModal from '@/Components/PM/AddColumnModal';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';


type Card = {
  id: number;
  title: string;
  key: string | number;
  status?: string;
  assignee_id?: number;
  sprint_id?: number;
  assignees?: string[];
  tags?: string[];
};
type Column = {
  id: number;
  name: string;
  order?: number;
  color?: string;
  is_done_column?: boolean;
  cards: Card[];
};
type Epic = {
  id: number;
  name: string;
  description?: string;
  color?: string;
};
type Label = {
  id: number;
  name: string;
  color?: string;
};
type Member = {
  id: number;
  role?: string;
  user?: { id: number; name: string; email: string } | null;
};
type SprintReport = {
  id: number;
  user_id: number;
  summary?: string;
  completed_points?: number;
  incomplete_points?: number;
  velocity?: number;
  metrics?: Record<string, any>;
};
type Sprint = {
  id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  reports: SprintReport[];
};
type Board = {
  id: number;
  name: string;
  type?: string;
  description?: string;
  columns: Column[];
  epics: Epic[];
  labels: Label[];
  members: Member[];
  sprints: Sprint[];
};
type Project = {
  id: number;
  name: string;
  [key: string]: any;
};
type Analytics = { [key: string]: any };
type Employee = {
  id: number;
  name: string;
  email: string;
};

interface ShowProps {
  project: Project;
  boards?: Board[];
  analytics?: Analytics;
  employees?: Employee[];
}

export default function Show({ project, boards = [], analytics = {}, employees = [] }: ShowProps) {
  const route = useRoute();
  // Use the first board as the active board (could be improved to select)
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [addColumnModalOpen, setAddColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [cardFormData, setCardFormData] = useState<any>({});
  const [selectedColumnId, setSelectedColumnId] = useState<number>(0);
  const [currentView, setCurrentView] = useState<string>('board');
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id?.toString() || '');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  
  // Find the active board based on selection
  const activeBoard: Board = boards.find(b => b.id.toString() === selectedBoardId) || boards[0] || { id: 0, name: '', columns: [], epics: [], labels: [], members: [], sprints: [] };
  
  // Filter columns and cards based on selected sprint and assignee
  const filteredColumns = React.useMemo(() => {
    let filteredCards = activeBoard.columns || [];
    
    // Filter by sprint if selected
    if (selectedSprintId && selectedSprintId !== '') {
      const sprintIdNumber = parseInt(selectedSprintId);
      filteredCards = filteredCards.map(column => ({
        ...column,
        cards: (column.cards || []).filter(card => card.sprint_id === sprintIdNumber)
      }));
    }
    
    // Filter by assignee if selected
    if (selectedAssigneeId && selectedAssigneeId !== '') {
      const assigneeIdNumber = parseInt(selectedAssigneeId);
      filteredCards = filteredCards.map(column => ({
        ...column,
        cards: (column.cards || []).filter(card => card.assignee_id === assigneeIdNumber)
      }));
    }
    
    return filteredCards;
  }, [activeBoard.columns, selectedSprintId, selectedAssigneeId]);
  
  const columns: Column[] = Array.isArray(filteredColumns) ? filteredColumns : [];
  const epics: Epic[] = Array.isArray(activeBoard.epics) ? activeBoard.epics : [];
  const labels: Label[] = Array.isArray(activeBoard.labels) ? activeBoard.labels : [];
  const members: Member[] = Array.isArray(activeBoard.members) ? activeBoard.members : [];
  const sprints: Sprint[] = Array.isArray(activeBoard.sprints) ? activeBoard.sprints : [];
  const assigneeColors: Record<string, string> = {
    CK: 'bg-orange-400',
    CM: 'bg-purple-400',
    D: 'bg-red-400',
  };

  const handleCardCreate = (columnId: number) => {
    setSelectedColumnId(columnId);
    setCardFormMode('create');
    setCardFormData({});
    setCardFormOpen(true);
  };

  const handleCardEdit = (card: any) => {
    setCardFormMode('edit');
    setCardFormData({
      id: card.id,
      title: card.title,
      description: card.description || '',
      priority: card.priority || 'medium',
      story_points: card.story_points || null,
      due_date: card.due_date || '',
      assignees: card.assignees || [],
      tags: card.tags || [],
      epic_id: card.epic_id || null,
      sprint_id: card.sprint_id || null,
    });
    setCardFormOpen(true);
  };

  const handleCardSave = (data: any) => {
    if (cardFormMode === 'create') {
      // Create new card
      router.post(route('pm.boards.cards.store', activeBoard.id), data, {
        onSuccess: () => {
          setCardFormOpen(false);
          toast.success('Card created successfully');
        },
        onError: (errors) => {
          console.error('Error creating card:', errors);
          toast.error('Failed to create card. Please try again.');
        }
      });
    } else if (data.id) {
      // Update existing card
      router.put(route('pm.cards.update', data.id), data, {
        onSuccess: () => {
          setCardFormOpen(false);
          toast.success('Card updated successfully');
        },
        onError: (errors) => {
          console.error('Error updating card:', errors);
          toast.error('Failed to update card. Please try again.');
        }
      });
    }
  };

  const handleSprintCreate = (data: any) => {
    router.post(route('pm.sprints.store', {
      project: project.id,
      board: activeBoard.id
    }), data, {
      onError: (errors) => {
        console.error('Error creating sprint:', errors);
      }
    });
  };

  const handleSprintEdit = (sprint: any) => {
    router.put(route('pm.sprints.update', {
      project: project.id,
      board: activeBoard.id,
      sprint: sprint.id
    }), sprint, {
      onError: (errors) => {
        console.error('Error updating sprint:', errors);
      }
    });
  };

  const handleSprintDelete = (sprintId: number) => {
    if (confirm('Are you sure you want to delete this sprint?')) {
      router.delete(route('pm.sprints.destroy', {
        project: project.id,
        board: activeBoard.id,
        sprint: sprintId
      }), {
        onError: (errors) => {
          console.error('Error deleting sprint:', errors);
        }
      });
    }
  };

  const handleSprintStatusChange = (sprintId: number, newStatus: string) => {
    if (newStatus === 'active') {
      router.post(route('pm.sprints.start', sprintId), {}, {
        onError: (errors) => {
          console.error('Error starting sprint:', errors);
        }
      });
    } else if (newStatus === 'completed') {
      router.post(route('pm.sprints.complete', sprintId), {}, {
        onError: (errors) => {
          console.error('Error completing sprint:', errors);
        }
      });
    } else {
      // For other status changes, use regular update
      router.put(route('pm.sprints.update', {
        project: project.id,
        board: activeBoard.id,
        sprint: sprintId
      }), { status: newStatus }, {
        onError: (errors) => {
          console.error('Error changing sprint status:', errors);
        }
      });
    }
  };

  const handleBoardCreate = (data: any) => {
    router.post(route('pm.boards.store'), {
      ...data,
      project_id: project.id
    }, {
      onError: (errors) => {
        console.error('Error creating board:', errors);
      }
    });
  };

  const handleBoardEdit = (data: any) => {
    router.put(route('pm.boards.update', data.id), data, {
      onError: (errors) => {
        console.error('Error updating board:', errors);
      }
    });
  };

  const handleBoardDelete = (boardId: number) => {
    if (confirm('Are you sure you want to delete this board?')) {
      router.delete(route('pm.boards.destroy', boardId), {
        onError: (errors) => {
          console.error('Error deleting board:', errors);
        }
      });
    }
  };

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setAddColumnModalOpen(true);
  };

  const handleEditColumn = (columnId: number) => {
    const column = activeBoard.columns?.find(col => col.id === columnId);
    if (column) {
      setEditingColumn(column);
      setAddColumnModalOpen(true);
    }
  };

  const handleMoveCard = (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => {
    router.post(route('pm.cards.move', cardId), {
      column_id: toColumnId,
      position: newIndex
    }, {
      onSuccess: () => {
        toast.success('Card moved successfully');
      },
      onError: (errors) => {
        console.error('Error moving card:', errors);
        toast.error('Failed to move card. Please check your connection and try again.');
      }
    });
  };

  const handleColumnMove = (columnId: number, newIndex: number) => {
    router.post(route('pm.boards.reorder-columns', activeBoard.id), {
      column_id: columnId,
      order: newIndex
    }, {
      onSuccess: () => {
        toast.success('Column reordered successfully');
      },
      onError: (errors) => {
        console.error('Error reordering column:', errors);
        toast.error('Failed to reorder column. Please check your connection and try again.');
      }
    });
  };

  const handleCardEdit2 = (card: any) => {
    setCardFormData(card);
    setCardFormMode('edit');
    setCardFormOpen(true);
  };

  const handleColumnEdit = (data: any) => {
    router.put(route('pm.columns.update', data.id), data, {
      onSuccess: () => {
        toast.success('Column updated successfully');
      },
      onError: (errors) => {
        console.error('Error updating column:', errors);
        toast.error('Failed to update column. Please try again.');
      }
    });
  };

  const handleColumnDelete = (columnId: number) => {
    if (confirm('Are you sure you want to delete this column?')) {
      router.delete(route('pm.columns.destroy', columnId), {
        onSuccess: () => {
          toast.success('Column deleted successfully');
        },
        onError: (errors) => {
          console.error('Error deleting column:', errors);
          toast.error('Failed to delete column. Please try again.');
        }
      });
    }
  };

  const handleColumnReorder = (columnId: number, newOrder: number) => {
    router.post(route('pm.boards.reorder-columns', activeBoard.id), {
      column_id: columnId,
      order: newOrder
    }, {
      onSuccess: () => {
        toast.success('Column reordered successfully');
      },
      onError: (errors) => {
        console.error('Error reordering column:', errors);
        toast.error('Failed to reorder column. Please try again.');
      }
    });
  };

  const handleMemberInvite = (data: any) => {
    router.post(route('pm.members.store', {
      board: activeBoard.id
    }), data, {
      onError: (errors) => {
        console.error('Error inviting member:', errors);
      }
    });
  };

  const handleMemberEdit = (data: any) => {
    router.put(route('pm.members.update', data.id), data, {
      onError: (errors) => {
        console.error('Error updating member:', errors);
      }
    });
  };

  const handleMemberRemove = (memberId: number) => {
    if (confirm('Are you sure you want to remove this member?')) {
      router.post(route('pm.members.remove', memberId), {}, {
        onError: (errors) => {
          console.error('Error removing member:', errors);
        }
      });
    }
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    router.put(route('pm.members.update', memberId), {
      role: newRole
    }, {
      onError: (errors) => {
        console.error('Error changing member role:', errors);
      }
    });
  };

  const handleBoardChange = (boardId: string) => {
    setSelectedBoardId(boardId);
    setSelectedSprintId(''); // Reset sprint when board changes
    setSelectedAssigneeId(''); // Reset assignee when board changes
  };

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprintId(sprintId);
  };

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssigneeId(assigneeId);
  };

  return (
    <AppLayout title={project.name}>
      <Head title={`${project.name} - Project Management`} />
      <div className="bg-background min-h-screen">
        <ProjectHeader 
          project={project}
          boards={boards}
          activeBoard={activeBoard}
          selectedBoardId={selectedBoardId}
          selectedSprintId={selectedSprintId}
          selectedAssigneeId={selectedAssigneeId}
          employees={employees}
          currentView={currentView}
          onViewChange={setCurrentView}
          onBoardChange={handleBoardChange}
          onSprintChange={handleSprintChange}
          onAssigneeChange={handleAssigneeChange}
        />
        
        <div className="px-6 py-4">
          {currentView === 'board' && activeBoard && (
            <JiraBoard
              columns={(columns || []).map(col => ({
                ...col,
                cards: (col.cards || []).map(card => ({
                  ...card,
                  key: card.key?.toString() || `TASK-${card.id}`,
                  type: 'task' as const,
                  priority: 'medium' as const,
                  assignee: null,
                  labels: [],
                  subtasks_count: 0,
                  completed_subtasks_count: 0
                }))
              }))}
              onCardMove={handleMoveCard}
              onColumnMove={handleColumnMove}
              onCardCreate={handleCardCreate}
              onCardEdit={handleCardEdit2}
              onCardClick={handleCardEdit2}
              onColumnCreate={handleCreateColumn}
              onColumnEdit={handleColumnEdit}
            />
          )}
          
          {currentView === 'reports' && (
            <div className="bg-card p-6 rounded-lg shadow border border-border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Project Reports</h2>
              <p className="text-muted-foreground">Reports functionality coming soon...</p>
            </div>
          )}
          
          {currentView === 'settings' && (
            <div className="bg-card p-6 rounded-lg shadow border border-border">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Project Settings</h2>
              <p className="text-muted-foreground">Settings functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Jira-style Card Form */}
      <JiraCardForm
        isOpen={cardFormOpen}
        onClose={() => setCardFormOpen(false)}
        onSave={handleCardSave}
        card={cardFormData}
        mode={cardFormMode}
        columnId={selectedColumnId}
        employees={employees}
      />

      {/* Add/Edit Column Modal */}
      <AddColumnModal
        open={addColumnModalOpen}
        onClose={() => {
          setAddColumnModalOpen(false);
          setEditingColumn(null);
        }}
        boardId={activeBoard.id}
        projectId={project.id}
        existingColumns={activeBoard.columns || []}
        editColumn={editingColumn}
        onSuccess={() => {
          // Refresh the page to get updated data
          router.reload();
        }}
      />
    </AppLayout>
  );
}