import React from 'react';
import { Link, router } from '@inertiajs/react';
import HrPageShell, { HrStatCard } from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Plus, Briefcase, ExternalLink } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface JobPosting {
  id: number;
  title: string;
  slug: string;
  status: string;
  location?: string;
  employment_type: string;
  applications_count: number;
  department?: { name: string };
  published_at?: string;
}

interface Props {
  postings: { data: JobPosting[]; links: unknown[] };
  pipeline: { draft: number; published: number; closed: number; applications: number; interviews: number };
  filters: { status?: string };
}

const statusVariant = (s: string) =>
  s === 'published' ? 'default' : s === 'draft' ? 'secondary' : 'outline';

export default function RecruitmentIndex({ postings, pipeline }: Props) {
  const route = useRoute();

  return (
    <HrPageShell
      title="Recruitment"
      description="Create job postings, manage applications, and move candidates through your hiring pipeline."
      actions={
        <>
          <Button variant="outline" onClick={() => window.open(route('careers.index'), '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Career portal
          </Button>
          <Button onClick={() => router.get(route('hr.recruitment.create'))}>
            <Plus className="mr-2 h-4 w-4" />
            New job posting
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <HrStatCard label="Draft" value={pipeline.draft} />
        <HrStatCard label="Published" value={pipeline.published} />
        <HrStatCard label="Closed" value={pipeline.closed} />
        <HrStatCard label="Applications" value={pipeline.applications} />
        <HrStatCard label="In interview" value={pipeline.interviews} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {postings.data.map((job) => (
          <Card key={job.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  <Link href={route('hr.recruitment.show', job.id)} className="hover:text-primary">
                    {job.title}
                  </Link>
                </CardTitle>
                <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{job.department?.name ?? 'No department'} · {job.location ?? 'Remote'}</p>
              <p className="capitalize">{job.employment_type.replace('_', ' ')}</p>
              <p className="font-medium text-foreground">{job.applications_count} applications</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {postings.data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Briefcase className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-foreground">No job postings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first role to start receiving applications.</p>
          <Button className="mt-4" onClick={() => router.get(route('hr.recruitment.create'))}>
            <Plus className="mr-2 h-4 w-4" />
            Create job posting
          </Button>
        </div>
      )}
    </HrPageShell>
  );
}
