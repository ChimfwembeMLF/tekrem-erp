import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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

  const renderArray = (arr?: any[], emptyMsg = 'N/A') =>
    arr && arr.length > 0 ? (
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {arr.map((item, i) => <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>)}
      </ul>
    ) : <span className="text-gray-400">{emptyMsg}</span>;

  const previousDocs = employee.documents?.filter(doc => doc.previous) || [];
  const currentDocs = employee.documents?.filter(doc => !doc.previous) || [];

  return (
    <AppLayout title="Employee Details">
      <Head title="Employee Details" />
      <div className="w-full mx-auto py-8">
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

              {/* Personal Info */}
              <TabsContent value="personal">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Name</TableCell><TableCell>{employee.name}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Date of Birth</TableCell><TableCell>{employee.date_of_birth || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Gender</TableCell><TableCell>{employee.gender || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Marital Status</TableCell><TableCell>{employee.marital_status || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">National ID</TableCell><TableCell>{employee.national_id || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Passport Number</TableCell><TableCell>{employee.passport_number || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Address</TableCell><TableCell>{employee.address || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Job Info */}
              <TabsContent value="job">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">User ID</TableCell><TableCell>{employee.user_id || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Employee ID</TableCell><TableCell>{employee.employee_id}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Job Title</TableCell><TableCell>{employee.job_title}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Department</TableCell><TableCell>{employee.department?.name || 'N/A'}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Employment Type</TableCell><TableCell>{employee.employment_type?.replace('_', ' ')}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Employment Status</TableCell><TableCell>{employee.employment_status?.replace('_', ' ')}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Hire Date</TableCell><TableCell>{employee.hire_date}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Probation End Date</TableCell><TableCell>{employee.probation_end_date || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Termination Date</TableCell><TableCell>{employee.termination_date || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Termination Reason</TableCell><TableCell>{employee.termination_reason || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Salary</TableCell><TableCell>{employee.salary || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Salary Currency</TableCell><TableCell>{employee.salary_currency || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Pay Frequency</TableCell><TableCell>{employee.pay_frequency || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Manager ID</TableCell><TableCell>{employee.manager_id || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Work Location</TableCell><TableCell>{employee.work_location || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Contact Info */}
              <TabsContent value="contact">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Phone</TableCell><TableCell>{employee.phone || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Email</TableCell><TableCell>{employee.email}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Emergency */}
              <TabsContent value="emergency">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Contact Name</TableCell><TableCell>{employee.emergency_contact_name || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Contact Phone</TableCell><TableCell>{employee.emergency_contact_phone || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Relationship</TableCell><TableCell>{employee.emergency_contact_relationship || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Previous Documents */}
              <TabsContent value="previous_docs">
                <h3 className="font-semibold mb-2">Previous Documents</h3>
                {previousDocs.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm text-gray-700">
                    {previousDocs.map((doc, i) => (
                      <li key={i}>
                        {doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{doc.name}</a> : doc.name}
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-gray-400">None</span>}
              </TabsContent>

              {/* Documents / Skills */}
              <TabsContent value="documents">
                <h3 className="font-semibold mb-2">Skills / Certifications / Documents</h3>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Skills</TableCell><TableCell>{renderArray(employee.skills)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Certifications</TableCell><TableCell>{renderArray(employee.certifications)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Documents</TableCell>
                      <TableCell>
                        {currentDocs.length > 0 ? (
                          <ul className="list-disc ml-5 text-sm text-gray-700">
                            {currentDocs.map((doc, i) => (
                              <li key={i}>
                                {doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{doc.name}</a> : doc.name}
                              </li>
                            ))}
                          </ul>
                        ) : <span className="text-gray-400">None</span>}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>

              {/* Metadata / Other */}
              <TabsContent value="metadata">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Tax ID</TableCell><TableCell>{employee.tax_id || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Metadata</TableCell>
                      <TableCell>
                        {employee.metadata ? <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(employee.metadata, null, 2)}</pre> : <span className="text-gray-400">N/A</span>}
                      </TableCell>
                    </TableRow>
                    <TableRow><TableCell className="font-medium">Notes</TableCell><TableCell>{employee.notes || <span className="text-gray-400">N/A</span>}</TableCell></TableRow>
                  </TableBody>
                </Table>
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
