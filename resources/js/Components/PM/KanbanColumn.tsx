import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';

export type CardType = {
  id: number;
  title: string;
  description?: string;
  key: string | number;
  status?: string;
  assignees?: string[];
  tags?: string[];
  priority?: string;
  story_points?: number;
  due_date?: string;
  epic_id?: number;
  sprint_id?: number;
};

export type ColumnType = {
  id: number;
  name: string;
  order?: number;
  color?: string;
  is_done_column?: boolean;
  cards: CardType[];
};

interface KanbanColumnProps {
  column: ColumnType;
  onCardEdit?: (card: CardType) => void;
  addingCard: boolean;
  newCardTitle: string;
  loading: boolean;
  onAddCardClick: () => void;
  onAddCardChange: (v: string) => void;
  onAddCardSubmit: (data: { title: string; done: boolean; priority: string; due_date: string | null; assignee_id?: number; type?: string }) => void;
  onAddCardCancel: () => void;
  overCardId?: number | null;
  overCardPosition?: 'above' | 'below' | null;
  employees?: { id: number; name: string }[];
}

export function KanbanColumn({
  column,
  onCardEdit,
  addingCard,
  newCardTitle,
  loading,
  onAddCardClick,
  onAddCardChange,
  onAddCardSubmit,
  onAddCardCancel,
  overCardId,
  overCardPosition,
  employees = [],
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const cardIds = column.cards.map((card) => card.id);

  // Interactive add card state
  const [done, setDone] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [priority, setPriority] = useState<string>('');
  const [showDate, setShowDate] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showAssignee, setShowAssignee] = useState(false);
  const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);

  // Example priorities
  const priorities = ['low', 'medium', 'high', 'critical'];

  // Reset all fields when input closes
  React.useEffect(() => {
    if (!addingCard) {
      setDone(false);
      setPriority('');
      setDueDate(null);
  setAssigneeId(undefined);
    }
  }, [addingCard]);

  // Enhanced submit handler
  const handleSubmit = () => {
    if (loading || !newCardTitle.trim()) return;
    // Provide default values for required fields
    const cardType = 'task'; // Default type, adjust as needed
  const cardPriority = priority || 'medium'; // Default priority
    onAddCardSubmit({
      title: newCardTitle,
      done,
      priority: cardPriority,
      due_date: dueDate,
      assignee_id: assigneeId,
      type: cardType,
    });
  };

  return (
  <div className="bg-muted dark:bg-gray-900 rounded-lg min-w-[320px] w-60 flex flex-col">
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {column.color && (
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          )}
          <span className="font-semibold text-gray-700 dark:text-gray-100">{column.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {column.cards.length}
          </span>
        </div>
      </div>
      <div ref={setNodeRef} className="flex-1 px-2 py-2 space-y-3 min-h-[200px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.length === 0 && (
            <div className="text-center text-xs text-gray-400 dark:text-gray-300 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              No cards
              {/* Placement indicator for empty column */}
              {overCardId === null && overCardPosition && (
                <div className="flex items-center justify-center my-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                  <span className="flex-1 h-0.5 bg-blue-400" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-1" />
                </div>
              )}
            </div>
          )}
          {column.cards.map((card, idx) => (
            <React.Fragment key={card.id}>
              {/* Placement indicator above */}
              {overCardId === card.id && overCardPosition === 'above' && (
                <div className="flex items-center my-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                  <span className="flex-1 h-0.5 bg-blue-400" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-1" />
                </div>
              )}
              <KanbanCard
                card={card}
                onEdit={() => onCardEdit?.(card)}
              />
              {/* Placement indicator below */}
              {overCardId === card.id && overCardPosition === 'below' && (
                <div className="flex items-center my-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                  <span className="flex-1 h-0.5 bg-blue-400" />
                  <span className="w-2 h-2 bg-blue-500 rounded-full ml-1" />
                </div>
              )}
            </React.Fragment>
          ))}
        </SortableContext>
        {/* Jira-like Add Card UX at bottom */}
        <div className="mt-2">
          {addingCard ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm p-3">
              <input
                className="w-full rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                placeholder="What needs to be done?"
                value={newCardTitle}
                disabled={loading}
                autoFocus
                onChange={e => onAddCardChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSubmit();
                  if (e.key === 'Escape') onAddCardCancel();
                }}
                onBlur={onAddCardCancel}
              />
              {/* Icon row below input */}
              <div className="flex items-center gap-2 mt-2 relative">
                {/* Checkbox icon */}
                <button type="button" className={`p-1 rounded border ${done ? 'bg-primary-50 border-primary dark:bg-primary-900 dark:border-primary-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`} onClick={() => setDone(v => !v)} aria-label="Mark as done">
                  {done ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" fill="#fff" stroke="#3b82f6" strokeWidth="2"/><path d="M7 12l3 3 7-7" stroke="#3b82f6" strokeWidth="2" fill="none"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="3" fill="#fff" stroke="#bbb" strokeWidth="2"/></svg>
                  )}
                </button>
                {/* Dropdown icon for priority */}
                <div className="relative">
                  <button type="button" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700" onClick={() => setShowPriority(v => !v)} aria-label="Set priority">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 10l5 5 5-5" stroke="#888" strokeWidth="2" fill="none"/></svg>
                  </button>
                  {showPriority && (
                    <div className="absolute z-10 left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-1 w-28">
                      {priorities.map(p => (
                        <button key={p} className={`block w-full text-left px-2 py-1 text-sm rounded ${priority === p ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} onClick={() => { setPriority(p); setShowPriority(false); }}>{p}</button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Calendar icon for due date */}
                <div className="relative">
                  <button type="button" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700" onClick={() => setShowDate(v => !v)} aria-label="Set due date">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2" fill="#fff" stroke="#bbb" strokeWidth="2"/><path d="M8 3v4M16 3v4" stroke="#bbb" strokeWidth="2"/><rect x="7" y="10" width="2" height="2" fill="#bbb"/><rect x="11" y="10" width="2" height="2" fill="#bbb"/><rect x="15" y="10" width="2" height="2" fill="#bbb"/></svg>
                  </button>
                  {showDate && (
                    <div className="absolute z-10 left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-2">
                      <input type="date" className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" value={dueDate || ''} onChange={e => { setDueDate(e.target.value); setShowDate(false); }} />
                    </div>
                  )}
                </div>
                {/* User icon for assignee */}
                <div className="relative">
                  <button type="button" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700" onClick={() => setShowAssignee(v => !v)} aria-label="Set assignee">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" stroke="#bbb" strokeWidth="2" fill="#fff"/><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" stroke="#bbb" strokeWidth="2" fill="none"/></svg>
                  </button>
                  {showAssignee && (
                    <div className="absolute z-10 left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow p-1 w-32">
                      {employees.map((emp) => (
                        <button key={emp.id} className={`block w-full text-left px-2 py-1 text-sm rounded ${assigneeId === emp.id ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`} onClick={() => { setAssigneeId(emp.id); setShowAssignee(false); }}>{emp.name}</button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Send icon (submit) */}
                <button type="button" className="ml-auto p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900 border border-gray-200 dark:border-gray-700" disabled={loading || !newCardTitle.trim()} onClick={handleSubmit} aria-label="Add">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7" stroke="#3b82f6" strokeWidth="2" fill="none"/></svg>
                </button>
                {/* Cancel icon */}
                <button type="button" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700" onClick={onAddCardCancel} aria-label="Cancel">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={onAddCardClick}
            >
              <Plus className="h-4 w-4 mr-1" /> Add card
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}