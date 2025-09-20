
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import useRoute from '@/Hooks/useRoute';

export default function Index({ teams }) {
    const route = useRoute();
    return (
        <AppLayout title="Teams">
            <Head title="Teams" />
            <Card className="max-w-5xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Teams</CardTitle>
                    <div className="flex justify-end">
                        <Button asChild size="sm" className="ml-auto">
                            <Link href={route('hr.teams.create')}>New Team</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Members</TableHead>
                                <TableHead>Lead</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teams.map(team => (
                                <TableRow key={team.id}>
                                    <TableCell>{team.name}</TableCell>
                                    <TableCell>{team.description}</TableCell>
                                    <TableCell>{team.members.map(m => m.name).join(', ')}</TableCell>
                                    <TableCell>{team.lead ? team.lead.name : '-'}</TableCell>
                                    <TableCell>
                                        <Button asChild size="xs" variant="secondary" className="mr-2">
                                            <Link href={route('hr.teams.edit', team.id)}>Edit</Link>
                                        </Button>
                                        <Button asChild size="xs" variant="outline">
                                            <Link href={route('hr.teams.show', team.id)}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
