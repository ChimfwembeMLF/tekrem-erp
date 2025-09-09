import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { 
    User, 
    Calendar, 
    Clock, 
    GraduationCap, 
    Building, 
    Mail, 
    Phone,
    MapPin,
    Users,
    TrendingUp,
    Award,
    CheckCircle,
    AlertCircle,
    Eye
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Employee {
    id: number;
    employee_id: string;
    job_title: string;
    employment_type: string;
    employment_status: string;
    hire_date: string;
    phone?: string;
    work_location?: string;
    years_of_service: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    department: {
        id: number;
        name: string;
        location?: string;
    } | null;
    manager: {
        user: {
            name: string;
            email: string;
        };
    } | null;
}

interface Leave {
    id: number;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: string;
    leave_type: {
        name: string;
        color: string;
    };
}

interface Training {
    id: number;
    status: string;
    enrolled_at: string;
    completed_at?: string;
    training: {
        title: string;
        type: string;
        duration: number;
    };
}

interface Stats {
    leave_balance: {
        entitlement: number;
        used: number;
        pending: number;
        remaining: number;
    };
    pending_leaves: number;
    attendance_rate: number;
    completed_trainings: number;
    years_of_service: number;
}

interface Props {
    employee: Employee | null;
    stats?: Stats;
    recent_leaves?: Leave[];
    recent_trainings?: Training[];
    message?: string;
}

export default function Index({ employee, stats, recent_leaves, recent_trainings, message }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case 'in_progress':
                return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (!employee) {
        return (
            <CustomerLayout>
                <Head title="HR Portal" />
                
                <div className="space-y-6">
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Employee Profile</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {message || 'You are not registered as an employee in our HR system.'}
                        </p>
                        <div className="mt-6">
                            <p className="text-sm text-muted-foreground">
                                If you believe this is an error, please contact HR or your system administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <Head title="HR Portal" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">HR Portal</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {employee.user.name}
                        </p>
                    </div>
                    <Link href={route('customer.hr.profile')}>
                        <Button>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.leave_balance.remaining}</div>
                                <p className="text-xs text-muted-foreground">
                                    of {stats.leave_balance.entitlement} days remaining
                                </p>
                                <Progress 
                                    value={(stats.leave_balance.used / stats.leave_balance.entitlement) * 100} 
                                    className="mt-2"
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.attendance_rate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    This month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completed Trainings</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.completed_trainings}</div>
                                <p className="text-xs text-muted-foreground">
                                    Total completed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Years of Service</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.years_of_service}</div>
                                <p className="text-xs text-muted-foreground">
                                    Since {formatDate(employee.hire_date)}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Employee Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Employee Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="font-medium">{employee.user.name}</div>
                                    <div className="text-sm text-muted-foreground">{employee.job_title}</div>
                                    <div className="text-xs text-muted-foreground">ID: {employee.employee_id}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{employee.user.email}</span>
                                </div>
                                {employee.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.phone}</span>
                                    </div>
                                )}
                                {employee.department && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.department.name}</span>
                                    </div>
                                )}
                                {employee.work_location && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{employee.work_location}</span>
                                    </div>
                                )}
                            </div>

                            {employee.manager && (
                                <div className="pt-2 border-t">
                                    <div className="text-sm font-medium text-muted-foreground">Reports to</div>
                                    <div className="text-sm">{employee.manager.user.name}</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Access your HR information and services</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href={route('customer.hr.leaves')}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    View Leave History
                                    {stats && stats.pending_leaves > 0 && (
                                        <Badge variant="secondary" className="ml-auto">
                                            {stats.pending_leaves} pending
                                        </Badge>
                                    )}
                                </Button>
                            </Link>
                            
                            <Link href={route('customer.hr.attendance')}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Attendance Records
                                </Button>
                            </Link>
                            
                            <Link href={route('customer.hr.trainings')}>
                                <Button variant="outline" className="w-full justify-start">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Training & Development
                                </Button>
                            </Link>
                            
                            <Link href={route('customer.hr.team')}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="mr-2 h-4 w-4" />
                                    Team Directory
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Leave Requests */}
                    {recent_leaves && recent_leaves.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Leave Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recent_leaves.map((leave) => (
                                        <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium text-sm">{leave.leave_type.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {leave.days_requested} days
                                                </div>
                                            </div>
                                            {getStatusBadge(leave.status)}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link href={route('customer.hr.leaves')}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Leave Requests
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Trainings */}
                    {recent_trainings && recent_trainings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Recent Trainings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recent_trainings.map((training) => (
                                        <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium text-sm">{training.training.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {training.training.type} • {training.training.duration} hours
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Enrolled: {formatDate(training.enrolled_at)}
                                                </div>
                                            </div>
                                            {getStatusBadge(training.status)}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link href={route('customer.hr.trainings')}>
                                        <Button variant="outline" size="sm" className="w-full">
                                            View All Trainings
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
