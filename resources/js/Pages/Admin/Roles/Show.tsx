import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/Components/ui/accordion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Key,
  Users,
  Calendar,
  Search,
  ChevronRight,
  User,
  Lock,
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface RoleData {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  users: User[];
  users_count: number;
  permissions_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  role: RoleData;
}

export default function RoleShow({ role }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const isSystemRole = ['admin', 'manager', 'staff', 'customer'].includes(role.name);

  // Group and filter permissions
  const groupedPermissions = useMemo(() => {
    // First, group by module (last part after action)
    const groups: Record<string, (Permission & { action: string })[]> = {};

    role.permissions.forEach((permission) => {
      const parts = permission.name.split(' ');
      const action = parts[0];
      const moduleRaw = parts.slice(1).join(' ');
      let module = moduleRaw
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

      if (!module) module = 'General';

      if (!groups[module]) {
        groups[module] = [];
      }

      groups[module].push({
        ...permission,
        action,
      });
    });

    // Filter based on search term
    if (!searchTerm) return groups;

    const lowerSearch = searchTerm.toLowerCase();
    const filtered: typeof groups = {};
    Object.entries(groups).forEach(([module, perms]) => {
      const filteredPerms = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.action.toLowerCase().includes(lowerSearch) ||
          module.toLowerCase().includes(lowerSearch)
      );
      if (filteredPerms.length) {
        filtered[module] = filteredPerms;
      }
    });
    return filtered;
  }, [role.permissions, searchTerm]);

  const totalFilteredPermissions = Object.values(groupedPermissions).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  const handleDelete = () => {
    if (isSystemRole) {
      alert('System roles cannot be deleted.');
      return;
    }

    if (role.users_count > 0) {
      alert('Cannot delete role that has users assigned to it. Please reassign users first.');
      return;
    }

    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      router.delete(route('admin.roles.destroy', role.id));
    }
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'staff':
        return 'secondary';
      case 'customer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <AppLayout
      title={`Role: ${role.name}`}
      renderHeader={() => (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild size="sm">
              <a href={route('admin.roles.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </a>
            </Button>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Role Details
              </h2>
              <p className="text-sm text-muted-foreground">
                Viewing {role.name} role configuration
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={route('admin.roles.edit', role.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </a>
            </Button>
            {!isSystemRole && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Role
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`Role: ${role.name}`} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role Name</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold capitalize">{role.name}</p>
                      <Badge variant={getRoleBadgeVariant(role.name)}>
                        {role.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Users</p>
                    <p className="text-2xl font-bold">{role.users_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Key className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="text-2xl font-bold">{role.permissions_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content with Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="users">Users ({role.users_count})</TabsTrigger>
              <TabsTrigger value="permissions">
                Permissions ({role.permissions_count})
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Role Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Description
                        </label>
                        <p className="mt-1 text-base">
                          {role.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          System Role
                        </label>
                        <div className="mt-1">
                          {isSystemRole ? (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="h-3 w-3" /> Protected
                            </Badge>
                          ) : (
                            <Badge variant="outline">Custom Role</Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Created
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(role.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Last Updated
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(role.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Role ID
                        </label>
                        <p className="font-mono text-sm mt-1">#{role.id}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Users ({role.users_count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {role.users && role.users.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {role.users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{user.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No users assigned</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        No users have been assigned to this role yet.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.get(route('admin.users.index'))}
                      >
                        Manage Users
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions">
              <Card>
                <CardHeader className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Permissions ({role.permissions_count})
                    </CardTitle>
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Found {totalFilteredPermissions} permission
                      {totalFilteredPermissions !== 1 ? 's' : ''}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {role.permissions.length === 0 ? (
                    <div className="text-center py-12">
                      <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No permissions assigned</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This role has no permissions assigned.
                      </p>
                    </div>
                  ) : Object.keys(groupedPermissions).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No permissions match your search.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <Accordion type="multiple" className="space-y-4">
                        {Object.entries(groupedPermissions).map(
                          ([module, modulePermissions]) => (
                            <AccordionItem
                              key={module}
                              value={module}
                              className="border rounded-lg px-4"
                            >
                              <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold capitalize">{module}</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {modulePermissions.length}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="flex flex-wrap gap-2 pb-4">
                                  {modulePermissions.map((permission) => (
                                    <Badge
                                      key={permission.id}
                                      variant="outline"
                                      className="text-xs py-1 px-2 gap-1"
                                    >
                                      <Key className="h-3 w-3" />
                                      {permission.name}
                                    </Badge>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        )}
                      </Accordion>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}