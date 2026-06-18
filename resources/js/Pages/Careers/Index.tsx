import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Job {
  id: number;
  title: string;
  slug: string;
  location?: string;
  employment_type: string;
  salary_range?: string;
  department?: { name: string };
  published_at?: string;
}

interface Props {
  jobs: Job[];
}

export default function CareersIndex({ jobs }: Props) {
  const route = useRoute();

  return (
    <GuestLayout>
      <Head title="Careers" />
      <div className="bg-background py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Join our team
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Build your career with us. Explore open roles and apply in minutes.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-medium text-foreground">No open positions right now</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon for new opportunities.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={route('careers.show', job.slug)}
                  className="block rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {job.department && <span>{job.department.name}</span>}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 capitalize">
                          <Clock className="h-3.5 w-3.5" />
                          {job.employment_type.replace('_', ' ')}
                        </span>
                      </div>
                      {job.salary_range && (
                        <p className="mt-2 text-sm text-muted-foreground">{job.salary_range}</p>
                      )}
                    </div>
                    <Button>View & apply</Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
