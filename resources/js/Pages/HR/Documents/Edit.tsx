import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input.jsx';
import { Label } from '@/Components/ui/label.jsx';
import useRoute from '@/Hooks/useRoute';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Document {
  id: number;
  title: string;
  type: string;
  owner_id: string;
}

interface EditDocumentProps {
  document: Document;
}

export default function EditDocument({ document, users = [] }) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    title: document.title || '',
    type: document.type || '',
    file_path: null as File | null,
    owner_id: document.owner_id || '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('file_path', e.target.files[0] as File);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.documents.update', document.id));
  };

  return (
    <AppLayout title="Edit Document">
      <Head title="Edit Document" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('title', e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                    placeholder="Enter document title"
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    type="text"
                    value={data.type}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('type', e.target.value)}
                    className={errors.type ? 'border-red-500' : ''}
                    placeholder="Enter document type"
                  />
                  {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_path">File *</Label>
                  <Input
                    id="file_path"
                    type="file"
                    onChange={handleFileChange}
                    className={errors.file_path ? 'border-red-500' : ''}
                  />
                  {errors.file_path && <p className="text-sm text-red-500">{errors.file_path}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_id">Owner</Label>
                  <Select value={data.owner_id} onValueChange={(value: string) => setData('owner_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.owner_id && <p className="text-sm text-red-500">{errors.owner_id}</p>}
                </div>
                <Button type="submit" disabled={processing}>Update Document</Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
