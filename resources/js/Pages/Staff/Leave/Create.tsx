import React from 'react';
import { useForm } from '@inertiajs/react';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Calendar } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import {
  StaffFormShell,
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
} from '@/Components/Module/moduleFormWrappers';

interface Props {
  leaveTypes: Array<{ id: number; name: string }>;
  balances: Record<number, { remaining: number }>;
}

export default function StaffLeaveCreate({ leaveTypes, balances }: Props) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    is_half_day: false,
    half_day_period: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('staff.leave.store'));
  };

  return (
    <StaffFormShell
      title="Request leave"
      description="Submit a new leave request for manager approval."
      backHref={route('staff.leave.index')}
      backLabel="Back to leave"
      icon={<Calendar className="h-7 w-7" />}
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Submit request"
      maxWidth="lg"
      headerExtra={<StaffPortalNav />}
    >
      <ModuleFormSection title="Leave details" description="Choose dates and leave type.">
        <div className="space-y-5">
          <ModuleFormField label="Leave type" error={errors.leave_type_id} required>
            <Select value={data.leave_type_id} onValueChange={(v) => setData('leave_type_id', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                    {balances[t.id] ? ` (${balances[t.id].remaining} left)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ModuleFormField>

          <ModuleFormGrid>
            <ModuleFormField label="Start date" htmlFor="start_date" error={errors.start_date} required>
              <Input
                id="start_date"
                type="date"
                value={data.start_date}
                onChange={(e) => setData('start_date', e.target.value)}
              />
            </ModuleFormField>
            <ModuleFormField label="End date" htmlFor="end_date" error={errors.end_date} required>
              <Input
                id="end_date"
                type="date"
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
              />
            </ModuleFormField>
          </ModuleFormGrid>

          <div className="flex items-center gap-2">
            <Checkbox
              id="half_day"
              checked={data.is_half_day}
              onCheckedChange={(c) => setData('is_half_day', !!c)}
            />
            <label htmlFor="half_day" className="text-sm">
              Half day
            </label>
          </div>

          {data.is_half_day && (
            <ModuleFormField label="Half day period" error={errors.half_day_period}>
              <Select value={data.half_day_period} onValueChange={(v) => setData('half_day_period', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Morning or afternoon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </ModuleFormField>
          )}

          <ModuleFormField label="Reason" htmlFor="reason" error={errors.reason}>
            <Textarea
              id="reason"
              value={data.reason}
              onChange={(e) => setData('reason', e.target.value)}
              rows={3}
            />
          </ModuleFormField>
        </div>
      </ModuleFormSection>
    </StaffFormShell>
  );
}
