
import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select.jsx';
import useRoute from '@/Hooks/useRoute';


export default function Create({ employees }: { employees: Array<{ id: number | string; name: string }> }) {
    type Employee = { id: number | string; name: string };
    const empList: Employee[] = employees as Employee[];
    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        description: string;
        members: string[];
        lead: string;
    }>({
        name: '',
        description: '',
        members: [],
        lead: '',
    });
    const [tab, setTab] = useState('details');
    const route = useRoute();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        post(route('hr.teams.store'));
    }

    return (
        <AppLayout title="Create Team">
            {/* <Head title="Create Team" /> */}
            <Card className="max-w-2xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Create Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={tab} onValueChange={setTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label>Team Name</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Input
                                        value={data.description}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('description', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.description && <div className="text-red-500 text-sm">{errors.description}</div>}
                                </div>
                                <Button type="submit" disabled={processing} className="mt-4">Create Team</Button>
                            </form>
                        </TabsContent>
                        <TabsContent value="members">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label className="mb-2 block">Team Members</Label>
                                    <Select
                                        value=""
                                        onValueChange={(val: string) => {
                                            if (!val) return;
                                            // Toggle member selection
                                            if (data.members.includes(val)) {
                                                setData('members', data.members.filter(id => id !== val));
                                            } else {
                                                setData('members', [...data.members, val]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={data.members.length > 0 ? `${data.members.length} selected` : 'Select team members'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {empList.map((emp: Employee) => (
                                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.members.includes(emp.id.toString())}
                                                            readOnly
                                                            className="mr-2 accent-primary"
                                                        />
                                                        {emp.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.members && <div className="text-red-500 text-sm mt-1">{errors.members}</div>}
                                </div>
                                <div>
                                    <Label className="mb-2 block">Team Lead</Label>
                                    <Select
                                        value={data.lead}
                                        onValueChange={(val: string) => setData('lead', val || '')}
                                        disabled={data.members.length === 0}
                                    >
                                        <SelectTrigger className="w-full mt-1">
                                            <SelectValue placeholder="Select team lead" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {data.members.map(id => {
                                                const emp = empList.find((e: Employee) => e.id.toString() === id);
                                                return emp ? (
                                                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                                                ) : null;
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.lead && <div className="text-red-500 text-sm mt-1">{errors.lead}</div>}
                                </div>
                                <Button type="submit" disabled={processing} className="mt-4">Create Team</Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
