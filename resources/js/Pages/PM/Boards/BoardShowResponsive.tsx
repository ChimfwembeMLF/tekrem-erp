import React, { useState } from 'react';
import { KanbanBoard, ColumnType, CardType } from '@/Components/PM/KanbanBoard';
import { CardDetailsModal } from '@/Components/PM/CardDetailsModal';
import { router } from '@inertiajs/react';

interface BoardShowProps {
  project: any;
  board: any;
  analytics?: any;
  employees?: any[];
}

export default function BoardShowResponsive({ project, board, analytics, employees }: BoardShowProps) {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  // Convert backend data to KanbanBoard format
  const columns: ColumnType[] = board.columns.map((col: any) => ({
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
  }));

  // Card move handler
  const handleCardMove = (cardId: number, fromColumnId: number, toColumnId: number, newIndex: number) => {
    router.post(`/pm/cards/${cardId}/move`, {
      column_id: toColumnId,
      position: newIndex,
    }, {
      preserveScroll: true,
    });
  };

  // Column move handler
  const handleColumnMove = (columnId: number, newIndex: number) => {
    router.post(`/pm/columns/${columnId}/reorder`, {
      position: newIndex,
    }, {
      preserveScroll: true,
    });
  };

  // Card create handler (show input or modal)
  const handleCardCreate = (columnId: number) => {
    // Show inline input or modal for new card (implementation depends on your UI)
  };

  // Column create handler (show input or modal)
  const handleColumnCreate = () => {
    // Show inline input or modal for new column (implementation depends on your UI)
  };

  // Card edit handler (show modal)
  const handleCardEdit = (card: CardType) => {
    setSelectedCard(card);
    setCardModalOpen(true);
  };

  return (
    <div className="w-full h-full">
      <KanbanBoard
        columns={columns}
        onCardMove={handleCardMove}
        onColumnMove={handleColumnMove}
        onCardCreate={handleCardCreate}
        onCardEdit={handleCardEdit}
        onColumnCreate={handleColumnCreate}
        className="min-h-[60vh]"
      />
      <CardDetailsModal
        card={selectedCard}
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
      />
    </div>
  );
}
