import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ProjectHeader } from '@/Components/PM/ProjectHeader';
import { JiraBoard } from '@/Components/PM/JiraBoard';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

type Card = {
  id: number;
  title: string;
  key: string | number;
  status?: string;
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

type Board = {
  id: number;
  name: string;
  type?: string;
  description?: string;
  columns: Column[];
};

type Project = {
  id: number;
  name: string;
  [key: string]: any;
};

interface ShowProps {
  project: Project;
  boards?: Board[];
}

export default function Show({ project, boards = [] }: ShowProps) {
  const route = useRoute();
  const [currentView, setCurrentView] = useState<string>('board');
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [cardFormMode, setCardFormMode] = useState<'create' | 'edit'>('create');
  const [cardFormData, setCardFormData] = useState<any>({});
  
  const activeBoard: Board = boards[0] || { id: 0, name: '', columns: [] };

  const handleCreateColumn = () => {
    const name = prompt('Enter column name:');
    if (!name || !activeBoard) return;
    
    router.post(route('pm.columns.store', {
      board: activeBoard.id
    }), { name, order: (activeBoard.columns?.length || 0) + 1 }, {
      onSuccess: () => {
        toast.success('Column created successfully');
      },
      onError: (errors) => {
        console.error('Error creating column:', errors);
        toast.error('Failed to create column. Please try again.');
      }
    });
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
        toast.error('Failed to move card. Please try again.');
      }
    });
  };

  const handleCardEdit = (card: any) => {
    setCardFormData(card);
    setCardFormMode('edit');
    setCardFormOpen(true);
  };

  const handleCardCreate = () => {
    setCardFormData({});
    setCardFormMode('create');
    setCardFormOpen(true);
  };

  return (
    <AppLayout title={project.name}>
      <Head title={`${project.name} - Project Management`} />
      <div className="bg-gray-50 min-h-screen">
        <ProjectHeader 
          project={project}
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        
        <div className="px-6 py-4">
          {currentView === 'board' && activeBoard && (
            <JiraBoard
              columns={(activeBoard.columns || []).map(col => ({
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
              onCardCreate={handleCardCreate}
              onCardEdit={handleCardEdit}
              onColumnCreate={handleCreateColumn}
            />
          )}
          
          {currentView === 'reports' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Project Reports</h2>
              <p className="text-gray-600">Reports functionality coming soon...</p>
            </div>
          )}
          
          {currentView === 'settings' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">Project Settings</h2>
              <p className="text-gray-600">Settings functionality coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}