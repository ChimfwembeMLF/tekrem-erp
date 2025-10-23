import React, { useState } from 'react';
import { KanbanBoard, ColumnType, CardType } from '@/Components/PM/KanbanBoard';
import { CardDetailsModal } from '@/Components/PM/CardDetailsModal';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { 
  Plus, 
  MoreHorizontal, 
  Users, 
  Settings,
  Filter,
  Search,
  Calendar,
  Flag,
  MessageSquare,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';


interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface BoardCard {
  id: number;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  story_points: number | null;
  due_date: string | null;
  assignee: User | null;
  reporter: User | null;
  labels: string[];
  comments_count: number;
  attachments_count: number;
}

interface BoardColumn {
  id: number;
  name: string;
  order: number;
  color: string | null;
  is_done_column: boolean;
  cards: BoardCard[];
}

interface Board {
  id: number;
  name: string;
  description: string | null;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
  members: Array<{
    id: number;
    user: User;
    role: string;
  }>;
  owner: User;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}



interface BoardShowProps {
  project: Project;
  board: Board;
  analytics?: any;
  employees?: any[];
}

export default function BoardShow({ project, board, analytics, employees }: BoardShowProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  // Convert backend data to KanbanBoard format
  const [columns, setColumns] = useState<ColumnType[]>(
    board.columns.map((col: any) => ({
      id: col.id,
      name: col.name,
      order: col.order,
      color: col.color,
      is_done_column: col.is_done_column,
      cards: col.cards.map((card: any) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        key: card.id,
        status: col.name,
        assignees: card.assignee ? [card.assignee.name] : [],
        tags: card.labels,
        priority: card.priority,
        story_points: card.story_points,
        due_date: card.due_date,
        epic_id: card.epic_id,
        sprint_id: card.sprint_id,
      })),
    }))
  );

  // Inline add state
  const [addingCardColumnId, setAddingCardColumnId] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [loading, setLoading] = useState(false);

  // Card move handler
  const handleCardMove = (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => {
    router.post(`/pm/cards/${cardId}/move`, {
      column_id: toColumnId,
      position: newIndex,
    }, {
      preserveScroll: true,
    });
  };

  // Column move handler (fix: use correct route and payload)
  const handleColumnMove = (_columnId: number, newIndex: number) => {
    // Reorder columns array locally
    setColumns(prevCols => {
      const newCols = [...prevCols];
      const [removed] = newCols.splice(_columnId, 1);
      newCols.splice(newIndex, 0, removed);
      // Send new order to backend
      router.post(`/pm/boards/${board.id}/reorder-columns`, {
        column_ids: newCols.map(col => col.id),
      }, {
        preserveScroll: true,
      });
      return newCols;
    });
  };

  // Inline add card handler
  const handleCardCreate = (columnId: number) => {
    setAddingCardColumnId(columnId);
    setTimeout(() => {
      const input = document.getElementById('new-card-input');
      if (input) (input as HTMLInputElement).focus();
    }, 100);
  };

  const submitNewCard = async (columnId: number) => {
    if (!newCardTitle.trim()) return;
    setLoading(true);
    router.post(
      `/pm/cards`,
      { column_id: columnId, title: newCardTitle },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewCardTitle('');
          setAddingCardColumnId(null);
          setLoading(false);
        },
        onError: () => setLoading(false),
      }
    );
  };

  // Inline add column handler
  const handleColumnCreate = () => {
    setAddingColumn(true);
    setTimeout(() => {
      const input = document.getElementById('new-column-input');
      if (input) (input as HTMLInputElement).focus();
    }, 100);
  };

  const submitNewColumn = async () => {
    if (!newColumnName.trim()) return;
    setLoading(true);
    router.post(
      `/pm/columns`,
      { board_id: board.id, name: newColumnName },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewColumnName('');
          setAddingColumn(false);
          setLoading(false);
        },
        onError: () => setLoading(false),
      }
    );
  };

  // Render prop for KanbanBoard to inject inline add UI
  const renderCardAdd = (columnId: number) =>
    addingCardColumnId === columnId ? (
      <div className="px-2 pb-2">
        <input
          id="new-card-input"
          className="w-full rounded border px-2 py-1 text-sm"
          placeholder="Enter card title..."
          value={newCardTitle}
          disabled={loading}
          onChange={e => setNewCardTitle(e.target.value)}
          onBlur={() => { setAddingCardColumnId(null); setNewCardTitle(''); }}
          onKeyDown={e => {
            if (e.key === 'Enter') submitNewCard(columnId);
            if (e.key === 'Escape') { setAddingCardColumnId(null); setNewCardTitle(''); }
          }}
        />
      </div>
    ) : null;

  const renderColumnAdd = () =>
    addingColumn ? (
      <div className="min-w-[320px] w-80">
        <input
          id="new-column-input"
          className="w-full rounded border px-2 py-2 text-sm"
          placeholder="Enter column name..."
          value={newColumnName}
          disabled={loading}
          onChange={e => setNewColumnName(e.target.value)}
          onBlur={() => { setAddingColumn(false); setNewColumnName(''); }}
          onKeyDown={e => {
            if (e.key === 'Enter') submitNewColumn();
            if (e.key === 'Escape') { setAddingColumn(false); setNewColumnName(''); }
          }}
        />
      </div>
    ) : null;

  return (
    <AppLayout title={board.name}>
      <Head title={`${board.name} - ${project.name}`} />
      {/* Board Description and Analytics can be added here as needed */}
      <div className="py-6 w-full">
        <div className="max-w-full mx-auto flex gap-4 overflow-x-auto pb-4 w-full">
          <KanbanBoard
            columns={columns}
            onCardMove={handleCardMove}
            onColumnMove={handleColumnMove}
            employees={employees}
            onCardCreate={async (columnId, data, done) => {
              // ...existing code...
            }}
            onColumnCreate={(name, done) => {
              // ...existing code...
            }}
            onCardEdit={card => {
              setSelectedCard(card);
              setCardModalOpen(true);
            }}
            // className="min-h-[60vh]"
          />
          <CardDetailsModal
            card={selectedCard}
            isOpen={cardModalOpen}
            onClose={() => setCardModalOpen(false)}
          />
          {/* Removed extra add card/column input rendering. All add UX is now inside Kanban columns. */}
        </div>
      </div>
    </AppLayout>
  );
}
