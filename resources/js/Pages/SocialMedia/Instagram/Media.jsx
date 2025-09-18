import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';


const InstagramMedia = ({ media = [] }) => (
  <AppLayout title="Instagram Media">
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instagram Media</CardTitle>
        </CardHeader>
        <CardContent>
          {media.length === 0 ? (
            <p className="text-muted-foreground">No media found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caption</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Posted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {media.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.caption || 'No caption'}</TableCell>
                    <TableCell>{item.media_type || '-'}</TableCell>
                    <TableCell>{item.timestamp ? new Date(item.timestamp).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export default InstagramMedia;
