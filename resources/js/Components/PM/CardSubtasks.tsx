import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { CheckCircle, Circle, X } from 'lucide-react';

export interface CardSubtask {
  id: number;
  content: string;
  completed: boolean;
}

interface CardSubtasksProps {
  cardId: number;
  initialSubtasks?: CardSubtask[];
}

export function CardSubtasks({ cardId, initialSubtasks = [] }: CardSubtasksProps) {
  const [subtasks, setSubtasks] = useState<CardSubtask[]>(initialSubtasks);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: Date.now(), content: newSubtask, completed: false },
    ]);
    setNewSubtask('');
  };

  const handleToggle = (id: number) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const handleRemove = (id: number) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const completedCount = subtasks.filter(st => st.completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-100">Subtasks</span>
        <span className="text-xs text-gray-500 dark:text-gray-300">{completedCount}/{subtasks.length} complete</span>
      </div>
      <div className="space-y-2">
        {subtasks.length === 0 && <div className="text-xs text-gray-400 dark:text-gray-300">No subtasks yet.</div>}
        {subtasks.map(st => (
          <div key={st.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
            <button onClick={() => handleToggle(st.id)} className="focus:outline-none">
              {st.completed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-gray-400 dark:text-gray-300" />}
            </button>
            <span className={st.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'dark:text-gray-100'}>{st.content}</span>
            <Button size="icon" variant="ghost" onClick={() => handleRemove(st.id)} className="ml-auto">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={newSubtask}
          onChange={e => setNewSubtask(e.target.value)}
          placeholder="Add a subtask..."
          className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          onKeyDown={e => { if (e.key === 'Enter') handleAddSubtask(); }}
        />
        <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}
