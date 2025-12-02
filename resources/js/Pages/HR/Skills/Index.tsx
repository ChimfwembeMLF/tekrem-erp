  import React from "react"
  import { Head, Link, router } from "@inertiajs/react"
  import AppLayout from "@/Layouts/AppLayout"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/Components/ui/card"
  import { Button } from "@/Components/ui/button"
  import { Input } from "@/Components/ui/input"
  import { Badge } from "@/Components/ui/badge"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/Components/ui/select"
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/Components/ui/table"
  import { Plus, Search, Filter, Eye, Edit, Layers } from "lucide-react"
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
  }

  interface SkillsIndexProps {
    skills: {
      data: Skill[]
      links: any[]
      current_page: number
      last_page: number
      from: number
      to: number
      total: number
    }
    filters: {
      search?: string
      category?: string
      type?: string
      status?: string
    }
    categories: string[]
  }

  export default function SkillsIndex({ skills, filters, categories }: SkillsIndexProps) {
    const route = useRoute()

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      const form = new FormData(e.target as HTMLFormElement)
      router.get(route("hr.skills.index"), 
        {
          ...filters,
          search: form.get("search") || undefined,
        },
        { preserveState: true, replace: true }
      )
    }

    const handleFilter = (key: string, value: string) => {
      router.get(
        route("hr.skills.index"),
        {
          ...filters,
          [key]: value === "all" ? undefined : value,
        },
        { preserveState: true, replace: true }
      )
    }

    const statusColor = (active: boolean) =>
      active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"

    return (
      <AppLayout title="Skills Directory" renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">Skills</h2>
      )}>
        <Head title="Skills Directory" />

        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Skills Directory
                    </CardTitle>
                    <CardDescription>
                      Manage your organization’s skill framework and definitions
                    </CardDescription>
                  </div>
                  <Link href={route("hr.skills.create")}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent>
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      name="search"
                      placeholder="Search skills..."
                      defaultValue={filters.search || ""}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>

                  {/* Category */}
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(v) => handleFilter("category", v)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Type */}
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(v) => handleFilter("type", v)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft">Soft</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Active */}
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(v) => handleFilter("status", v)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Skills Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Levels</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {skills.data.map(skill => (
                        <TableRow key={skill.id}>
                          <TableCell className="font-medium">{skill.name}</TableCell>
                          <TableCell>{skill.category}</TableCell>
                          <TableCell className="capitalize">{skill.type}</TableCell>
                          <TableCell>{skill.proficiency_levels}</TableCell>
                          <TableCell>
                            <Badge className={statusColor(skill.is_active)}>
                              {skill.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(skill.created_at).toLocaleDateString()}
                          </TableCell>

                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={route("hr.skills.show", skill.id)}>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Link href={route("hr.skills.edit", skill.id)}>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Empty State */}
                  {skills.data.length === 0 && (
                    <div className="text-center py-8">
                      <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No skills found</h3>
                      <p className="text-gray-500 mb-4">Start by adding your first skill.</p>
                      <Link href={route("hr.skills.create")}>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {skills.last_page > 1 && (
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Showing {skills.from} to {skills.to} of {skills.total} skills
                    </div>

                    <div className="flex gap-1">
                      {skills.links.map((link, i) => {
                        if (link.url === null) {
                          return (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              disabled
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          )
                        }
                        return (
                          <Link key={i} href={link.url}>
                            <Button
                              size="sm"
                              variant={link.active ? "default" : "outline"}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }