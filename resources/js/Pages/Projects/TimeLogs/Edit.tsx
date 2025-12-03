import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Project, ProjectTimeLog, User } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
    project: Project;
    timeLog: ProjectTimeLog;
    milestones: { id: number; name: string }[];
    users: User[];
}

export default function Edit({ project, timeLog, milestones, users }: Props) {
    const route = useRoute();
    const { data, setData, put, processing, errors } = useForm({
        user_id: timeLog.user_id.toString(),
        log_date: timeLog.log_date || new Date().toISOString().split('T')[0],
        hours: timeLog.hours.toString(),
        milestone_id: timeLog.milestone_id?.toString() || '',
        description: timeLog.description || '',
        is_billable: timeLog.is_billable || false,
        hourly_rate: timeLog.hourly_rate?.toString() || '',
        status: timeLog.status || 'draft',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('projects.time-logs.update', [project.id, timeLog.id]));
    };

    return (
        <AppLayout title={`Edit Time Log - ${project.name}`}>

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href={route('projects.time-logs.index', project.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Time Logs
                            </Button>
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Time Log</CardTitle>
                            <CardDescription>
                                Update time log entry for {project.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* User Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">
                                        User <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.user_id}
                                        onValueChange={(value) => setData('user_id', value)}
                                    >
                                        <SelectTrigger id="user_id">
                                            <SelectValue placeholder="Select user" />
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
                                        <p className="text-sm text-red-600">{errors.user_id}</p>
                                    )}
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="log_date">
                                        Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="log_date"
                                        type="date"
                                        value={data.log_date}
                                        onChange={(e) => setData('log_date', e.target.value)}
                                        required
                                    />
                                    {errors.log_date && (
                                        <p className="text-sm text-red-600">{errors.log_date}</p>
                                    )}
                                </div>

                                {/* Hours */}
                                <div className="space-y-2">
                                    <Label htmlFor="hours">
                                        Hours <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="hours"
                                        type="number"
                                        step="0.1"
                                        min="0.1"
                                        max="24"
                                        value={data.hours}
                                        onChange={(e) => setData('hours', e.target.value)}
                                        placeholder="e.g., 2.5"
                                        required
                                    />
                                    {errors.hours && (
                                        <p className="text-sm text-red-600">{errors.hours}</p>
                                    )}
                                </div>

                                {/* Milestone */}
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
                                            <SelectItem value="no">No milestone</SelectItem>
                                            {milestones.map((milestone) => (
                                                <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                                    {milestone.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.milestone_id && (
                                        <p className="text-sm text-red-600">{errors.milestone_id}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="What did you work on?"
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Billable */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_billable"
                                        checked={data.is_billable}
                                        onCheckedChange={(checked) =>
                                            setData('is_billable', checked as boolean)
                                        }
                                    />
                                    <Label htmlFor="is_billable" className="cursor-pointer font-normal">
                                        This time is billable
                                    </Label>
                                </div>

                                {/* Hourly Rate (only if billable) */}
                                {data.is_billable && (
                                    <div className="space-y-2">
                                        <Label htmlFor="hourly_rate">Hourly Rate</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                            <Input
                                                id="hourly_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.hourly_rate}
                                                onChange={(e) => setData('hourly_rate', e.target.value)}
                                                placeholder="0.00"
                                                className="pl-7"
                                            />
                                        </div>
                                        {errors.hourly_rate && (
                                            <p className="text-sm text-red-600">{errors.hourly_rate}</p>
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
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="submitted">Submitted</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>

                                {/* Calculated Amount */}
                                {data.is_billable && data.hourly_rate && data.hours && (
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">
                                                Total Amount:
                                            </span>
                                            <span className="text-lg font-bold text-gray-900">
                                                ${(parseFloat(data.hours) * parseFloat(data.hourly_rate)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex justify-end gap-4">
                                    <Link href={route('projects.time-logs.index', project.id)}>
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Updating...' : 'Update Time Log'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
