import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import useRoute from '@/Hooks/useRoute';

interface Props {
  profile: {
    name?: string;
    email?: string;
    phone?: string;
    employee_id?: string;
    job_title?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    address?: string;
  };
}

export default function StaffProfile({ profile }: Props) {
  const route = useRoute();
  const { data, setData, put, processing } = useForm({
    phone: profile.phone ?? '',
    emergency_contact_name: profile.emergency_contact_name ?? '',
    emergency_contact_phone: profile.emergency_contact_phone ?? '',
    emergency_contact_relationship: profile.emergency_contact_relationship ?? '',
    address: profile.address ?? '',
  });

  return (
    <AppLayout title="My profile" renderHeader={() => <h2 className="text-xl font-semibold">My profile</h2>}>
      <div className="space-y-6">
        <StaffPortalNav />
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">{profile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {profile.job_title} · {profile.employee_id} · {profile.email}
            </p>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                put(route('staff.profile.update'));
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_name">Emergency contact</Label>
                <Input id="emergency_name" value={data.emergency_contact_name} onChange={(e) => setData('emergency_contact_name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Emergency phone</Label>
                <Input id="emergency_phone" value={data.emergency_contact_phone} onChange={(e) => setData('emergency_contact_phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_rel">Relationship</Label>
                <Input id="emergency_rel" value={data.emergency_contact_relationship} onChange={(e) => setData('emergency_contact_relationship', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
              </div>
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
