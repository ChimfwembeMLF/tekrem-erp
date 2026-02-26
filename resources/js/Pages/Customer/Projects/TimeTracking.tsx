import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { 
    ArrowLeft,
    Clock,
    Calendar,
    User,
    Target,
    DollarSign,
    FileText
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TimeEntry {
    id: number;
    description: string;
    hours: number;
    date: string;
    hourly_rate?: number;
    amount?: number;
    is_billable: boolean;
    user: {
        id: number;
        name: string;
    };
    task?: {
        id: number;
        title: string;
    };
}

interface Project {
    id: number;
    name: string;
    description: string;
}

interface UserSummary {
    user_id: number;
    user_name: string;
    total_hours: number;
    total_amount: number;
}

interface Props {
    project: Project;
    timeEntries: TimeEntry[];
    totalHours: number;
    totalAmount: number;
    userSummary: UserSummary[];
    filters: {
        start_date?: string;
        end_date?: string;
    };
}

export default function TimeTracking({ project, timeEntries, totalHours, totalAmount, userSummary, filters }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl\.NumberFormat\('en-ZM', {
            style: 'currency',
            currency: 'ZMW',
        }).format(amount);
    };

    const handleDateFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const startDate = formData.get('start_date') as string;
        const endDate = formData.get('end_date') as string;
        
        router.get(route('customer.projects.time-tracking', project.id), {
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        router.get(route('customer.projects.time-tracking', project.id), {}, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title={`${project.name} - Time Tracking`} />

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
                        <h1 className="text-3xl font-bold tracking-tight">{project.name} - Time Tracking</h1>
                        <p className="text-muted-foreground">
                            View billable time entries and project costs
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                            <p className="text-xs text-muted-foreground">
                                Billable time logged
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                            <p className="text-xs text-muted-foreground">
                                Total billable amount
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userSummary.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Contributors
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Date Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter by Date Range</CardTitle>
                        <CardDescription>
                            Filter time entries by specific date range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDateFilter} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    defaultValue={filters.start_date}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    defaultValue={filters.end_date}
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <Button type="submit">Apply Filter</Button>
                                {(filters.start_date || filters.end_date) && (
                                    <Button type="button" variant="outline" onClick={clearFilters}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Time Entries */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Time Entries</CardTitle>
                                <CardDescription>
                                    Detailed breakdown of billable time entries
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {timeEntries.length > 0 ? (
                                        timeEntries.map((entry) => (
                                            <div key={entry.id} className="p-4 border rounded-lg">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h4 className="font-medium">{entry.hours}h</h4>
                                                            {entry.amount && (
                                                                <Badge variant="secondary">
                                                                    {formatCurrency(entry.amount)}
                                                                </Badge>
                                                            )}
                                                            <Badge variant={entry.is_billable ? "default" : "outline"}>
                                                                {entry.is_billable ? "Billable" : "Non-billable"}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-3">
                                                            {entry.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(entry.date)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {entry.user.name}
                                                            </span>
                                                            {entry.task && (
                                                                <span className="flex items-center gap-1">
                                                                    <Target className="h-3 w-3" />
                                                                    {entry.task.title}
                                                                </span>
                                                            )}
                                                            {entry.hourly_rate && (
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="h-3 w-3" />
                                                                    {formatCurrency(entry.hourly_rate)}/hr
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
                                            <p className="text-muted-foreground">
                                                {filters.start_date || filters.end_date
                                                    ? "No time entries match your current date filter."
                                                    : "No billable time has been logged for this project yet."
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Summary */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Summary</CardTitle>
                                <CardDescription>
                                    Time breakdown by team member
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {userSummary.length > 0 ? (
                                        userSummary.map((user) => (
                                            <div key={user.user_id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{user.user_name}</h4>
                                                    <Badge variant="outline">{user.total_hours.toFixed(1)}h</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Total: {formatCurrency(user.total_amount)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                No team members have logged time
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
