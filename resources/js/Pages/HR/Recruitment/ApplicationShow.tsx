import React from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import HrPageShell from '@/Components/HR/HrPageShell';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, Download } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

const PIPELINE = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as const;

interface Props {
  application: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    cover_letter?: string;
    status: string;
    notes?: string;
    applied_at?: string;
    has_resume: boolean;
    resume_url?: string | null;
    job_posting: {
      id: number;
      title: string;
      slug: string;
      department?: { name: string };
    };
  };
}

const statusVariant = (status: string) => {
  if (status === 'hired') return 'default';
  if (status === 'rejected') return 'destructive';
  if (status === 'interview' || status === 'offer') return 'secondary';
  return 'outline';
};

export default function ApplicationShow({ application }: Props) {
  const route = useRoute();
  const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

  const { data, setData, patch, processing } = useForm({
    status: application.status,
    notes: application.notes ?? '',
  });

  React.useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('hr.recruitment.applications.update', application.id));
  };

  const fullName = `${application.first_name} ${application.last_name}`.trim();

  return (
    <HrPageShell
      title={fullName}
      description={`Application for ${application.job_posting.title}`}
      actions={
        <>
          {application.resume_url && (
            <Button variant="outline" asChild>
              <a href={application.resume_url}>
                <Download className="mr-2 h-4 w-4" />
                Download resume
              </a>
            </Button>
          )}
          <Link href={route('hr.recruitment.show', application.job_posting.id)}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to pipeline
            </Button>
          </Link>
        </>
      }
    >
      <div className="mb-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>Applicant details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="w-40 font-medium text-muted-foreground">Status</TableCell>
              <TableCell>
                <Badge variant={statusVariant(application.status)} className="capitalize">
                  {application.status}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Position</TableCell>
              <TableCell>{application.job_posting.title}</TableCell>
            </TableRow>
            {application.job_posting.department && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Department</TableCell>
                <TableCell>{application.job_posting.department.name}</TableCell>
              </TableRow>
            )}
            {application.applied_at && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Applied</TableCell>
                <TableCell>{new Date(application.applied_at).toLocaleString()}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Email</TableCell>
              <TableCell>
                <a href={`mailto:${application.email}`} className="text-primary hover:underline">
                  {application.email}
                </a>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Phone</TableCell>
              <TableCell>
                {application.phone ? (
                  <a href={`tel:${application.phone}`} className="hover:underline">
                    {application.phone}
                  </a>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Resume</TableCell>
              <TableCell>
                {application.has_resume ? (
                  application.resume_url ? (
                    <a href={application.resume_url} className="text-primary hover:underline">
                      Download resume
                    </a>
                  ) : (
                    'Uploaded'
                  )
                ) : (
                  'No resume uploaded'
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="mb-6 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>Pipeline & notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="p-4">
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger className="max-w-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE.map((stage) => (
                          <SelectItem key={stage} value={stage} className="capitalize">
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Internal notes</Label>
                    <Textarea
                      id="notes"
                      rows={5}
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      placeholder="Interview feedback, screening notes, etc."
                    />
                  </div>

                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : 'Save changes'}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {application.cover_letter && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cover letter</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {application.cover_letter}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </HrPageShell>
  );
}
