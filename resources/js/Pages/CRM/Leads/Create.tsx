import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import LeadInsights from '@/Components/CRM/LeadInsights';
import useCRMAI from '@/Hooks/useCRMAI';
import { Bot, UserPlus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import {
  CrmFormShell,
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
} from '@/Components/Module/moduleFormWrappers';

export default function LeadCreate() {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    notes: '',
    source: '',
    status: 'new',
  });

  const { getLeadInsights, loading: aiLoading } = useCRMAI();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('crm.leads.store'));
  };

  const handleGetAIInsights = async () => {
    if (!data.name.trim()) return;
    setShowAIInsights(true);
    const insights = await getLeadInsights(data);
    if (insights) setAiInsights(insights);
  };

  return (
    <CrmFormShell
      title="Add Lead"
      description="Create a new lead in the CRM system."
      backHref={route('crm.leads.index')}
      backLabel="Back to leads"
      icon={<UserPlus className="h-7 w-7" />}
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save lead"
      maxWidth="4xl"
      headerExtra={
        <Button type="button" variant="outline" size="sm" onClick={handleGetAIInsights} disabled={!data.name.trim() || aiLoading}>
          <Bot className="mr-2 h-4 w-4" />
          {aiLoading ? 'Getting AI insights…' : 'Get AI insights'}
        </Button>
      }
    >
      {showAIInsights && aiInsights && (
        <LeadInsights insights={aiInsights} onDismiss={() => { setShowAIInsights(false); setAiInsights(null); }} loading={aiLoading} />
      )}

      <ModuleFormSection title="Contact information" description="Primary details for this lead.">
        <ModuleFormGrid>
          <ModuleFormField label="Name" htmlFor="name" error={errors.name} required>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
          </ModuleFormField>
          <ModuleFormField label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
          </ModuleFormField>
          <ModuleFormField label="Phone" htmlFor="phone" error={errors.phone}>
            <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
          </ModuleFormField>
          <ModuleFormField label="Company" htmlFor="company" error={errors.company}>
            <Input id="company" value={data.company} onChange={(e) => setData('company', e.target.value)} />
          </ModuleFormField>
          <ModuleFormField label="Position" htmlFor="position" error={errors.position}>
            <Input id="position" value={data.position} onChange={(e) => setData('position', e.target.value)} />
          </ModuleFormField>
          <ModuleFormField label="Source" error={errors.source}>
            <Select value={data.source} onValueChange={(value) => setData('source', value)}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
                <SelectItem value="Trade Show">Trade Show</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </ModuleFormField>
          <ModuleFormField label="Status" error={errors.status} required>
            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="unqualified">Unqualified</SelectItem>
              </SelectContent>
            </Select>
          </ModuleFormField>
        </ModuleFormGrid>
      </ModuleFormSection>

      <ModuleFormSection title="Address" description="Location details (optional).">
        <div className="space-y-5">
          <ModuleFormField label="Street address" htmlFor="address" error={errors.address}>
            <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
          </ModuleFormField>
          <ModuleFormGrid>
            <ModuleFormField label="City" htmlFor="city" error={errors.city}>
              <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
            </ModuleFormField>
            <ModuleFormField label="State / Province" htmlFor="state" error={errors.state}>
              <Input id="state" value={data.state} onChange={(e) => setData('state', e.target.value)} />
            </ModuleFormField>
            <ModuleFormField label="Postal code" htmlFor="postal_code" error={errors.postal_code}>
              <Input id="postal_code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)} />
            </ModuleFormField>
            <ModuleFormField label="Country" htmlFor="country" error={errors.country}>
              <Input id="country" value={data.country} onChange={(e) => setData('country', e.target.value)} />
            </ModuleFormField>
          </ModuleFormGrid>
        </div>
      </ModuleFormSection>

      <ModuleFormSection title="Notes">
        <ModuleFormField label="Internal notes" htmlFor="notes" error={errors.notes}>
          <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={4} />
        </ModuleFormField>
      </ModuleFormSection>
    </CrmFormShell>
  );
}
