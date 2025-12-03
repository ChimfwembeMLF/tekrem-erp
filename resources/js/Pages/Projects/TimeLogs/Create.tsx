import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import useRoute from '@/Hooks/useRoute';
import { ArrowLeft } from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
}

interface CreateTimeLogProps {
  project: Project;
  milestones: Milestone[];
  users: User[];
}

export default function CreateTimeLog({ project, milestones, users }: CreateTimeLogProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    description: '',
    hours: '',
    log_date: new Date().toISOString().split('T')[0],
    milestone_id: '',
    user_id: '',
    is_billable: true,
    hourly_rate: '',
    status: 'pending',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('projects.time-logs.store', project.id));
  };

  return (
    <AppLayout
      title={`Add Time Log - ${project.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl text-foreground leading-tight">
              Add Time Log
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Log time spent on {project.name}
            </p>
          </div>
          <Link href={route('projects.show', project.id)}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title={`Add Time Log - ${project.name}`} />

      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Time Log Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User */}
              <div className="space-y-2">
                <Label htmlFor="user_id">
                  Team Member <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={data.user_id}
                  onValueChange={(value) => setData('user_id', value)}
                >
                  <SelectTrigger id="user_id">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.user_id && (
                  <p className="text-sm text-destructive">{errors.user_id}</p>
                )}
              </div>

              {/* Log Date */}
              <div className="space-y-2">
                <Label htmlFor="log_date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="log_date"
                  type="date"
                  value={data.log_date}
                  onChange={(e) => setData('log_date', e.target.value)}
                />
                {errors.log_date && (
                  <p className="text-sm text-destructive">{errors.log_date}</p>
                )}
              </div>

              {/* Hours */}
              <div className="space-y-2">
                <Label htmlFor="hours">
                  Hours <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  min="0.1"
                  max="24"
                  placeholder="e.g., 8.5"
                  value={data.hours}
                  onChange={(e) => setData('hours', e.target.value)}
                />
                {errors.hours && (
                  <p className="text-sm text-destructive">{errors.hours}</p>
                )}
              </div>

              {/* Milestone (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="milestone_id">Milestone (Optional)</Label>
                <Select
                  value={data.milestone_id}
                  onValueChange={(value) => setData('milestone_id', value)}
                >
                  <SelectTrigger id="milestone_id">
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id.toString()}>
                        {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.milestone_id && (
                  <p className="text-sm text-destructive">{errors.milestone_id}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work done..."
                  rows={4}
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Is Billable */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_billable"
                  checked={data.is_billable}
                  onCheckedChange={(checked) => setData('is_billable', checked as boolean)}
                />
                <Label htmlFor="is_billable" className="cursor-pointer">
                  Billable
                </Label>
              </div>

              {/* Hourly Rate (if billable) */}
              {data.is_billable && (
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 50.00"
                    value={data.hourly_rate}
                    onChange={(e) => setData('hourly_rate', e.target.value)}
                  />
                  {errors.hourly_rate && (
                    <p className="text-sm text-destructive">{errors.hourly_rate}</p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={data.status}
                  onValueChange={(value) => setData('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Time Log'}
                </Button>
                <Link href={route('projects.show', project.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
