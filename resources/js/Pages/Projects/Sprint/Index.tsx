import React from 'react';
import { Sprint } from '@/types';

interface SprintsPageProps {
  sprints: Sprint[];
}

export default function SprintsPage({ sprints }: SprintsPageProps) {
  return (
    <div>
      <h1>Sprints</h1>
      <ul>
        {sprints.map(sprint => (
          <li key={sprint.id}>
            <strong>{sprint.name}</strong> ({sprint.start_date} - {sprint.end_date})<br />
            Goal: {sprint.goal}
          </li>
        ))}
      </ul>
    </div>
  );
}
