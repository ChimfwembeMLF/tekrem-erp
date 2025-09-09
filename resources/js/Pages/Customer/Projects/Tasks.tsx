import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    ArrowLeft,
    Search,
    Filter,
    Calendar,
    User,
    Target,
    Clock,
    CheckCircle,
    AlertCircle,
    Pause
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date?: string;
    created_at: string;
    assignedTo?: {
        name: string;
    };
    milestone?: {
        name: string;
    };
    comments: Array<{
        id: number;
        content: string;
        user: {
            name: string;
        };
        created_at: string;
    }>;
}

interface Project {
    id: number;
    name: string;
    description: string;
}

interface Milestone {
    id: number;
    name: string;
}

interface PaginationData {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    project: Project;
    tasks: PaginationData;
    milestones: Milestone[];
    filters: {
        status?: string;
        milestone_id?: string;
    };
}

export default function Tasks({ project, tasks, milestones, filters }: Props) {
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

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        
        router.get(route('customer.projects.tasks', project.id), {
            ...filters,
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('customer.projects.tasks', project.id), {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleMilestoneFilter = (milestoneId: string) => {
        router.get(route('customer.projects.tasks', project.id), {
            ...filters,
            milestone_id: milestoneId === 'all' ? undefined : milestoneId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title={`${project.name} - Tasks`} />

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
                        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Tasks</h1>
                        <p className="text-muted-foreground">
                            View and track tasks assigned to this project
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Tasks</CardTitle>
                        <CardDescription>
                            Filter tasks by status, milestone, or search for specific tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search tasks..."
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={handleStatusFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.milestone_id || 'all'}
                                onValueChange={handleMilestoneFilter}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by milestone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Milestones</SelectItem>
                                    {milestones.map((milestone) => (
                                        <SelectItem key={milestone.id} value={milestone.id.toString()}>
                                            {milestone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tasks ({tasks.total})</CardTitle>
                        <CardDescription>
                            Tasks visible to you in this project
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.data.length > 0 ? (
                                tasks.data.map((task) => (
                                    <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold">{task.title}</h3>
                                                    <Badge variant={getStatusVariant(task.status)}>
                                                        {getStatusIcon(task.status)}
                                                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                                                    </Badge>
                                                    <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Due: {formatDate(task.due_date)}
                                                        </span>
                                                    )}
                                                    {task.assignedTo && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {task.assignedTo.name}
                                                        </span>
                                                    )}
                                                    {task.milestone && (
                                                        <span className="flex items-center gap-1">
                                                            <Target className="h-3 w-3" />
                                                            {task.milestone.name}
                                                        </span>
                                                    )}
                                                    <span>Created: {formatDate(task.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Comments */}
                                        {task.comments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="text-sm font-medium mb-2">Recent Comments</h4>
                                                <div className="space-y-2">
                                                    {task.comments.slice(0, 2).map((comment) => (
                                                        <div key={comment.id} className="text-sm">
                                                            <span className="font-medium">{comment.user.name}:</span>
                                                            <span className="ml-2 text-muted-foreground">{comment.content}</span>
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                {formatDate(comment.created_at)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                                    <p className="text-muted-foreground">
                                        {filters.status || filters.milestone_id
                                            ? "No tasks match your current filters."
                                            : "No tasks are visible to you in this project."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {tasks.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {tasks.from} to {tasks.to} of {tasks.total} tasks
                                </div>
                                <div className="flex items-center gap-2">
                                    {tasks.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
