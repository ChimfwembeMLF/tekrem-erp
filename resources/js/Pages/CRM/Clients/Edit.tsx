import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/Components/ui/select';
import { InertiaSharedProps } from '@/types';
import { CrmFormShell } from '@/Components/Module/moduleFormWrappers';

interface Client {
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
  status: string;
}

interface ClientEditProps extends InertiaSharedProps {
  client: Client;
}

export default function ClientEdit({ client }: ClientEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    position: client.position || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    postal_code: client.postal_code || '',
    country: client.country || '',
    notes: client.notes || '',
    status: client.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('crm.clients.update', client.id));
  };

  return (
    <CrmFormShell
      title="Edit Client"
      backHref={route('crm.clients.index')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
          <CardDescription>
            Update client information
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={data.phone}
                onChange={(e) => setData('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={data.company}
                onChange={(e) => setData('company', e.target.value)}
              />
              {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={data.position}
                onChange={(e) => setData('position', e.target.value)}
              />
              {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={data.status}
                onValueChange={(value) => setData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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
              <Input
                value={data.city}
                onChange={(e) => setData('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={data.country}
                onChange={(e) => setData('country', e.target.value)}
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={data.notes}
              onChange={(e) => setData('notes', e.target.value)}
            />
          </div>

        </CardContent>
      </Card>
    </CrmFormShell>
  );
}