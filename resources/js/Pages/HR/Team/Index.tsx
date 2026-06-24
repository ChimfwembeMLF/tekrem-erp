import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import useRoute from "@/Hooks/useRoute";
import HrPageShell from "@/Components/HR/HrPageShell";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Search, Users, Edit, Eye } from "lucide-react";

interface Team {
  id: number;
  name: string;
  description: string;
  members: { name: string }[];
  lead: { name: string } | null;
}

interface Props {
  teams: {
    data: Team[];
    links: any[];
    from: number;
    to: number;
    total: number;
    last_page: number;
  };
  filters: { search?: string };
}

export default function TeamsIndex({ teams, filters }: Props) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const search = new FormData(e.currentTarget).get("search") as string;

    router.get(
      route("hr.teams.index"),
      { ...filters, search: search || undefined },
      { preserveState: true, replace: true }
    );
  };

  return (
    <HrPageShell
      title="Teams"
      description="Organize employees into functional groups."
      actions={
        <Link href={route("hr.teams.create")}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Team
          </Button>
        </Link>
      }
    >
      <Head title="Teams" />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input name="search" placeholder="Search teams..." />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* List */}
      <div className="rounded-xl border border-border divide-y divide-border">
        {teams.data.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No teams found.
          </p>
        ) : (
          teams.data.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.description || "No description"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Lead: {t.lead?.name ?? "Unassigned"} · {t.members.length} members
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={route("hr.teams.show", t.id)}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href={route("hr.teams.edit", t.id)}>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {teams.last_page > 1 && (
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-4">
          <div>
            Showing {teams.from} to {teams.to} of {teams.total}
          </div>

          <div className="flex gap-1">
            {teams.links.map((link, i) =>
              link.url === null ? (
                <Button key={i} size="sm" variant="outline" disabled
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
            )}
          </div>
        </div>
      )}
    </HrPageShell>
  );
}