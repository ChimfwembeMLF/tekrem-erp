import React, { useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { showFormErrors } from './useSonnerError';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import AppLayout from '@/Layouts/AppLayout';


interface User { id: number; name: string; email: string; }
interface Department { id: number; name: string; }
interface CreateEmployeeProps { departments: Department[]; users: User[]; }

export default function CreateEmployee({ departments = [], users = [] }: CreateEmployeeProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    user_id: '',
    name: '',
    email: '',
    employee_id: '',
    job_title: '',
    department_id: '',
    employment_type: '',
    employment_status: '',
    hire_date: '',
    probation_end_date: '',
    termination_date: '',
    termination_reason: '',
    salary: '',
    salary_currency: '',
    pay_frequency: '',
    manager_id: '',
    work_location: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    address: '',
    national_id: '',
    passport_number: '',
    tax_id: '',
    skills: '',
    certifications: '',
    documents: '',
    metadata: '',
    notes: '',
  });

  const prevErrors = useRef(errors);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('hr.employees.store'), {
      onError: (errs) => {
        showFormErrors(errs);
      },
    });
  };

  // Show errors if they exist on first render (e.g., after redirect)
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0 && prevErrors.current !== errors) {
      showFormErrors(errors);
      prevErrors.current = errors;
    }
  }, [errors]);

  const [tab, setTab] = React.useState('personal');
  return (
    <AppLayout title="Add Employee">
      <Head title="Add Employee" />
      <div className="py-6">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Employee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="job">Job</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="emergency">Emergency</TabsTrigger>
                    <TabsTrigger value="documents">Documents/Skills</TabsTrigger>
                    <TabsTrigger value="metadata">Other</TabsTrigger>
                  </TabsList>
                  <TabsContent value="personal">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input id="date_of_birth" type="date" value={data.date_of_birth} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('date_of_birth', e.target.value)} />
                        {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={data.gender} onValueChange={(val: string) => setData('gender', val)}>
                          <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="marital_status">Marital Status</Label>
                        <Select value={data.marital_status} onValueChange={(val: string) => setData('marital_status', val)}>
                          <SelectTrigger><SelectValue placeholder="Select Marital Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.marital_status && <p className="text-sm text-red-500">{errors.marital_status}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="national_id">National ID</Label>
                      <Input id="national_id" value={data.national_id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('national_id', e.target.value)} />
                      {errors.national_id && <p className="text-sm text-red-500">{errors.national_id}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passport_number">Passport Number</Label>
                      <Input id="passport_number" value={data.passport_number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('passport_number', e.target.value)} />
                      {errors.passport_number && <p className="text-sm text-red-500">{errors.passport_number}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" value={data.address} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)} />
                      {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                    </div>
                  </TabsContent>
                  <TabsContent value="job">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="user_id">User *</Label>
                        <Select value={data.user_id} onValueChange={(val: string) => setData('user_id', val)}>
                          <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>{user.name} ({user.email})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.user_id && <p className="text-sm text-red-500">{errors.user_id}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employee_id">Employee ID *</Label>
                        <Input id="employee_id" value={data.employee_id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('employee_id', e.target.value)} />
                        {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="job_title">Job Title *</Label>
                        <Input id="job_title" value={data.job_title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('job_title', e.target.value)} />
                        {errors.job_title && <p className="text-sm text-red-500">{errors.job_title}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department_id">Department</Label>
                        <Select value={data.department_id} onValueChange={(val: string) => setData('department_id', val)}>
                          <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="employment_type">Employment Type</Label>
                        <Select value={data.employment_type} onValueChange={(val: string) => setData('employment_type', val)}>
                          <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="employment_status">Employment Status</Label>
                        <Select value={data.employment_status} onValueChange={(val: string) => setData('employment_status', val)}>
                          <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="terminated">Terminated</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hire_date">Hire Date</Label>
                        <Input id="hire_date" type="date" value={data.hire_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('hire_date', e.target.value)} />
                        {errors.hire_date && <p className="text-sm text-red-500">{errors.hire_date}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="probation_end_date">Probation End Date</Label>
                        <Input id="probation_end_date" type="date" value={data.probation_end_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('probation_end_date', e.target.value)} />
                        {errors.probation_end_date && <p className="text-sm text-red-500">{errors.probation_end_date}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="termination_date">Termination Date</Label>
                        <Input id="termination_date" type="date" value={data.termination_date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('termination_date', e.target.value)} />
                        {errors.termination_date && <p className="text-sm text-red-500">{errors.termination_date}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="termination_reason">Termination Reason</Label>
                        <Textarea id="termination_reason" value={data.termination_reason} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('termination_reason', e.target.value)} />
                        {errors.termination_reason && <p className="text-sm text-red-500">{errors.termination_reason}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="manager_id">Manager</Label>
                        <Input id="manager_id" value={data.manager_id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('manager_id', e.target.value)} />
                        {errors.manager_id && <p className="text-sm text-red-500">{errors.manager_id}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_location">Work Location</Label>
                        <Input id="work_location" value={data.work_location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('work_location', e.target.value)} />
                        {errors.work_location && <p className="text-sm text-red-500">{errors.work_location}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary</Label>
                        <Input id="salary" type="number" value={data.salary} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('salary', e.target.value)} />
                        {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary_currency">Salary Currency</Label>
                        <Input id="salary_currency" value={data.salary_currency} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('salary_currency', e.target.value)} />
                        {errors.salary_currency && <p className="text-sm text-red-500">{errors.salary_currency}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pay_frequency">Pay Frequency *</Label>
                      <Select value={data.pay_frequency} onValueChange={(val: string) => setData('pay_frequency', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Pay Frequency" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.pay_frequency && <p className="text-sm text-red-500">{errors.pay_frequency}</p>}
                    </div>
                  </TabsContent>
                  <TabsContent value="contact">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={data.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone', e.target.value)} />
                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={data.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)} />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="emergency">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                        <Input id="emergency_contact_name" value={data.emergency_contact_name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('emergency_contact_name', e.target.value)} />
                        {errors.emergency_contact_name && <p className="text-sm text-red-500">{errors.emergency_contact_name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                        <Input id="emergency_contact_phone" value={data.emergency_contact_phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('emergency_contact_phone', e.target.value)} />
                        {errors.emergency_contact_phone && <p className="text-sm text-red-500">{errors.emergency_contact_phone}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                      <Input id="emergency_contact_relationship" value={data.emergency_contact_relationship} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('emergency_contact_relationship', e.target.value)} />
                      {errors.emergency_contact_relationship && <p className="text-sm text-red-500">{errors.emergency_contact_relationship}</p>}
                    </div>
                  </TabsContent>
                  <TabsContent value="documents">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma separated)</Label>
                      <Input id="skills" value={data.skills} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('skills', e.target.value)} />
                      {errors.skills && <p className="text-sm text-red-500">{errors.skills}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications (comma separated)</Label>
                      <Input id="certifications" value={data.certifications} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('certifications', e.target.value)} />
                      {errors.certifications && <p className="text-sm text-red-500">{errors.certifications}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documents">Documents (comma separated or upload)</Label>
                      <Input id="documents" value={data.documents} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('documents', e.target.value)} />
                      {errors.documents && <p className="text-sm text-red-500">{errors.documents}</p>}
                    </div>
                  </TabsContent>
                  <TabsContent value="metadata">
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input id="tax_id" value={data.tax_id} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('tax_id', e.target.value)} />
                      {errors.tax_id && <p className="text-sm text-red-500">{errors.tax_id}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metadata">Metadata (JSON)</Label>
                      <Textarea id="metadata" value={data.metadata} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('metadata', e.target.value)} />
                      {errors.metadata && <p className="text-sm text-red-500">{errors.metadata}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" value={data.notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)} />
                      {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-4">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Employee'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
