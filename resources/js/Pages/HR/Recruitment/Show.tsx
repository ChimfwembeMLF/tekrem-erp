import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ExternalLink, Globe, XCircle } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

const PIPELINE = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as const;

interface Application {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  applied_at: string;
  cover_letter?: string;
}

interface Props {
  posting: {
    id: number;
    title: string;
    slug: string;
    status: string;
    description: string;
    closes_at?: string;
    department?: { name: string };
    applications: Application[];
  };
  applicationsByStatus: Record<string, Application[]>;
  isPubliclyVisible: boolean;
}

const statusVariant = (status: string) => {
  if (status === 'hired') return 'default';
  if (status === 'rejected') return 'destructive';
  if (status === 'interview' || status === 'offer') return 'secondary';
  return 'outline';
};

export default function RecruitmentShow({ posting, isPubliclyVisible }: Props) {
  const route = useRoute();
  const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

  React.useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const updateStatus = (applicationId: number, status: string) => {
    router.patch(route('hr.recruitment.applications.update', applicationId), { status });
  };

  return (
    <HrPageShell
      title={posting.title}
      description={posting.department?.name ?? 'Recruitment pipeline'}
      actions={
        <>
          {posting.status === 'draft' && (
            <Button onClick={() => router.post(route('hr.recruitment.publish', posting.id))}>
              <Globe className="mr-2 h-4 w-4" />
              Publish to career portal
            </Button>
          )}
          {posting.status === 'closed' && (
            <Button onClick={() => router.post(route('hr.recruitment.publish', posting.id))}>
              <Globe className="mr-2 h-4 w-4" />
              Re-publish to career portal
            </Button>
          )}
          {posting.status === 'published' && (
            <>
              <Button variant="outline" onClick={() => window.open(route('careers.show', posting.slug), '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View public listing
              </Button>
              <Button variant="outline" onClick={() => router.post(route('hr.recruitment.close', posting.id))}>
                <XCircle className="mr-2 h-4 w-4" />
                Close posting
              </Button>
            </>
          )}
          <Link href={route('hr.recruitment.edit', posting.id)}>
            <Button variant="outline">Edit</Button>
          </Link>
        </>
      }
    >
      {posting.status === 'published' && !isPubliclyVisible && (
        <p className="mb-4 text-sm text-amber-600 dark:text-amber-400">
          This posting is not visible on the career portal because the application deadline has passed. Update the closing date or clear it, then re-publish.
        </p>
      )}

      <div className="mb-6 rounded-lg border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="w-40 font-medium text-muted-foreground">Status</TableCell>
              <TableCell>
                <Badge variant={statusVariant(posting.status)}>{posting.status}</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Department</TableCell>
              <TableCell>{posting.department?.name ?? '—'}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-muted-foreground">Applications</TableCell>
              <TableCell>{posting.applications.length}</TableCell>
            </TableRow>
            {posting.closes_at && (
              <TableRow>
                <TableCell className="font-medium text-muted-foreground">Closes</TableCell>
                <TableCell>{new Date(posting.closes_at).toLocaleDateString()}</TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell className="align-top font-medium text-muted-foreground">Description</TableCell>
              <TableCell className="whitespace-pre-wrap text-sm">{posting.description}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posting.applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No applications yet.
                </TableCell>
              </TableRow>
            ) : (
              posting.applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={route('hr.recruitment.applications.show', app.id)}
                      className="hover:text-primary hover:underline"
                    >
                      {app.first_name} {app.last_name}
                    </Link>
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.phone ?? '—'}</TableCell>
                  <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(app.status)} className="capitalize">
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select value={app.status} onValueChange={(value) => updateStatus(app.id, value)}>
                      <SelectTrigger className="ml-auto h-8 w-[140px] text-xs">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </HrPageShell>
  );
}
