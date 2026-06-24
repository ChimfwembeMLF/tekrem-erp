import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  MapPin,
  Award,
  AlertTriangle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

export default function Index({ trainings, categories, filters }) {
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    router.get(route('hr.training.index'), {
      ...filters,
      search: form.get('search') || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.training.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, { preserveState: true, replace: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <HrPageShell
      title="Training Programs"
      description="Manage employee training, certifications, and development programs"
      actions={
        <Button onClick={() => router.get(route('hr.training.create'))}>
          <Plus className="h-4 w-4 mr-2" />
          Create Training
        </Button>
      }
    >
      {/* FILTERS */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input name="search" placeholder="Search training..." className="flex-1" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="certification">Certification</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category || 'all'} onValueChange={(v) => handleFilterChange('category', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {trainings.data.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No training programs found.</p>
          </div>
        ) : (
          trainings.data.map(t => (
            <Link
              key={t.id}
              href={route('hr.training.show', t.id)}
              className="block rounded-xl border p-4 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{t.title}</p>

                    {t.is_mandatory && (
                      <Badge variant="destructive" className="text-xs flex gap-1 items-center">
                        <AlertTriangle className="h-3 w-3" />
                        Mandatory
                      </Badge>
                    )}

                    {t.requires_certification && (
                      <Badge variant="secondary" className="text-xs flex gap-1 items-center">
                        <Award className="h-3 w-3" />
                        Cert
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t.instructor?.name ?? t.provider ?? 'No instructor'} · {t.category ?? 'Uncategorized'}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <p>{t.start_date}</p>
                    <p className="text-muted-foreground text-xs">
                      {t.enrollments_count} enrolled
                    </p>
                  </div>

                  <Badge className={getStatusColor(t.status)}>
                    {t.status}
                  </Badge>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}