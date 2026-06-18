import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import useRoute from '@/Hooks/useRoute';

interface Props {
  payrollSettings: Record<string, unknown>;
  attendanceSettings: Record<string, unknown>;
  leaveSettings: Record<string, unknown>;
  performanceSettings: Record<string, unknown>;
  trainingSettings: Record<string, unknown>;
  generalSettings: Record<string, unknown>;
}

function SettingsForm({
  settings,
  routeName,
  fields,
}: {
  settings: Record<string, unknown>;
  routeName: string;
  fields: { key: string; label: string; type?: string }[];
}) {
  const route = useRoute();
  const { data, setData, put, processing } = useForm(settings as Record<string, string>);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        put(route(routeName));
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      {fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}</Label>
          <Input
            type={f.type ?? 'text'}
            value={String(data[f.key] ?? '')}
            onChange={(e) => setData(f.key, e.target.value)}
          />
        </div>
      ))}
      <div className="md:col-span-2">
        <Button type="submit" disabled={processing}>Save</Button>
      </div>
    </form>
  );
}

export default function Index({
  payrollSettings,
  attendanceSettings,
  leaveSettings,
}: Props) {
  return (
    <AppLayout title="HR Setup">
      <Head title="HR Setup" />
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <h1 className="text-2xl font-bold">HR Module Settings</h1>

        <Tabs defaultValue="payroll">
          <TabsList>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
          </TabsList>

          <TabsContent value="payroll">
            <Card>
              <CardHeader><CardTitle>Payroll Settings</CardTitle></CardHeader>
              <CardContent>
                <SettingsForm
                  settings={payrollSettings}
                  routeName="hr.setup.payroll"
                  fields={[
                    { key: 'payroll_frequency', label: 'Frequency' },
                    { key: 'default_currency', label: 'Currency' },
                    { key: 'default_tax_rate', label: 'Tax Rate %', type: 'number' },
                    { key: 'overtime_rate_multiplier', label: 'Overtime Multiplier', type: 'number' },
                    { key: 'payroll_start_day', label: 'Start Day', type: 'number' },
                    { key: 'payroll_cutoff_day', label: 'Cutoff Day', type: 'number' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader><CardTitle>Attendance Settings</CardTitle></CardHeader>
              <CardContent>
                <SettingsForm
                  settings={attendanceSettings}
                  routeName="hr.setup.attendance"
                  fields={[
                    { key: 'work_hours_per_day', label: 'Work Hours/Day', type: 'number' },
                    { key: 'work_days_per_week', label: 'Work Days/Week', type: 'number' },
                    { key: 'default_start_time', label: 'Start Time' },
                    { key: 'default_end_time', label: 'End Time' },
                    { key: 'grace_period_minutes', label: 'Grace Period (min)', type: 'number' },
                    { key: 'late_threshold_minutes', label: 'Late Threshold (min)', type: 'number' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave">
            <Card>
              <CardHeader><CardTitle>Leave Settings</CardTitle></CardHeader>
              <CardContent>
                <SettingsForm
                  settings={leaveSettings}
                  routeName="hr.setup.leave"
                  fields={[
                    { key: 'annual_leave_days', label: 'Annual Leave Days', type: 'number' },
                    { key: 'sick_leave_days', label: 'Sick Leave Days', type: 'number' },
                    { key: 'advance_notice_days', label: 'Advance Notice Days', type: 'number' },
                    { key: 'max_carry_forward_days', label: 'Max Carry Forward', type: 'number' },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
