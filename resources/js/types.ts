type DateTime = string;

export type Nullable<T> = T | null;

export interface Team {
  id: number;
  name: string;
  personal_team: boolean;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface User {
  id: number;
  name: string;
  email: string;
  current_team_id: Nullable<number>;
  profile_photo_path: Nullable<string>;
  profile_photo_url: string;
  two_factor_enabled: boolean;
  email_verified_at: Nullable<DateTime>;
  created_at: DateTime;
  updated_at: DateTime;
  roles?: string[];
  permissions?: string[];
}

export interface Auth {
  user: Nullable<
    User & {
      all_teams?: Team[];
      current_team?: Team;
    }
  >;
}

export type InertiaSharedProps<T = {}> = T & {
  jetstream: {
    canCreateTeams: boolean;
    canManageTwoFactorAuthentication: boolean;
    canUpdatePassword: boolean;
    canUpdateProfileInformation: boolean;
    flash: any;
    hasAccountDeletionFeatures: boolean;
    hasApiFeatures: boolean;
    hasTeamFeatures: boolean;
    hasTermsAndPrivacyPolicyFeature: boolean;
    managesProfilePhotos: boolean;
    hasEmailVerification: boolean;
  };
  auth: Auth;
  errorBags: any;
  errors: any;
};

export interface Session {
  id: number;
  ip_address: string;
  is_current_device: boolean;
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
  last_active: DateTime;
}

export interface ApiToken {
  id: number;
  name: string;
  abilities: string[];
  last_used_ago: Nullable<DateTime>;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface JetstreamTeamPermissions {
  canAddTeamMembers: boolean;
  canDeleteTeam: boolean;
  canRemoveTeamMembers: boolean;
  canUpdateTeam: boolean;
}

export interface Role {
  key: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface TeamInvitation {
  id: number;
  team_id: number;
  email: string;
  role: Nullable<string>;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  start_date?: string; // ISO date string
  end_date?: string;   // ISO date string
  deadline?: string;   // ISO date string
  budget?: number;
  spent_amount?: number;
  progress?: number;   // 0-100
  client_id?: number;
  manager_id?: number;
  team_members?: number[]; // user IDs
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  milestone_id?: number;
  name: string;
  original_name?: string;
  file_path?: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  category?: string;
  description?: string;
  version?: number;
  is_latest_version?: boolean;
  uploaded_by?: number; // user ID
  access_level?: 'private' | 'team' | 'public';
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  due_date?: string;        // ISO date
  completion_date?: string; // ISO date
  progress?: number;        // 0-100
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: number;     // user ID
  dependencies?: number[];  // milestone IDs
  order?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectTimeLog {
  id: number;
  project_id: number;
  milestone_id?: number;
  user_id: number;
  description?: string;
  hours: number;
  log_date?: string;       // ISO date
  is_billable?: boolean;
  hourly_rate?: number;
  status?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}