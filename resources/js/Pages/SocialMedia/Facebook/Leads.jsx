import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/Components/ui/table';


const FacebookLeads = ({ leads = [] }) => (
  <AppLayout title="Facebook Leads">
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="text-muted-foreground">No leads found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.lead?.name || 'Unknown Lead'}</TableCell>
                    <TableCell>{lead.lead?.email || '-'}</TableCell>
                    <TableCell>{lead.lead?.company || '-'}</TableCell>
                    <TableCell>{lead.lead?.status || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  </AppLayout>
);

export default FacebookLeads;
