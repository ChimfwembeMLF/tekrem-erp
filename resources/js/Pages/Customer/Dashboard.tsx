import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Ticket, FolderOpen, FileText, Plus, Eye, ShoppingBag, Truck, Receipt } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { formatZmw } from '@/lib/formatCurrency';

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


interface ShopOrderData {
  id: number;
  order_number: string;
  status: string;
  total: string;
  created_at: string;
  access_token?: string;
  shipment?: { tracking_number: string; status: string } | null;
}

interface Props {
  tickets: TicketData[];
  projects: ProjectData[];
  invoices: InvoiceData[];
  shopOrders?: ShopOrderData[];
}


export default function CustomerDashboard({
  tickets = [],
  projects = [],
  invoices = [],
  shopOrders = [],
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

        {/* Recent shop orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent shop orders</CardTitle>
                <CardDescription>Online purchases from the storefront</CardDescription>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={route('shop.index')}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse shop
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shopOrders.length > 0 ? (
                shopOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 border rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()} · {formatZmw(Number(order.total))}
                      </div>
                      {order.shipment?.tracking_number && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Tracking: {order.shipment.tracking_number}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('shop.order.confirmation', { order: order.id, token: order.access_token })}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {order.shipment?.tracking_number && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={route('shop.tracking.show', order.shipment.tracking_number)}>
                            <Truck className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" asChild>
                        <a href={route('shop.order.receipt', order.id)} target="_blank" rel="noopener noreferrer">
                          <Receipt className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ShoppingBag className="mx-auto h-8 w-8 mb-2" />
                  <p>No shop orders yet</p>
                  <Link href={route('shop.index')}>
                    <Button className="mt-2" size="sm">Start shopping</Button>
                  </Link>
                </div>
              )}
              {shopOrders.length > 0 && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={route('shop.orders')}>View all shop orders</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                        <div className="font-medium">{formatZmw(Number(invoice.total_amount))}</div>
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
              <a href="mailto:Tekremsolutions@gmail.com" className="text-blue-600 underline">Tekremsolutions@gmail.com</a>
              <span className="text-muted-foreground">Phone: +260 976607840</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
