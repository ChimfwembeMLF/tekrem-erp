import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { 
    ArrowLeft,
    Calendar,
    Target,
    CheckCircle,
    Clock,
    AlertCircle,
    Pause,
    Users
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Milestone {
    id: number;
    name: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    progress: number;
    created_at: string;
    tasks_count: number;
    completed_tasks_count: number;
    tasks: Array<{
        id: number;
        title: string;
        status: string;
        assignedTo?: {
            name: string;
        };
    }>;
}

interface Project {
    id: number;
    name: string;
    description: string;
}

interface Props {
    project: Project;
    milestones: Milestone[];
}

export default function Milestones({ project, milestones }: Props) {
    const route = useRoute();

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'secondary';
            case 'in_progress':
                return 'default';
            case 'pending':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Clock className="h-4 w-4" />;
            case 'pending':
                return <Pause className="h-4 w-4" />;
            case 'cancelled':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isOverdue = (dueDate: string, status: string) => {
        if (status === 'completed') return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <CustomerLayout>
            <Head title={`${project.name} - Milestones`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.projects.show', project.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Milestones</h1>
                        <p className="text-muted-foreground">
                            Track key project milestones and their progress
                        </p>
                    </div>
                </div>

                {/* Milestones Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{milestones.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {milestones.filter(m => m.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {milestones.filter(m => m.status === 'in_progress').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {milestones.filter(m => isOverdue(m.due_date, m.status)).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Milestones List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Milestones</CardTitle>
                        <CardDescription>
                            Key milestones and their current progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {milestones.length > 0 ? (
                                milestones.map((milestone) => (
                                    <div key={milestone.id} className="p-6 border rounded-lg">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold">{milestone.name}</h3>
                                                    <Badge variant={getStatusVariant(milestone.status)}>
                                                        {getStatusIcon(milestone.status)}
                                                        <span className="ml-1 capitalize">{milestone.status.replace('_', ' ')}</span>
                                                    </Badge>
                                                    <Badge variant={getPriorityVariant(milestone.priority)} className="text-xs">
                                                        {milestone.priority}
                                                    </Badge>
                                                    {isOverdue(milestone.due_date, milestone.status) && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground mb-4">
                                                    {milestone.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                                            </div>
                                            <Progress value={milestone.progress} className="h-2" />
                                        </div>

                                        {/* Milestone Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Due: {formatDate(milestone.due_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Target className="h-4 w-4" />
                                                <span>Tasks: {milestone.completed_tasks_count}/{milestone.tasks_count}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Created: {formatDate(milestone.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Associated Tasks */}
                                        {milestone.tasks.length > 0 && (
                                            <div className="pt-4 border-t">
                                                <h4 className="text-sm font-medium mb-3">Associated Tasks</h4>
                                                <div className="grid gap-2">
                                                    {milestone.tasks.slice(0, 5).map((task) => (
                                                        <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm">{task.title}</span>
                                                                <Badge variant={getStatusVariant(task.status)} className="text-xs">
                                                                    {task.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>
                                                            {task.assignedTo && (
                                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                    <Users className="h-3 w-3" />
                                                                    {task.assignedTo.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {milestone.tasks.length > 5 && (
                                                        <div className="text-xs text-muted-foreground text-center py-2">
                                                            +{milestone.tasks.length - 5} more tasks
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No milestones found</h3>
                                    <p className="text-muted-foreground">
                                        No milestones have been defined for this project yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
