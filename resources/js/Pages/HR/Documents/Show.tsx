import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Document {
  id: number;
  title: string;
  type: string;
  owner_name: string;
  file_url: string;
}

interface ShowDocumentProps {
  document: Document;
}

export default function ShowDocument({ document }: ShowDocumentProps) {
  const route = useRoute();
  return (
    <AppLayout title="Document Details">
      <Head title="Document Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Title:</div>
              <div>{document.title}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Type:</div>
              <div>{document.type}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Owner:</div>
              <div>{document.owner_name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">File:</div>
              <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
            </div>
            <Link href={route('hr.documents.edit', document.id)}><Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button></Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
