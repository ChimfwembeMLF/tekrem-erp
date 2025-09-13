import React from 'react';
import { UserStory } from '@/types';

interface UserStoriesPageProps {
  userStories: UserStory[];
}

export default function UserStoriesPage({ userStories }: UserStoriesPageProps) {
  return (
    <div>
      <h1>User Stories</h1>
      <ul>
        {userStories.map(story => (
          <li key={story.id}>
            <strong>{story.title}</strong> ({story.story_points} pts) - {story.status}<br />
            {story.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
