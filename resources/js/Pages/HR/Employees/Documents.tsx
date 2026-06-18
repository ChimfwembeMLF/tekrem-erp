import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';
import { ArrowLeft, FileText } from 'lucide-react';

interface Document {
  title: string;
  file_path: string;
  uploaded_at: string;
}

interface Employee {
  id: number;
  employee_id: string;
  user: { name: string };
}

interface Props {
  employee: Employee;
  documents: Document[];
}

export default function Documents({ employee, documents }: Props) {
  const route = useRoute();
  const { data, setData, post, processing, reset } = useForm<{ title: string; file: File | null }>({
    title: '',
    file: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.employees.documents.upload', employee.id), {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout title="Employee Documents">
      <Head title="Employee Documents" />
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Link href={route('hr.employees.show', employee.id)}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Documents</h1>
            <p className="text-muted-foreground">{employee.user.name} ({employee.employee_id})</p>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input type="file" onChange={(e) => setData('file', e.target.files?.[0] ?? null)} required />
              </div>
              <Button type="submit" disabled={processing}>Upload</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Uploaded Files</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-muted-foreground">No documents uploaded yet.</p>
            ) : documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-xs text-muted-foreground">{doc.uploaded_at}</div>
                  </div>
                </div>
                <a href={`/storage/${doc.file_path}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">View</Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
