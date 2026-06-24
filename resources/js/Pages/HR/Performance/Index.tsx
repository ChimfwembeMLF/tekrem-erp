import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Progress } from '@/Components/ui/progress';
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

export default function Index({ performances, employees, reviewers, filters }) {
  const route = useRoute();
  const { t } = useTranslate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);

    router.get(route('hr.performance.index'), {
      ...filters,
      search: form.get('search') || undefined,
    }, { preserveState: true, replace: true });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.performance.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, { preserveState: true, replace: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-3 w-3" />;
      case 'submitted': return <Clock className="h-3 w-3" />;
      case 'in_review': return <AlertTriangle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return '-';
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
        <span>{rating.toFixed(1)}</span>
      </div>
    );
  };

  const isOverdue = (dueDate: string, status: string) =>
    new Date(dueDate) < new Date() && status !== 'completed';

  return (
    <HrPageShell
      title={t('hr.performance_reviews', 'Performance Reviews')}
      description="Manage employee performance reviews and evaluations"
      actions={
        <Button onClick={() => router.get(route('hr.performance.create'))}>
          <Plus className="h-4 w-4 mr-2" />
          Create Review
        </Button>
      }
    >
      {/* STATS (optional lightweight version) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-semibold">{performances.total}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-xl font-semibold">
            {performances.data.filter(p => p.status === 'completed').length}
          </p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">In Review</p>
          <p className="text-xl font-semibold">
            {performances.data.filter(p => p.status === 'in_review').length}
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input name="search" placeholder="Search reviews..." className="flex-1" />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </form>

        <div className="flex flex-wrap gap-3">
          <Select value={filters.status || 'all'} onValueChange={(v) => handleFilterChange('status', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.employee_id || 'all'} onValueChange={(v) => handleFilterChange('employee_id', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Employee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {employees.map(e => (
                <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.reviewer_id || 'all'} onValueChange={(v) => handleFilterChange('reviewer_id', v)}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Reviewer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {reviewers.map(r => (
                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {performances.data.length === 0 ? (
          <div className="rounded-xl border border-dashed py-12 text-center">
            <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No performance reviews found.</p>
          </div>
        ) : (
          performances.data.map(p => (
            <Link
              key={p.id}
              href={route('hr.performance.show', p.id)}
              className="block rounded-xl border p-4 hover:shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div>
                  <p className="font-medium">{p.employee.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.reviewer.name} · {p.review_period}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    {renderRating(p.overall_rating)}
                  </div>

                  <Badge className={`${getStatusColor(p.status)} flex items-center gap-1`}>
                    {getStatusIcon(p.status)}
                    {p.status}
                  </Badge>

                  <div className="text-right text-sm">
                    <p className={isOverdue(p.due_date, p.status) ? 'text-red-500' : ''}>
                      {p.due_date}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </HrPageShell>
  );
}