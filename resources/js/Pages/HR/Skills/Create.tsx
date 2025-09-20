import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import useRoute from '@/Hooks/useRoute';

export default function CreateSkill() {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    level: '',
    employee_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.skills.store'));
  };

  return (
    <AppLayout title="Add Skill">
      <Head title="Add Skill" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Skill Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                  placeholder="e.g. JavaScript"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="text"
                  value={data.level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('level', e.target.value)}
                  className={errors.level ? 'border-red-500' : ''}
                  placeholder="e.g. Intermediate"
                />
                {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  type="text"
                  value={data.employee_id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('employee_id', e.target.value)}
                  className={errors.employee_id ? 'border-red-500' : ''}
                  placeholder="e.g. 123"
                />
                {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
              </div>
              <Button type="submit" disabled={processing}>Save Skill</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
