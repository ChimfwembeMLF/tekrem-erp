import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Edit } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Skill {
  id: number;
  name: string;
  level: string;
  employee_name: string;
}

interface ShowSkillProps {
  skill: Skill;
}

export default function ShowSkill({ skill }: ShowSkillProps) {
  const route = useRoute();
  return (
    <AppLayout title="Skill Details">
      <Head title="Skill Details" />
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Skill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="font-medium">Skill Name:</div>
              <div>{skill.name}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Level:</div>
              <div>{skill.level}</div>
            </div>
            <div className="mb-4">
              <div className="font-medium">Employee:</div>
              <div>{skill.employee_name}</div>
            </div>
            <Link href={route('hr.skills.edit', skill.id)}><Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button></Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
