import React from 'react';
import { Epic } from '@/types';

interface EpicsPageProps {
  epics: Epic[];
}

export default function EpicsPage({ epics }: EpicsPageProps) {
  return (
    <div>
      <h1>Epics</h1>
      <ul>
        {epics.map(epic => (
          <li key={epic.id}>
            <strong>{epic.title}</strong><br />
            {epic.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
