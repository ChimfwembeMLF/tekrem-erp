import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import AppLayout from '@/Layouts/AppLayout';

type Employee = { id: number | string; name: string };
type Team = {
    id: number | string;
    name: string;
    description: string;
    members: Employee[];
    lead?: Employee | null;
};

interface ShowProps {
    team: Team;
}

export default function Show({ team }: ShowProps) {
    return (
        <AppLayout title={`Team: ${team.name}`}> 
            <Card className="max-w-3xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Team Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Label>Name</Label>
                        <div className="pl-2">{team.name}</div>
                    </div>
                    <div className="mb-4">
                        <Label>Description</Label>
                        <div className="pl-2">{team.description}</div>
                    </div>
                    <div className="mb-4">
                        <Label>Lead</Label>
                        <div className="pl-2">{team.lead ? team.lead.name : '-'}</div>
                    </div>
                    <div className="mb-4">
                        <Label>Members</Label>
                        <ul className="list-disc ml-6">
                            {team.members.map(m => (
                                <li key={m.id}>
                                    {m.name} {team.lead && m.id === team.lead.id ? <span className="text-xs text-blue-500">(Lead)</span> : null}
                                </li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
