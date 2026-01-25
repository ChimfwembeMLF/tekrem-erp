import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Company {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    slug: string;
    package_name?: string;
}

interface Props {
    companies: Company[];
}

export default function CompaniesIndex({ companies }: Props) {
    const route = useRoute();
    return (
        <AppLayout title="Company Management">
            <Head title="Companies" />
            <div className="py-12">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Companies
                                <Link href={route('admin.companies.create')} className="ml-auto">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Company
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Package</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                        <TableHead>Landing</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {companies.map(company => (
                                        <TableRow key={company.id}>
                                            <TableCell>{company.name}</TableCell>
                                            <TableCell>{company.email}</TableCell>
                                            <TableCell>{company.phone}</TableCell>
                                            <TableCell>{company.package_name || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('admin.companies.edit', company.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="sm" className="ml-2" onClick={() => router.delete(route('admin.companies.destroy', company.id))}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <a href={`/company/${company.slug}`} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="secondary" size="sm">Landing Page</Button>
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
