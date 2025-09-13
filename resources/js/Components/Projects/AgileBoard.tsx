


import React from 'react';

interface UserStory {
  id: number;
  title: string;
  description?: string;
  story_points: number;
  status: 'backlog' | 'in-progress' | 'done' | 'review' | 'retrospective';
  sprint_id?: number;
  epic_id?: number;
  project_id: number;
}

interface Sprint {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  goal?: string;
  project_id: number;
  user_stories?: UserStory[];
  review_notes?: string;
  retrospective_notes?: string;
}

interface Epic {
  id: number;
  title: string;
  description?: string;
  project_id: number;
  user_stories?: UserStory[];
}

interface AgileBoardProps {
  sprints: Sprint[];
  epics: Epic[];
  userStories: UserStory[];
}

export default function AgileBoard({ sprints, epics, userStories }: AgileBoardProps) {
  // Kanban columns for user stories
  const columns = [
    { id: 'backlog', title: 'Backlog', stories: userStories.filter(s => s.status === 'backlog') },
    { id: 'in-progress', title: 'In Progress', stories: userStories.filter(s => s.status === 'in-progress') },
    { id: 'review', title: 'Sprint Review', stories: userStories.filter(s => s.status === 'review') },
    { id: 'retrospective', title: 'Retrospective', stories: userStories.filter(s => s.status === 'retrospective') },
    { id: 'done', title: 'Done', stories: userStories.filter(s => s.status === 'done') },
  ];

  // Story points summary
  const totalPoints = userStories.reduce((sum, s) => sum + s.story_points, 0);
  const completedPoints = userStories.filter(s => s.status === 'done').reduce((sum, s) => sum + s.story_points, 0);

  return (
    <div className="agile-board">
      <h1>Agile Board</h1>
      <div className="story-points-summary">
        <strong>Total Story Points:</strong> {totalPoints} | <strong>Completed:</strong> {completedPoints}
      </div>
      <div className="kanban-columns" style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        {columns.map(col => (
          <div key={col.id} style={{ flex: 1, background: '#f9f9f9', borderRadius: 8, padding: '1rem' }}>
            <h2>{col.title}</h2>
            <ul>
              {col.stories.map(story => (
                <li key={story.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', borderRadius: 4, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <strong>{story.title}</strong> ({story.story_points} pts)<br />
                  <span>{story.description}</span>
                </li>
              ))}
              {col.stories.length === 0 && <li style={{ color: '#bbb' }}>No stories</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="sprints" style={{ marginTop: '2rem' }}>
        <h2>Sprints</h2>
        <ul>
          {sprints.map(sprint => (
            <li key={sprint.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#f4f8ff', borderRadius: 8 }}>
              <strong>{sprint.name}</strong> ({sprint.start_date} - {sprint.end_date})<br />
              Goal: {sprint.goal}
              {sprint.review_notes && (
                <div><strong>Review:</strong> {sprint.review_notes}</div>
              )}
              {sprint.retrospective_notes && (
                <div><strong>Retrospective:</strong> {sprint.retrospective_notes}</div>
              )}
              <ul>
                {sprint.user_stories?.map(story => (
                  <li key={story.id}>
                    {story.title} ({story.story_points} pts)
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <div className="epics" style={{ marginTop: '2rem' }}>
        <h2>Epics</h2>
        <ul>
          {epics.map(epic => (
            <li key={epic.id} style={{ marginBottom: '1rem', padding: '1rem', background: '#fff8f4', borderRadius: 8 }}>
              <strong>{epic.title}</strong><br />
              {epic.description}
              <ul>
                {epic.user_stories?.map(story => (
                  <li key={story.id}>
                    {story.title} ({story.story_points} pts)
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
