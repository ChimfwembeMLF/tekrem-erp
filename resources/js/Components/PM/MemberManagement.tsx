import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Modal } from '@/Components/ui/modal';
import { Plus, UserPlus, Edit, Trash2, Mail, Crown, Shield, User, Eye, Users } from 'lucide-react';

export type Member = {
  id: number;
  role?: string;
  user?: { 
    id: number; 
    name: string; 
    email: string;
    avatar?: string;
  } | null;
  permissions?: string[];
  invited_at?: string;
  joined_at?: string;
  status?: 'active' | 'invited' | 'inactive';
};

export type MemberFormData = {
  id?: number;
  email: string;
  role: string;
  permissions: string[];
};

interface MemberManagementProps {
  members: Member[];
  projectId: number;
  onMemberInvite?: (memberData: MemberFormData) => void;
  onMemberEdit?: (memberData: MemberFormData) => void;
  onMemberRemove?: (memberId: number) => void;
  onRoleChange?: (memberId: number, newRole: string) => void;
}

const roleOptions = [
  { 
    value: 'owner', 
    label: 'Owner', 
    description: 'Full access to project and settings',
    icon: <Crown className="h-4 w-4" />,
    color: 'text-yellow-600 bg-yellow-100'
  },
  { 
    value: 'admin', 
    label: 'Admin', 
    description: 'Can manage project settings and members',
    icon: <Shield className="h-4 w-4" />,
    color: 'text-red-600 bg-red-100'
  },
  { 
    value: 'member', 
    label: 'Member', 
    description: 'Can edit and manage project content',
    icon: <User className="h-4 w-4" />,
    color: 'text-blue-600 bg-blue-100'
  },
  { 
    value: 'viewer', 
    label: 'Viewer', 
    description: 'Can only view project content',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-gray-600 bg-gray-100'
  },
];

const permissionOptions = [
  { value: 'manage_boards', label: 'Manage Boards', description: 'Create, edit, and delete boards' },
  { value: 'manage_cards', label: 'Manage Cards', description: 'Create, edit, and delete cards' },
  { value: 'manage_sprints', label: 'Manage Sprints', description: 'Create, edit, and delete sprints' },
  { value: 'manage_members', label: 'Manage Members', description: 'Invite and manage project members' },
  { value: 'view_analytics', label: 'View Analytics', description: 'Access project analytics and reports' },
];

const getDefaultPermissions = (role: string): string[] => {
  switch (role) {
    case 'owner':
      return permissionOptions.map(p => p.value);
    case 'admin':
      return ['manage_boards', 'manage_cards', 'manage_sprints', 'manage_members', 'view_analytics'];
    case 'member':
      return ['manage_boards', 'manage_cards', 'manage_sprints', 'view_analytics'];
    case 'viewer':
      return ['view_analytics'];
    default:
      return [];
  }
};

export function MemberManagement({
  members,
  projectId,
  onMemberInvite,
  onMemberEdit,
  onMemberRemove,
  onRoleChange,
}: MemberManagementProps) {
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberFormMode, setMemberFormMode] = useState<'invite' | 'edit'>('invite');
  const [memberFormData, setMemberFormData] = useState<Partial<MemberFormData>>({});

  const handleMemberInvite = () => {
    setMemberFormMode('invite');
    setMemberFormData({
      role: 'member',
      permissions: getDefaultPermissions('member'),
    });
    setMemberFormOpen(true);
  };

  const handleMemberEdit = (member: Member) => {
    setMemberFormMode('edit');
    setMemberFormData({
      id: member.id,
      email: member.user?.email || '',
      role: member.role || 'member',
      permissions: member.permissions || getDefaultPermissions(member.role || 'member'),
    });
    setMemberFormOpen(true);
  };

  const handleMemberSave = () => {
    if (!memberFormData.email?.trim()) return;

    const data: MemberFormData = {
      id: memberFormData.id,
      email: memberFormData.email.trim(),
      role: memberFormData.role || 'member',
      permissions: memberFormData.permissions || [],
    };

    if (memberFormMode === 'invite') {
      onMemberInvite?.(data);
    } else {
      onMemberEdit?.(data);
    }

    setMemberFormOpen(false);
    setMemberFormData({});
  };

  const handleRoleChange = (role: string) => {
    setMemberFormData(prev => ({
      ...prev,
      role,
      permissions: getDefaultPermissions(role),
    }));
  };

  const getRoleInfo = (role: string) => {
    return roleOptions.find(r => r.value === role) || roleOptions[2]; // Default to member
  };

  const getMemberStatus = (member: Member) => {
    if (member.status) return member.status;
    if (member.joined_at) return 'active';
    if (member.invited_at) return 'invited';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'invited':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Member Management</h3>
          <p className="text-sm text-gray-600">Manage project members and their permissions</p>
        </div>
        <Button onClick={handleMemberInvite}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {members.filter(m => getMemberStatus(m) === 'active').length}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {members.filter(m => getMemberStatus(m) === 'invited').length}
              </p>
              <p className="text-xs text-gray-500">Invited</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {members.filter(m => m.role === 'admin' || m.role === 'owner').length}
              </p>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-900">{members.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {members.length === 0 && (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No members added yet</p>
            <p className="text-sm text-gray-400 mb-4">Start by inviting your first team member</p>
            <Button onClick={handleMemberInvite}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite First Member
            </Button>
          </div>
        )}

        {members.map((member) => {
          const roleInfo = getRoleInfo(member.role || 'member');
          const status = getMemberStatus(member);
          
          return (
            <div key={member.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {member.user?.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {member.user?.name || member.user?.email || 'Invited User'}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${getStatusColor(status)}`}>
                        {status === 'active' && <User className="h-3 w-3 mr-1" />}
                        {status === 'invited' && <Mail className="h-3 w-3 mr-1" />}
                        <span className="capitalize">{status}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {member.user?.email}
                    </p>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${roleInfo.color}`}>
                        {roleInfo.icon}
                        <span className="ml-1">{roleInfo.label}</span>
                      </span>
                      
                      {/* Permissions Count */}
                      <span className="text-xs text-gray-500">
                        {member.permissions?.length || 0} permissions
                      </span>
                    </div>
                    
                    {/* Join/Invite Date */}
                    <p className="text-xs text-gray-400 mt-2">
                      {status === 'invited' && member.invited_at && 
                        `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                      }
                      {status === 'active' && member.joined_at && 
                        `Joined ${new Date(member.joined_at).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMemberEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMemberRemove?.(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Form Modal */}
      <Modal
        isOpen={memberFormOpen}
        onClose={() => setMemberFormOpen(false)}
        title={memberFormMode === 'invite' ? 'Invite Member' : 'Edit Member'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={memberFormData.email || ''}
              onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              disabled={memberFormMode === 'edit'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <label key={role.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={memberFormData.role === role.value}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${role.color}`}>
                        {role.icon}
                        <span className="ml-1">{role.label}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
              {permissionOptions.map((permission) => (
                <label key={permission.value} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={memberFormData.permissions?.includes(permission.value) || false}
                    onChange={(e) => {
                      const currentPermissions = memberFormData.permissions || [];
                      const newPermissions = e.target.checked
                        ? [...currentPermissions, permission.value]
                        : currentPermissions.filter(p => p !== permission.value);
                      setMemberFormData(prev => ({ ...prev, permissions: newPermissions }));
                    }}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{permission.label}</p>
                    <p className="text-xs text-gray-600">{permission.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setMemberFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMemberSave}>
              {memberFormMode === 'invite' ? (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Member
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}