import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

export interface CardComment {
  id: number;
  user: { id: number; name: string; avatar?: string };
  content: string;
  created_at: string;
}

interface CardCommentsProps {
  cardId: number;
  initialComments?: CardComment[];
}

export function CardComments({ cardId, initialComments = [] }: CardCommentsProps) {
  const [comments, setComments] = useState<CardComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setComments(prev => [
        ...prev,
        {
          id: Date.now(),
          user: { id: 1, name: 'You' },
          content: newComment,
          created_at: new Date().toISOString(),
        },
      ]);
      setNewComment('');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm text-gray-700 dark:text-gray-100 mb-2">Comments</div>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {comments.length === 0 && <div className="text-xs text-gray-400 dark:text-gray-300">No comments yet.</div>}
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded p-2 text-xs">
            <div className="font-medium text-gray-800 dark:text-gray-100">{comment.user.name}</div>
            <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{comment.content}</div>
            <div className="text-gray-400 dark:text-gray-300 text-[10px] mt-1">{new Date(comment.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          disabled={loading}
          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
        />
        <Button onClick={handleAddComment} disabled={loading || !newComment.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}
