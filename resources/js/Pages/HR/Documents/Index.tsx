import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Plus, Eye, Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Document {
  id: number;
  title: string;
  type: string;
  owner_name: string;
}

interface DocumentsIndexProps {
  documents: Document[];
}

export default function DocumentsIndex({ documents = [] }: DocumentsIndexProps) {
  const route = useRoute();
  return (
    <AppLayout title="HR Documents">
      <Head title="HR Documents" />
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">HR Documents</h1>
          <Link href={route('hr.documents.create')}><Button><Plus className="h-4 w-4 mr-2" />Add Document</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Document List</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No documents found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Owner</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-4 py-2">{doc.title}</td>
                      <td className="px-4 py-2">{doc.type}</td>
                      <td className="px-4 py-2">{doc.owner_name}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Link href={route('hr.documents.show', doc.id)}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                        <Link href={route('hr.documents.edit', doc.id)}><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
