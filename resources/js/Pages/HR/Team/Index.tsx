import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Plus, Search, Eye, Edit, Users } from "lucide-react";
import useRoute from "@/Hooks/useRoute";

export default function TeamsIndex({ teams, filters }) {
    const route = useRoute();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData(e.target as HTMLFormElement);
        router.get(
            route("hr.teams.index"),
            { ...filters, search: form.get("search") || undefined },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AppLayout title="Teams">
            <Head title="Teams" />

            <div className="py-6">
                <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader className="">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    <CardTitle>Teams</CardTitle>
                                </div>
                                <Link href={route("hr.teams.create")}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Team
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        name="search"
                                        placeholder="Search teams..."
                                        defaultValue={filters.search || ""}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>

                            {/* Teams Table */}
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Members</TableHead>
                                            <TableHead>Lead</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teams.data.map((team) => (
                                            <TableRow key={team.id}>
                                                <TableCell>{team.name}</TableCell>
                                                <TableCell>{team.description}</TableCell>
                                                <TableCell>{team.members.map(m => m.name).join(", ")}</TableCell>
                                                <TableCell>{team.lead ? team.lead.name : "-"}</TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    <Link href={route("hr.teams.edit", team.id)}>
                                                        <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                                    </Link>
                                                    <Link href={route("hr.teams.show", team.id)}>
                                                        <Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Empty state */}
                                {teams.data.length === 0 && (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No teams found</h3>
                                        <p className="text-gray-500 mb-4">Start by creating your first team.</p>
                                        <Link href={route("hr.teams.create")}>
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" /> New Team
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            {teams.last_page > 1 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Showing {teams.from} to {teams.to} of {teams.total} teams
                                    </div>
                                    <div className="flex gap-1">
                                        {teams.links.map((link, i) => (
                                            link.url === null ? (
                                                <Button
                                                    key={i}
                                                    size="sm"
                                                    variant="outline"
                                                    disabled
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <Link key={i} href={link.url}>
                                                    <Button
                                                        size="sm"
                                                        variant={link.active ? "default" : "outline"}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
