import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';


interface Department { id: number; name: string; }
interface Employee {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  employee_id: string;
  job_title: string;
  department: Department | null;
  employment_type: string;
  employment_status: string;
  hire_date: string;
  probation_end_date?: string;
  termination_date?: string;
  termination_reason?: string;
  salary?: string;
  salary_currency?: string;
  pay_frequency?: string;
  manager_id?: string;
  work_location?: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  address?: string;
  national_id?: string;
  passport_number?: string;
  tax_id?: string;
  skills?: string[];
  certifications?: string[];
  documents?: { name: string; url?: string; previous?: boolean }[];
  metadata?: Record<string, any>;
  notes?: string;
}
interface ShowEmployeeProps { employee: Employee; }

export default function ShowEmployee({ employee }: ShowEmployeeProps) {
  const route = useRoute();
  // Helper to render array fields
  const renderArray = (arr?: any[], emptyMsg = 'N/A') =>
    arr && arr.length > 0 ? (
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {arr.map((item, i) => (
          <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    ) : <span className="text-gray-400">{emptyMsg}</span>;

  // Previous documents (if any)
  const previousDocs = employee.documents?.filter(doc => doc.previous) || [];
  const currentDocs = employee.documents?.filter(doc => !doc.previous) || [];

  return (
    <AppLayout title="Employee Details">
      <Head title="Employee Details" />
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="job">Job</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="previous_docs">Previous Docs</TabsTrigger>
                <TabsTrigger value="documents">Documents/Skills</TabsTrigger>
                <TabsTrigger value="metadata">Other</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>Name:</b> {employee.name}</div>
                  <div><b>Date of Birth:</b> {employee.date_of_birth || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Gender:</b> {employee.gender || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Marital Status:</b> {employee.marital_status || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>National ID:</b> {employee.national_id || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Passport Number:</b> {employee.passport_number || <span className="text-gray-400">N/A</span>}</div>
                  <div className="md:col-span-2"><b>Address:</b> {employee.address || <span className="text-gray-400">N/A</span>}</div>
                </div>
              </TabsContent>
              <TabsContent value="job">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>User ID:</b> {employee.user_id || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Employee ID:</b> {employee.employee_id}</div>
                  <div><b>Job Title:</b> {employee.job_title}</div>
                  <div><b>Department:</b> {employee.department?.name || 'N/A'}</div>
                  <div><b>Employment Type:</b> {employee.employment_type?.replace('_', ' ')}</div>
                  <div><b>Employment Status:</b> {employee.employment_status?.replace('_', ' ')}</div>
                  <div><b>Hire Date:</b> {employee.hire_date}</div>
                  <div><b>Probation End Date:</b> {employee.probation_end_date || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Termination Date:</b> {employee.termination_date || <span className="text-gray-400">N/A</span>}</div>
                  <div className="md:col-span-2"><b>Termination Reason:</b> {employee.termination_reason || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Salary:</b> {employee.salary || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Salary Currency:</b> {employee.salary_currency || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Pay Frequency:</b> {employee.pay_frequency || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Manager ID:</b> {employee.manager_id || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Work Location:</b> {employee.work_location || <span className="text-gray-400">N/A</span>}</div>
                </div>
              </TabsContent>
              <TabsContent value="contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>Phone:</b> {employee.phone || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Email:</b> {employee.email}</div>
                </div>
              </TabsContent>
              <TabsContent value="emergency">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><b>Contact Name:</b> {employee.emergency_contact_name || <span className="text-gray-400">N/A</span>}</div>
                  <div><b>Contact Phone:</b> {employee.emergency_contact_phone || <span className="text-gray-400">N/A</span>}</div>
                  <div className="md:col-span-2"><b>Relationship:</b> {employee.emergency_contact_relationship || <span className="text-gray-400">N/A</span>}</div>
                </div>
              </TabsContent>
              <TabsContent value="previous_docs">
                <h3 className="font-semibold text-base mb-2">Previous Documents</h3>
                {previousDocs.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {previousDocs.map((doc, i) => (
                      <li key={i}>
                        {doc.url ? <a href={doc.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{doc.name}</a> : doc.name}
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-gray-400">None</span>}
              </TabsContent>
              <TabsContent value="documents">
                <h3 className="font-semibold text-base mb-2">Documents/Skills</h3>
                <div><b>Skills:</b> {renderArray(employee.skills)}</div>
                <div><b>Certifications:</b> {renderArray(employee.certifications)}</div>
                <div><b>Documents:</b> {currentDocs.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {currentDocs.map((doc, i) => (
                      <li key={i}>
                        {doc.url ? <a href={doc.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{doc.name}</a> : doc.name}
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-gray-400">None</span>}</div>
              </TabsContent>
              <TabsContent value="metadata">
                <h3 className="font-semibold text-base mb-2">Other</h3>
                <div><b>Tax ID:</b> {employee.tax_id || <span className="text-gray-400">N/A</span>}</div>
                <div><b>Metadata:</b> {employee.metadata ? <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(employee.metadata, null, 2)}</pre> : <span className="text-gray-400">N/A</span>}</div>
                <div><b>Notes:</b> {employee.notes || <span className="text-gray-400">N/A</span>}</div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-8">
              <Link href={route('hr.employees.edit', employee.id)}>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
