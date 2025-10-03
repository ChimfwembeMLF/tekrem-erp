import React, { useState } from 'react';
import { Clock } from 'lucide-react';

export interface CardActivity {
  id: number;
  type: string;
  user: { id: number; name: string };
  message: string;
  created_at: string;
}

interface CardActivityLogProps {
  cardId: number;
  initialActivity?: CardActivity[];
}

export function CardActivityLog({ cardId, initialActivity = [] }: CardActivityLogProps) {
  const [activity, setActivity] = useState<CardActivity[]>(initialActivity);

  // In a real app, fetch activity from API

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm text-gray-700 mb-2">Activity Log</div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {activity.length === 0 && <div className="text-xs text-gray-400">No activity yet.</div>}
        {activity.map(act => (
          <div key={act.id} className="flex items-start gap-2 bg-gray-50 rounded p-2 text-xs">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-gray-800">{act.user.name}</div>
              <div className="text-gray-700">{act.message}</div>
              <div className="text-gray-400 text-[10px] mt-1">{new Date(act.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
