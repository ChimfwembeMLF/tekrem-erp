import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Plus, Edit, Eye } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Skill {
  id: number;
  name: string;
  level: string;
  employee_name: string;
}

interface SkillsIndexProps {
  skills: Skill[];
}

export default function SkillsIndex({ skills = [] }: SkillsIndexProps) {
  const route = useRoute();
  return (
    <AppLayout title="Employee Skills">
      <Head title="Employee Skills" />
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Employee Skills</h1>
          <Link href={route('hr.skills.create')}><Button><Plus className="h-4 w-4 mr-2" />Add Skill</Button></Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Skills Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No skills found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Skill</th>
                    <th className="px-4 py-2 text-left">Level</th>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => (
                    <tr key={skill.id}>
                      <td className="px-4 py-2">{skill.name}</td>
                      <td className="px-4 py-2">{skill.level}</td>
                      <td className="px-4 py-2">{skill.employee_name}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Link href={route('hr.skills.show', skill.id)}><Button size="sm" variant="outline"><Eye className="h-4 w-4" /></Button></Link>
                        <Link href={route('hr.skills.edit', skill.id)}><Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
