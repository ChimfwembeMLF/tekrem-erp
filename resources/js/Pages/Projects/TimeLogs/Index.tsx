import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Plus, Search, Filter, Clock, DollarSign, Calendar } from 'lucide-react';
import { Project, ProjectTimeLog, User } from '@/types';
import useRoute from '@/Hooks/useRoute';

interface Props {
    project: Project;
    timeLogs: {
        data: (ProjectTimeLog & { user?: User; milestone?: { id: number; name: string } })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    users: User[];
    filters: {
        search?: string;
        status?: string;
        user_id?: number;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ project, timeLogs, users, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id?.toString() || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const route = useRoute();
    const handleFilter = () => {
        router.get(
            route('projects.time-logs.index', project.id),
            {
                search: searchTerm,
                status: selectedStatus,
                user_id: selectedUser,
                date_from: dateFrom,
                date_to: dateTo,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearchTerm('');
        setSelectedStatus('');
        setSelectedUser('');
        setDateFrom('');
        setDateTo('');
        router.get(route('projects.time-logs.index', project.id));
    };

    const getStatusBadge = (status?: string) => {
        const statusColors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };

        return (
            <Badge className={statusColors[status || 'draft'] || 'bg-gray-100 text-gray-800'}>
                {status || 'draft'}
            </Badge>
        );
    };

    const totalHours = timeLogs.data.reduce((sum, log) => sum + log.hours, 0);
    const totalBillable = timeLogs.data
        .filter((log) => log.is_billable)
        .reduce((sum, log) => sum + log.hours * (log.hourly_rate || 0), 0);

    return (
        <AppLayout
            title={`Time Logs - ${project.name}`}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-foreground leading-tight">
                            Time Logs
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                             Track time spent on {project.name}
                        </p>
                    </div>
                </div>
            )}
        >

            <div className="">
                <div className="mx-auto max-w-full sm:px-6">
                    <div className="mb-6 flex items-center justify-end">
                     
                        <Link href={route('projects.time-logs.create', project.id)}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Time Log
                            </Button>
                        </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Number(totalHours || 0)}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Across {timeLogs.total} logs
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Billable Amount</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalBillable}</div>
                                <p className="text-xs text-muted-foreground">
                                    Billable hours logged
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {timeLogs.total > 0 ? (totalHours / timeLogs.total) : 0}h
                                </div>
                                <p className="text-xs text-muted-foreground">Per time log entry</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Filter className="mr-2 h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-5">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">All Users</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Input
                                    type="date"
                                    placeholder="From"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />

                                <Input
                                    type="date"
                                    placeholder="To"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button onClick={handleFilter}>Apply Filters</Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Logs Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Milestone</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {timeLogs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                                No time logs found. Start by adding your first time log.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        timeLogs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>
                                                    {log.log_date
                                                        ? new Date(log.log_date).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>{log.user?.name || 'Unknown'}</TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {log.description || '-'}
                                                </TableCell>
                                                <TableCell>{log.milestone?.name || '-'}</TableCell>
                                                <TableCell className="text-right">{log.hours}</TableCell>
                                                <TableCell className="text-right">
                                                    {log.is_billable && log.hourly_rate
                                                        ? `$${log.hourly_rate}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {log.is_billable && log.hourly_rate
                                                        ? `$${(log.hours * log.hourly_rate)}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={route('projects.time-logs.show', [project.id, log.id])}
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={route('projects.time-logs.edit', [project.id, log.id])}
                                                        >
                                                            <Button variant="ghost" size="sm">
                                                                Edit
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {timeLogs.last_page > 1 && (
                        <div className="mt-4 flex justify-center gap-2">
                            {Array.from({ length: timeLogs.last_page }, (_, i) => i + 1).map((page) => (
                                <Link
                                    key={page}
                                    href={route('projects.time-logs.index', {
                                        ...filters,
                                        page,
                                        project: project.id,
                                    })}
                                    preserveState
                                >
                                    <Button
                                        variant={page === timeLogs.current_page ? 'default' : 'outline'}
                                        size="sm"
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
