import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Ticket, FolderOpen, FileText, Plus, Eye } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TicketData {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category?: {
    name: string;
    color: string;
  };
}

interface ProjectData {
  id: number;
  name: string;
  status: string;
  progress: number;
  deadline: string;
  client?: {
    name: string;
  };
}

interface InvoiceData {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string;
  client?: {
    name: string;
  };
}

// PaymentData removed for simplification

// Stats removed for simplification


interface Props {
  tickets: TicketData[];
  projects: ProjectData[];
  invoices: InvoiceData[];
}


export default function CustomerDashboard({
  tickets = [],
  projects = [],
  invoices = [],
}: Props) {
  const getStatusBadge = (status: string, type: 'ticket' | 'project' | 'invoice') => {
    const variants: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
      open: 'destructive',
      in_progress: 'default',
      resolved: 'secondary',
      closed: 'outline',
      active: 'default',
      completed: 'secondary',
      paid: 'secondary',
      pending: 'default',
      overdue: 'destructive',
    };
    return variants[status] || 'outline';
  };

  const route = useRoute();
  return (
    <CustomerLayout>
      <Head title="Customer Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Tekrem!</h1>
          <p className="text-muted-foreground">
            Collaborate, track your projects, and get support here.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500">
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(project.status, 'project')}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FolderOpen className="mx-auto h-8 w-8 mb-2" />
                    <p>No projects yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Support Tickets */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Support Tickets</CardTitle>
                <Link href={route('customer.support.create')}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.length > 0 ? (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(ticket.status, 'ticket')}>
                          {ticket.status}
                        </Badge>
                        <Link href={route('customer.support.tickets.show', ticket.id)}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Ticket className="mx-auto h-8 w-8 mb-2" />
                    <p>No support tickets yet</p>
                    <Link href={route('customer.support.create')}>
                      <Button className="mt-2" size="sm">
                        Create Your First Ticket
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-medium">${invoice.total_amount}</div>
                        <Badge variant={getStatusBadge(invoice.status, 'invoice')}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="mx-auto h-8 w-8 mb-2" />
                  <p>No invoices yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Direct Support Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need help? Reach out to our support team directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <a href="mailto:tekremsolutions@gmail.com" className="text-blue-600 underline">tekremsolutions@gmail.com</a>
              <span className="text-muted-foreground">Phone: +260 976607840</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
