import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import StaffPortalNav from '@/Components/Staff/StaffPortalNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';

interface Props {
  payslips: {
    data: Array<{ id: number; period: string; amount: string; approved_at?: string }>;
  };
}

export default function StaffPayslipsIndex({ payslips }: Props) {
  const route = useRoute();

  return (
    <AppLayout title="My payslips" renderHeader={() => <h2 className="text-xl font-semibold">My payslips</h2>}>
      <div className="space-y-6">
        <StaffPortalNav />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approved payslips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payslips.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Payslips appear here after payroll is approved.</p>
            )}
            {payslips.data.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{p.period}</p>
                  <p className="text-sm text-muted-foreground">Net: {p.amount}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={route('staff.payslips.download', p.id)}>Download PDF</a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
