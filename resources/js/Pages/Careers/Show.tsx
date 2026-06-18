import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Props {
  job: {
    id: number;
    title: string;
    slug: string;
    description: string;
    requirements?: string;
    location?: string;
    employment_type: string;
    salary_range?: string;
    department?: { name: string };
  };
}

export default function CareersShow({ job }: Props) {
  const route = useRoute();
  const { flash } = usePage().props as { flash?: { success?: string } };

  React.useEffect(() => {
    if (flash?.success) toast.success(flash.success);
  }, [flash]);

  const { data, setData, post, processing, errors, reset } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    resume: null as File | null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('careers.apply', job.slug), {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  return (
    <GuestLayout>
      <Head title={`${job.title} — Careers`} />
      <div className="bg-background py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link href={route('careers.index')} className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            All positions
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
            <p className="mt-2 text-muted-foreground">
              {job.department?.name} · {job.location ?? 'Flexible'} · {job.employment_type.replace('_', ' ')}
            </p>
            {job.salary_range && <p className="mt-1 text-sm text-muted-foreground">{job.salary_range}</p>}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base">About this role</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-foreground">
              {job.description}
            </CardContent>
          </Card>

          {job.requirements && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-base">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                {job.requirements}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply for this position</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>First name</Label>
                    <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                    {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                </div>
                <div>
                  <Label>Cover letter</Label>
                  <Textarea rows={4} value={data.cover_letter} onChange={(e) => setData('cover_letter', e.target.value)} />
                </div>
                <div>
                  <Label>Resume (PDF, DOC)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setData('resume', e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                  Submit application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </GuestLayout>
  );
}
