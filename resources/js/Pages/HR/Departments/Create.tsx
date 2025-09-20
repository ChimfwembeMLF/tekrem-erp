import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface ParentDepartment {
  id: number;
  name: string;
}

interface Manager {
  id: number;
  name: string;
}

interface CreateDepartmentProps {
  parentDepartments: ParentDepartment[];
  managers: Manager[];
}

export default function CreateDepartment({ parentDepartments = [], managers = [] }: CreateDepartmentProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    code: '',
    description: '',
    manager_id: '',
    parent_department_id: '',
    location: '',
    budget: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.departments.store'));
  };

  return (
    <AppLayout
      title="Add Department"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('hr.departments.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Add Department
          </h2>
        </div>
      )}
    >
      <Head title="Add Department" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input id="code" value={data.code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('code', e.target.value)} className={errors.code ? 'border-red-500' : ''} />
                  {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={data.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)} className={errors.description ? 'border-red-500' : ''} />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manager_id">Manager</Label>
                  <Select value={data.manager_id} onValueChange={(value: string) => setData('manager_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {managers.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.manager_id && <p className="text-sm text-red-500">{errors.manager_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_department_id">Parent Department</Label>
                  <Select value={data.parent_department_id} onValueChange={(value: string) => setData('parent_department_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentDepartments.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.parent_department_id && <p className="text-sm text-red-500">{errors.parent_department_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={data.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('location', e.target.value)} className={errors.location ? 'border-red-500' : ''} />
                  {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" type="number" value={data.budget} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('budget', e.target.value)} className={errors.budget ? 'border-red-500' : ''} />
                  {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="is_active" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href={route('hr.departments.index')}>Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Saving...' : 'Save Department'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
