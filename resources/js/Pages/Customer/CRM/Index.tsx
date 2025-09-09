import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
    User, 
    MessageSquare, 
    Building, 
    Phone, 
    Mail, 
    Globe, 
    MapPin,
    Calendar,
    Eye,
    Edit,
    ArrowRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    website?: string;
    industry?: string;
    status: string;
    created_at: string;
    communications_count?: number;
    projects_count?: number;
}

interface Communication {
    id: number;
    type: string;
    subject: string;
    content: string;
    created_at: string;
    user: {
        name: string;
    };
}

interface Stats {
    total_communications: number;
    recent_communications: number;
    client_status: string;
}

interface Props {
    client_profile: Client | null;
    recent_communications: Communication[];
    stats: Stats;
}

export default function Index({ client_profile, recent_communications, stats }: Props) {
    const route = useRoute();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'secondary';
            case 'inactive':
                return 'outline';
            case 'prospect':
                return 'default';
            default:
                return 'outline';
        }
    };

    const getCommunicationTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'phone':
                return <Phone className="h-4 w-4" />;
            case 'meeting':
                return <Calendar className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    return (
        <CustomerLayout>
            <Head title="My Account" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
                        <p className="text-muted-foreground">
                            View your client profile and communication history
                        </p>
                    </div>
                    {client_profile && (
                        <Link href={route('customer.crm.profile')}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <Badge variant={getStatusVariant(stats.client_status)}>
                                    {stats.client_status === 'not_registered' ? 'Not Registered' : stats.client_status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_communications}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.recent_communications}</div>
                            <p className="text-xs text-muted-foreground">Last 30 days</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Client Profile */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Client Profile
                            </CardTitle>
                            <CardDescription>Your account information and details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {client_profile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{client_profile.name}</div>
                                            <div className="text-sm text-muted-foreground">{client_profile.email}</div>
                                        </div>
                                        <Badge variant={getStatusVariant(client_profile.status)}>
                                            {client_profile.status}
                                        </Badge>
                                    </div>

                                    {client_profile.company && (
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client_profile.company}</span>
                                        </div>
                                    )}

                                    {client_profile.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client_profile.phone}</span>
                                        </div>
                                    )}

                                    {client_profile.website && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a href={client_profile.website} target="_blank" rel="noopener noreferrer" 
                                               className="text-sm text-blue-600 hover:underline">
                                                {client_profile.website}
                                            </a>
                                        </div>
                                    )}

                                    {client_profile.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{client_profile.address}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <span className="text-sm text-muted-foreground">
                                            Client since {formatDate(client_profile.created_at)}
                                        </span>
                                        <Link href={route('customer.crm.profile')}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Full Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <User className="mx-auto h-8 w-8 mb-2" />
                                    <p>No client profile found</p>
                                    <p className="text-sm">Contact support if you believe this is an error</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Communications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Recent Communications
                            </CardTitle>
                            <CardDescription>Your latest communication history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_communications.length > 0 ? (
                                    recent_communications.map((communication) => (
                                        <div key={communication.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary rounded-lg">
                                                    {getCommunicationTypeIcon(communication.type)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{communication.subject}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        by {communication.user.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(communication.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={route('customer.crm.communications.show', communication.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                                        <p>No communications yet</p>
                                    </div>
                                )}
                            </div>
                            {recent_communications.length > 0 && (
                                <div className="text-center mt-4">
                                    <Link href={route('customer.crm.communications')}>
                                        <Button variant="outline" size="sm">
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            View All Communications
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
