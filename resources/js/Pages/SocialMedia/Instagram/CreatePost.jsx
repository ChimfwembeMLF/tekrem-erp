import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

const InstagramCreatePost = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('');
    if (onSubmit) {
      onSubmit(content);
    }
    // TODO: Integrate with backend
    setStatus('Post created (mock)');
    setContent('');
  };

  return (
    <AppLayout title="Create Instagram Post">
      <div className="space-y-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Instagram Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Write a caption..."
                value={content}
                onChange={e => setContent(e.target.value)}
                required
              />
              <Button type="submit">Post</Button>
              {status && <div className="text-green-600 text-sm mt-2">{status}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InstagramCreatePost;
