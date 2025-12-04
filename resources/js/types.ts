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
  // Relationships
  client?: any;
  manager?: any;
  team?: any[];
  milestones?: ProjectMilestone[];
  files?: ProjectFile[];
  time_logs?: ProjectTimeLog[];
  conversations?: any[];
  total_hours?: number;
  total_billable_amount?: number;
  enable_boards?: boolean;
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

export interface CardAttachment {
  id: number;
  card_id: number;
  user_id: number;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CardComment {
  id: number;
  card_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: CardComment[];
}

export interface CardChecklistItem {
  id: number;
  checklist_id: number;
  title: string;
  completed: boolean;
  order: number;
  assigned_to?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: User;
}

export interface CardChecklist {
  id: number;
  card_id: number;
  title: string;
  order: number;
  created_at: string;
  updated_at: string;
  items?: CardChecklistItem[];
}

export interface CardActivityLog {
  id: number;
  card_id: number;
  user_id: number;
  action: string;
  field?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user?: User;
}

export interface CardWatcher {
  id: number;
  card_id: number;
  user_id: number;
  created_at: string;
  user?: User;
}

export interface CardRelation {
  id: number;
  card_id: number;
  related_card_id: number;
  relation_type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'duplicated_by';
  created_at: string;
  updated_at: string;
  related_card?: BoardCard;
}

export interface CardVote {
  id: number;
  card_id: number;
  user_id: number;
  created_at: string;
  user?: User;
}

export interface CardSubscriber {
  id: number;
  card_id: number;
  user_id: number;
  created_at: string;
  user?: User;
}

export interface CardReminder {
  id: number;
  card_id: number;
  user_id: number;
  remind_at: string;
  message?: string;
  sent: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CardLabel {
  id: number;
  name: string;
  color: string;
  board_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BoardCard {
  id: number;
  board_id: number;
  column_id: number;
  sprint_id?: number;
  epic_id?: number;
  project_task_id?: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  assignee_id?: number;
  reporter_id?: number;
  status?: string;
  labels?: string[];
  dependencies?: any[];
  order: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  // Relationships
  assignee?: User;
  reporter?: User;
  attachments?: CardAttachment[];
  comments?: CardComment[];
  checklists?: CardChecklist[];
  activity_logs?: CardActivityLog[];
  watchers?: CardWatcher[];
  relations?: CardRelation[];
  votes?: CardVote[];
  subscribers?: CardSubscriber[];
  reminders?: CardReminder[];
  card_labels?: CardLabel[];
  // Counts
  attachments_count?: number;
  comments_count?: number;
  watchers_count?: number;
  votes_count?: number;
  checklist_items_total?: number;
  checklist_items_completed?: number;
}

export interface BoardColumn {
  id: number;
  board_id: number;
  name: string;
  order?: number;
  wip_limit?: number;
  card_count?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Board {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  type?: 'kanban' | 'scrum';
  is_active?: boolean;
  columns?: BoardColumn[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Sprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status?: 'planned' | 'active' | 'completed' | 'cancelled';
  velocity?: number;
  completed_points?: number;
  total_points?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Epic {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  color?: string;
  status?: 'active' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  progress?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Backlog {
  id: number;
  project_id: number;
  card_id?: number;
  epic_id?: number;
  sprint_id?: number;
  type: 'product' | 'sprint';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  status?: 'todo' | 'in_progress' | 'done';
  order?: number;
  card?: BoardCard;
  epic?: Epic;
  sprint?: Sprint;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}