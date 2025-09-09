import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Separator } from '@/Components/ui/separator';
import { 
    User, 
    Building, 
    Phone, 
    Mail, 
    Globe, 
    MapPin,
    Calendar,
    ArrowLeft,
    Save,
    Edit
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
    notes?: string;
    created_at: string;
    updated_at: string;
    communications_count?: number;
    projects_count?: number;
}

interface Props {
    client: Client | null;
    message?: string;
}

export default function Profile({ client, message }: Props) {
    const route = useRoute();

    const { data, setData, put, processing, errors } = useForm({
        phone: client?.phone || '',
        company: client?.company || '',
        address: client?.address || '',
        website: client?.website || '',
        industry: client?.industry || '',
        notes: client?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('customer.crm.profile.update'));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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

    if (!client) {
        return (
            <CustomerLayout>
                <Head title="Client Profile" />
                
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.crm.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Account
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Client Profile</h1>
                        </div>
                    </div>

                    <Card>
                        <CardContent className="text-center py-8">
                            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Client Profile Found</h3>
                            <p className="text-muted-foreground mb-4">
                                {message || 'No client profile found. Please contact support if you believe this is an error.'}
                            </p>
                            <Button asChild>
                                <Link href={route('customer.communications.create')}>
                                    Contact Support
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <Head title="Client Profile" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('customer.crm.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Account
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Client Profile</h1>
                            <p className="text-muted-foreground">
                                View and update your client information
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-8 w-8" />
                                </div>
                                <h3 className="font-medium">{client.name}</h3>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                                <Badge variant={getStatusVariant(client.status)} className="mt-2">
                                    {client.status}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Client Since</span>
                                    <span className="text-sm">{formatDate(client.created_at)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <span className="text-sm">{formatDate(client.updated_at)}</span>
                                </div>
                                {client.communications_count !== undefined && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Communications</span>
                                        <span className="text-sm">{client.communications_count}</span>
                                    </div>
                                )}
                                {client.projects_count !== undefined && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Projects</span>
                                        <span className="text-sm">{client.projects_count}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editable Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Edit className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                                <CardDescription>
                                    Update your contact details and company information
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    className="pl-10"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="company">Company</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="company"
                                                    value={data.company}
                                                    onChange={(e) => setData('company', e.target.value)}
                                                    className="pl-10"
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                            {errors.company && <p className="text-sm text-red-600 mt-1">{errors.company}</p>}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="website">Website</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="website"
                                                    type="url"
                                                    value={data.website}
                                                    onChange={(e) => setData('website', e.target.value)}
                                                    className="pl-10"
                                                    placeholder="https://example.com"
                                                />
                                            </div>
                                            {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="industry">Industry</Label>
                                            <Input
                                                id="industry"
                                                value={data.industry}
                                                onChange={(e) => setData('industry', e.target.value)}
                                                placeholder="Enter industry"
                                            />
                                            {errors.industry && <p className="text-sm text-red-600 mt-1">{errors.industry}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="address">Address</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Textarea
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="pl-10"
                                                placeholder="Enter full address"
                                                rows={3}
                                            />
                                        </div>
                                        {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Additional Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Any additional information..."
                                            rows={4}
                                        />
                                        {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={processing}>
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
