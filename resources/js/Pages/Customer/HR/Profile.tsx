import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    User, 
    Building, 
    Phone, 
    Mail, 
    MapPin,
    Calendar,
    ArrowLeft,
    Briefcase,
    Clock,
    Award,
    Users,
    CreditCard,
    FileText
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Employee {
    id: number;
    employee_id: string;
    job_title: string;
    employment_type: string;
    employment_status: string;
    hire_date: string;
    probation_end_date?: string;
    phone?: string;
    work_location?: string;
    salary?: number;
    salary_currency?: string;
    pay_frequency?: string;
    date_of_birth?: string;
    gender?: string;
    marital_status?: string;
    address?: string;
    national_id?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    skills?: string[];
    certifications?: string[];
    years_of_service: number;
    age?: number;
    is_on_probation: boolean;
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
    subordinates?: Array<{
        user: {
            name: string;
            email: string;
        };
        job_title: string;
    }>;
}

interface Props {
    employee: Employee | null;
    message?: string;
}

export default function Profile({ employee, message }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getEmploymentStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'inactive':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'terminated':
                return <Badge variant="destructive">Terminated</Badge>;
            case 'on_leave':
                return <Badge variant="outline">On Leave</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getEmploymentTypeBadge = (type: string) => {
        switch (type) {
            case 'full_time':
                return <Badge variant="default">Full Time</Badge>;
            case 'part_time':
                return <Badge variant="secondary">Part Time</Badge>;
            case 'contract':
                return <Badge variant="outline">Contract</Badge>;
            case 'intern':
                return <Badge variant="outline">Intern</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    if (!employee) {
        return (
            <CustomerLayout>
                <Head title="Employee Profile" />
                
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.hr.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to HR Portal
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Employee Profile</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {message || 'Employee profile not found.'}
                        </p>
                    </div>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <Head title="Employee Profile" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href={route('customer.hr.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to HR Portal
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employee Profile</h1>
                        <p className="text-muted-foreground">
                            View your employment information and details
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Profile Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{employee.user.name}</h3>
                                        <p className="text-muted-foreground">{employee.job_title}</p>
                                        <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Email</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{employee.user.email}</span>
                                        </div>
                                    </div>

                                    {employee.phone && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.phone}</span>
                                            </div>
                                        </div>
                                    )}

                                    {employee.date_of_birth && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{formatDate(employee.date_of_birth)}</span>
                                                {employee.age && (
                                                    <span className="text-xs text-muted-foreground">({employee.age} years old)</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {employee.address && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Address</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.address}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Employment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Employment Status</div>
                                        <div className="mt-1">
                                            {getEmploymentStatusBadge(employee.employment_status)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Employment Type</div>
                                        <div className="mt-1">
                                            {getEmploymentTypeBadge(employee.employment_type)}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Hire Date</div>
                                        <div className="text-sm mt-1">{formatDate(employee.hire_date)}</div>
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Years of Service</div>
                                        <div className="text-sm mt-1">{employee.years_of_service} years</div>
                                    </div>

                                    {employee.department && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Department</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.department.name}</span>
                                            </div>
                                        </div>
                                    )}

                                    {employee.work_location && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Work Location</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{employee.work_location}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {employee.is_on_probation && employee.probation_end_date && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm font-medium text-yellow-800">Probation Period</span>
                                        </div>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Probation ends on {formatDate(employee.probation_end_date)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills and Certifications */}
                        {(employee.skills && employee.skills.length > 0) || (employee.certifications && employee.certifications.length > 0) ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Skills & Certifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {employee.skills && employee.skills.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">Skills</div>
                                            <div className="flex flex-wrap gap-2">
                                                {employee.skills.map((skill, index) => (
                                                    <Badge key={index} variant="secondary">{skill}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {employee.certifications && employee.certifications.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground mb-2">Certifications</div>
                                            <div className="flex flex-wrap gap-2">
                                                {employee.certifications.map((cert, index) => (
                                                    <Badge key={index} variant="outline">{cert}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Manager Information */}
                        {employee.manager && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Reports To
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{employee.manager.user.name}</div>
                                            <div className="text-sm text-muted-foreground">{employee.manager.user.email}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Team Members */}
                        {employee.subordinates && employee.subordinates.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Team Members
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {employee.subordinates.map((subordinate, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{subordinate.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{subordinate.job_title}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Emergency Contact */}
                        {employee.emergency_contact_name && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Emergency Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="font-medium text-sm">{employee.emergency_contact_name}</div>
                                            {employee.emergency_contact_relationship && (
                                                <div className="text-xs text-muted-foreground">{employee.emergency_contact_relationship}</div>
                                            )}
                                        </div>
                                        {employee.emergency_contact_phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span>{employee.emergency_contact_phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={route('customer.hr.leaves')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Leave History
                                    </Button>
                                </Link>
                                
                                <Link href={route('customer.hr.attendance')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Attendance
                                    </Button>
                                </Link>
                                
                                <Link href={route('customer.hr.team')}>
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Users className="h-4 w-4 mr-2" />
                                        Team Directory
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
