export interface BacklogItem {
  id?: number;
  project_id: number;
  card_id?: number;
  epic_id?: number;
  type: 'product' | 'sprint';
  sprint_id?: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  status?: 'todo' | 'in_progress' | 'done' | 'ready' | 'removed';
  assigned_to?: number;
  order?: number;
  metadata?: Record<string, any>;
}
