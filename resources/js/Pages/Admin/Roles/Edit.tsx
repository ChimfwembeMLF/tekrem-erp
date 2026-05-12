import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { ArrowLeft, Save, Shield, Key, Search } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface RoleData {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

interface Props {
  role: RoleData;
  permissions: Permission[];
}

export default function RoleEdit({ role, permissions }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, setData, put, processing, errors } = useForm({
    name: role.name,
    description: role.description,
    permissions: role.permissions,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.roles.update', role.id));
  };

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setData('permissions', [...data.permissions, permissionName]);
    } else {
      setData('permissions', data.permissions.filter(p => p !== permissionName));
    }
  };

  const getModuleFromPermission = (permissionName: string): string => {
    const parts = permissionName.split(' ');
    if (parts.length === 1) return 'General';
    return parts
      .slice(1)
      .join(' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupedPermissions = useMemo(() => {
    const filtered = searchTerm
      ? permissions.filter(p =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : permissions;

    const groups: Record<string, Permission[]> = {};
    for (const permission of filtered) {
      const module = getModuleFromPermission(permission.name);
      if (!groups[module]) groups[module] = [];
      groups[module].push(permission);
    }

    const sortedGroups: Record<string, Permission[]> = {};
    Object.keys(groups)
      .sort()
      .forEach(key => {
        sortedGroups[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name));
      });
    return sortedGroups;
  }, [permissions, searchTerm]);

  const toggleModule = (module: string, checked: boolean) => {
    const modulePermissionNames = groupedPermissions[module].map(p => p.name);
    if (checked) {
      const newPermissions = [...data.permissions];
      for (const perm of modulePermissionNames) {
        if (!newPermissions.includes(perm)) newPermissions.push(perm);
      }
      setData('permissions', newPermissions);
    } else {
      setData('permissions', data.permissions.filter(p => !modulePermissionNames.includes(p)));
    }
  };

  const isModuleFullySelected = (module: string): boolean => {
    const modulePerms = groupedPermissions[module].map(p => p.name);
    return modulePerms.length > 0 && modulePerms.every(p => data.permissions.includes(p));
  };

  const isModulePartiallySelected = (module: string): boolean => {
    const modulePerms = groupedPermissions[module].map(p => p.name);
    const selectedCount = modulePerms.filter(p => data.permissions.includes(p)).length;
    return selectedCount > 0 && selectedCount < modulePerms.length;
  };

  const getModuleSelectedCount = (module: string): number => {
    return groupedPermissions[module].filter(p => data.permissions.includes(p.name)).length;
  };

  const handleSelectAll = () => {
    setData('permissions', permissions.map(p => p.name));
  };

  const handleDeselectAll = () => {
    setData('permissions', []);
  };

  const isSystemRole = ['admin', 'manager', 'staff', 'customer'].includes(role.name);

  const totalSelected = data.permissions.length;
  const totalPermissions = permissions.length;

  return (
    <AppLayout
      title="Edit Role"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('admin.roles.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roles
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Role: {role.name}
          </h2>
        </div>
      )}
    >
      <Head title={`Edit Role: ${role.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isSystemRole && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>System Role:</strong> This is a system role. Changing the name or
                      removing critical permissions may affect system functionality.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Enter role name"
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={isSystemRole}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    {isSystemRole && (
                      <p className="text-xs text-gray-500">System role names cannot be changed</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe the role's purpose and responsibilities"
                      className={errors.description ? 'border-red-500' : ''}
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Permission Assignment ── */}
            <div className="space-y-4">
              {/* Section header */}
              <div>
                <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <a href={route('admin.roles.index')} className="hover:text-foreground transition-colors">
                    Roles
                  </a>
                  <span>/</span>
                  <span className="text-foreground font-medium capitalize">{role.name} Permissions</span>
                </nav>
                <h1 className="text-2xl font-bold text-foreground capitalize">
                  {role.name} — Permissions
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {totalSelected} of {totalPermissions} permissions selected
                </p>
              </div>

              {/* Search + bulk actions */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>

              {/* Permission cards grid */}
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border rounded-lg">
                  No permissions match your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                    const fullySelected = isModuleFullySelected(module);
                    const partiallySelected = isModulePartiallySelected(module);
                    const selectedCount = getModuleSelectedCount(module);

                    return (
                      <div
                        key={module}
                        className="border rounded-xl bg-white dark:bg-card overflow-hidden"
                      >
                        {/* Module header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                          <div className="flex items-center gap-2.5">
                            {/* Circle-style checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleModule(module, !fullySelected)}
                              className={[
                                'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                                fullySelected
                                  ? 'bg-foreground border-foreground'
                                  : partiallySelected
                                  ? 'border-foreground'
                                  : 'border-muted-foreground/40 hover:border-muted-foreground',
                              ].join(' ')}
                              aria-label={`Toggle all ${module} permissions`}
                            >
                              {fullySelected && (
                                <span className="block h-2 w-2 rounded-full bg-white" />
                              )}
                              {partiallySelected && !fullySelected && (
                                <span className="block h-1.5 w-1.5 rounded-full bg-foreground" />
                              )}
                            </button>
                            <span className="font-semibold text-sm text-foreground">
                              {module}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {selectedCount}/{modulePermissions.length}
                          </span>
                        </div>

                        {/* Permission list */}
                        <div className="divide-y divide-border/60">
                          {modulePermissions.map((permission) => {
                            const isChecked = data.permissions.includes(permission.name);
                            // Derive display name: capitalize the action word
                            const displayName = permission.name
                              .split(' ')
                              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                              .join(' ');

                            return (
                              <label
                                key={permission.id}
                                htmlFor={`perm-${permission.id}`}
                                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
                              >
                                {/* Circle checkbox per permission */}
                                <button
                                  type="button"
                                  id={`perm-${permission.id}`}
                                  onClick={() => handlePermissionChange(permission.name, !isChecked)}
                                  className={[
                                    'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                                    isChecked
                                      ? 'bg-foreground border-foreground'
                                      : 'border-muted-foreground/40 hover:border-muted-foreground',
                                  ].join(' ')}
                                  aria-checked={isChecked}
                                  role="checkbox"
                                >
                                  {isChecked && (
                                    <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground leading-snug">
                                    {displayName}
                                  </p>
                                  {permission.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.permissions && (
                <p className="text-sm text-red-500">{errors.permissions}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <Button type="button" variant="outline" asChild>
                <a href={route('admin.roles.index')}>Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}