import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';


const InstagramHashtags = ({ hashtags = [] }) => (
  <AppLayout title="Instagram Hashtags">
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Instagram Hashtags</CardTitle>
        </CardHeader>
        <CardContent>
          {hashtags.length === 0 ? (
            <p className="text-muted-foreground">No hashtags found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hashtags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>{tag.name}</TableCell>
                    <TableCell>{tag.id}</TableCell>
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

export default InstagramHashtags;
