import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Save } from 'lucide-react';
import { Communication, Client, Lead, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';
import { CrmFormShell } from '@/Components/Module/moduleFormWrappers';

interface CommunicationEditProps extends InertiaSharedProps {
  communication: Communication;
  clients: Client[];
  leads: Lead[];
}

export default function CommunicationEdit({
  communication,
}: CommunicationEditProps) {
  const route = useRoute();

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const { data, setData, put, processing, errors } = useForm({
    type: communication.type || '',
    content: communication.content || '',
    subject: communication.subject || '',
    communication_date: formatDateTime(communication.communication_date),
    direction: communication.direction || '',
    status: communication.status || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('crm.communications.update', communication.id));
  };

  return (
    <CrmFormShell
      title="Edit Communication"
      backHref={route('crm.communications.show', communication.id)}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Update"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Edit Communication</CardTitle>
          <CardDescription>
            Update the communication details below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Associated Entity */}
          {communication.communicable && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">
                Related Contact
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {communication.communicable.name}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Type */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={data.type}
                onValueChange={(value) => setData('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={data.direction}
                onValueChange={(value) => setData('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                  <SelectItem value="none">Not specified</SelectItem>
                </SelectContent>
              </Select>
              {errors.direction && <p className="text-red-500 text-sm">{errors.direction}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <Label>Communication Date *</Label>
              <Input
                type="datetime-local"
                value={data.communication_date}
                onChange={(e) => setData('communication_date', e.target.value)}
              />
              {errors.communication_date && (
                <p className="text-red-500 text-sm">{errors.communication_date}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={data.status}
                onValueChange={(value) => setData('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="none">Not specified</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={data.subject}
              onChange={(e) => setData('subject', e.target.value)}
              placeholder="Optional subject"
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              rows={6}
              value={data.content}
              onChange={(e) => setData('content', e.target.value)}
            />
            {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
          </div>
        </CardContent>
      </Card>
    </CrmFormShell>
  );
}