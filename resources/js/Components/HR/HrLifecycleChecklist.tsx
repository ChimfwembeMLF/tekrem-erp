import React from 'react';
import { router } from '@inertiajs/react';
import { Progress } from '@/Components/ui/progress';
import { CheckCircle2 } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface HrLifecycleChecklistProps {
  items: ChecklistItem[];
  updateUrl: string;
  readOnly?: boolean;
}

export default function HrLifecycleChecklist({ items, updateUrl, readOnly }: HrLifecycleChecklistProps) {
  const completed = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const toggle = (id: string) => {
    if (readOnly) return;
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    router.patch(updateUrl, { checklist: updated }, { preserveScroll: true });
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Checklist</h3>
            <p className="text-sm text-muted-foreground">
              {completed} of {items.length} complete
            </p>
          </div>
          {progress === 100 && (
            <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </div>
          )}
        </div>
        <Progress value={progress} className="mt-3 h-2" />
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggle(item.id)}
              disabled={readOnly}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span
              className={
                item.completed
                  ? 'text-sm text-muted-foreground line-through'
                  : 'text-sm text-foreground'
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
