import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { InertiaSharedProps } from '@/types';
import { CrmFormShell } from '@/Components/Module/moduleFormWrappers';

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  source: string | null;
  status: string;
}

interface LeadEditProps extends InertiaSharedProps {
  lead: Lead;
}

export default function LeadEdit({ lead }: LeadEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: lead.name,
    email: lead.email || '',
    phone: lead.phone || '',
    company: lead.company || '',
    position: lead.position || '',
    address: lead.address || '',
    city: lead.city || '',
    state: lead.state || '',
    postal_code: lead.postal_code || '',
    country: lead.country || '',
    notes: lead.notes || '',
    source: lead.source || '',
    status: lead.status || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('crm.leads.update', lead.id));
  };

  return (
    <CrmFormShell
      title="Edit Lead"
      backHref={route('crm.leads.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Edit Lead</CardTitle>
          <CardDescription>Update lead information</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={data.name} onChange={(e) => setData('name', e.target.value)} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={data.email} onChange={(e) => setData('email', e.target.value)} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={data.company} onChange={(e) => setData('company', e.target.value)} />
              {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Input value={data.position} onChange={(e) => setData('position', e.target.value)} />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={data.source || ''}
                onValueChange={(value) => setData('source', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Trade Show">Trade Show</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={data.status || ''}
                onValueChange={(value) => setData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={data.city} onChange={(e) => setData('city', e.target.value)} />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label>State/Province</Label>
              <Input value={data.state} onChange={(e) => setData('state', e.target.value)} />
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
            </div>

            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
              {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code}</p>}
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={data.country} onChange={(e) => setData('country', e.target.value)} />
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
            />
            {errors.notes && <p className="text-red-500 text-sm">{errors.notes}</p>}
          </div>
        </CardContent>
      </Card>
    </CrmFormShell>
  );
}