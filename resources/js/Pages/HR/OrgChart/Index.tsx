import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';

// Placeholder for org chart visualization
export default function OrgChartIndex({ departments = [] }) {
  return (
    <>
      <Head title="Organizational Chart" />
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Organizational Chart</h1>
        <Card>
          <CardHeader>
            <CardTitle>Company Structure</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Replace with actual org chart visualization */}
            {departments.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No department data available.</div>
            ) : (
              <ul className="space-y-2">
                {departments.map((dept) => (
                  <li key={dept.id}>
                    <span className="font-semibold">{dept.name}</span>
                    {dept.children && dept.children.length > 0 && (
                      <ul className="ml-6 list-disc">
                        {dept.children.map((child) => (
                          <li key={child.id}>{child.name}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
