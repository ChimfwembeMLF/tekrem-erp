import React from "react"
import { Head, Link } from "@inertiajs/react"
import AppLayout from "@/Layouts/AppLayout"
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Edit } from "lucide-react"
import { Table, TableBody, TableRow, TableHead, TableCell } from "@/Components/ui/table"
import useRoute from "@/Hooks/useRoute"

interface Skill {
  id: number
  name: string
  description: string
  category: string
  type: string
  proficiency_levels: number
  level_descriptions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ShowSkillProps {
  skill: Skill
}

export default function ShowSkill({ skill }: ShowSkillProps) {
  const route = useRoute()

  const rows = [
    { label: "Name", value: skill.name },
    { label: "Description", value: skill.description },
    { label: "Category", value: skill.category },
    { label: "Type", value: skill.type },
    { label: "Proficiency Levels", value: skill.proficiency_levels },
    { label: "Level Descriptions", value: skill.level_descriptions.join(", ") },
    { label: "Active", value: skill.is_active ? "Yes" : "No" },
    {
      label: "Created At",
      value: new Date(skill.created_at).toLocaleString(),
    },
    {
      label: "Updated At",
      value: new Date(skill.updated_at).toLocaleString(),
    },
  ]

  return (
    <AppLayout title="Skill Details">
      <Head title="Skill Details" />
      <div className="w-full mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Skill Details</CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row.label}>
                    <TableHead className="w-48 font-medium">{row.label}</TableHead>
                    <TableCell>{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <Link href={route("hr.skills.edit", skill.id)}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
