import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

const FacebookSyncPages = ({ onSync }) => {
  const [status, setStatus] = useState('');

  const handleSync = () => {
    setStatus('');
    if (onSync) {
      onSync();
    }
    // TODO: Integrate with backend
    setStatus('Pages synced (mock)');
  };

  return (
    <AppLayout title="Sync Facebook Pages">
      <div className="space-y-6 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sync Facebook Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSync}>Sync Now</Button>
            {status && <div className="text-green-600 text-sm mt-2">{status}</div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default FacebookSyncPages;
