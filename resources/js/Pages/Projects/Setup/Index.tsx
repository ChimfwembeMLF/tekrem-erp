import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import {
  Settings,
  CheckSquare,
  Clock,
  Target,
  Users,
  Brain,
  Save,
  RefreshCw
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface ProjectSetupProps {
  auth: {
    user: any;
  };
  generalSettings: {
    project_id_format: string;
    project_prefix: string;
    enable_project_templates: boolean;
    enable_project_categories: boolean;
    enable_project_tags: boolean;
    enable_project_budgets: boolean;
    enable_client_access: boolean;
    enable_project_analytics: boolean;
    default_project_status: string;
    auto_archive_completed: boolean;
    archive_delay_days: number;
    enable_project_approval: boolean;
  };
  taskSettings: {
    enable_task_dependencies: boolean;
    enable_task_priorities: boolean;
    enable_task_estimates: boolean;
    enable_task_comments: boolean;
    enable_task_attachments: boolean;
    enable_subtasks: boolean;
    enable_task_templates: boolean;
    auto_assign_tasks: boolean;
    task_assignment_method: string;
    enable_task_notifications: boolean;
    default_task_priority: string;
  };
  timeTrackingSettings: {
    enable_time_tracking: boolean;
    enable_manual_time_entry: boolean;
    enable_timer_tracking: boolean;
    enable_time_approval: boolean;
    minimum_time_increment: number;
    enable_billable_hours: boolean;
    default_hourly_rate: number;
    enable_overtime_tracking: boolean;
    overtime_threshold_hours: number;
    enable_time_reports: boolean;
  };
  milestoneSettings: {
    enable_milestones: boolean;
    enable_milestone_dependencies: boolean;
    enable_milestone_budgets: boolean;
    enable_milestone_approval: boolean;
    auto_create_milestones: boolean;
    milestone_notification_days: number;
    enable_milestone_reports: boolean;
  };
  collaborationSettings: {
    enable_team_chat: boolean;
    enable_file_sharing: boolean;
    enable_document_collaboration: boolean;
    enable_project_discussions: boolean;
    enable_activity_feeds: boolean;
    enable_mentions: boolean;
    enable_email_notifications: boolean;
    max_file_size_mb: number;
    allowed_file_types: string[];
  };
  aiSettings: {
    enable_ai_planning: boolean;
    enable_ai_task_generation: boolean;
    enable_ai_milestone_generation: boolean;
    enable_ai_insights: boolean;
    enable_ai_risk_analysis: boolean;
    enable_ai_resource_optimization: boolean;
    enable_ai_timeline_estimation: boolean;
    ai_confidence_threshold: number;
  };
}

export default function ProjectSetup({
  auth,
  generalSettings,
  taskSettings,
  timeTrackingSettings,
  milestoneSettings,
  collaborationSettings,
  aiSettings
}: ProjectSetupProps) {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('general');

  const generalForm = useForm(generalSettings);
  const taskForm = useForm(taskSettings);
  const timeTrackingForm = useForm(timeTrackingSettings);
  const milestoneForm = useForm(milestoneSettings);
  const collaborationForm = useForm(collaborationSettings);
  const aiForm = useForm(aiSettings);

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generalForm.post(route('projects.setup.update-general'), {
      preserveScroll: true,
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    taskForm.post(route('projects.setup.update-tasks'), {
      preserveScroll: true,
    });
  };

  const handleTimeTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    timeTrackingForm.post(route('projects.setup.update-time-tracking'), {
      preserveScroll: true,
    });
  };

  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    milestoneForm.post(route('projects.setup.update-milestones'), {
      preserveScroll: true,
    });
  };

  const handleCollaborationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    collaborationForm.post(route('projects.setup.update-collaboration'), {
      preserveScroll: true,
    });
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    aiForm.post(route('projects.setup.update-ai'), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      title="Project Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Project Module Settings
          </h2>
          <Badge variant="outline" className="ml-2">
            <Settings className="h-3 w-3 mr-1" />
            Configuration
          </Badge>
        </div>
      )}
    >
      <Head title="Project Settings" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Management Configuration</CardTitle>
            <CardDescription>
              Configure settings for the project management module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general">
                  <Settings className="h-4 w-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="time">
                  <Clock className="h-4 w-4 mr-2" />
                  Time
                </TabsTrigger>
                <TabsTrigger value="milestones">
                  <Target className="h-4 w-4 mr-2" />
                  Milestones
                </TabsTrigger>
                <TabsTrigger value="collaboration">
                  <Users className="h-4 w-4 mr-2" />
                  Collaboration
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Brain className="h-4 w-4 mr-2" />
                  AI
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="project_id_format">Project ID Format</Label>
                      <Input
                        id="project_id_format"
                        value={generalForm.data.project_id_format}
                        onChange={(e) => generalForm.setData('project_id_format', e.target.value)}
                        placeholder="PRJ-{YYYY}-{####}"
                      />
                      {generalForm.errors.project_id_format && (
                        <p className="text-sm text-red-600">{generalForm.errors.project_id_format}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_prefix">Project Prefix</Label>
                      <Input
                        id="project_prefix"
                        value={generalForm.data.project_prefix || ''}
                        onChange={(e) => generalForm.setData('project_prefix', e.target.value)}
                        placeholder="PRJ"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_project_status">Default Project Status</Label>
                      <Select
                        value={generalForm.data.default_project_status}
                        onValueChange={(value) => generalForm.setData('default_project_status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="archive_delay_days">Archive Delay (Days)</Label>
                      <Input
                        id="archive_delay_days"
                        type="number"
                        value={generalForm.data.archive_delay_days}
                        onChange={(e) => generalForm.setData('archive_delay_days', parseInt(e.target.value))}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_templates">Enable Project Templates</Label>
                      <Switch
                        id="enable_project_templates"
                        checked={generalForm.data.enable_project_templates}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_templates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_categories">Enable Project Categories</Label>
                      <Switch
                        id="enable_project_categories"
                        checked={generalForm.data.enable_project_categories}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_categories', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_tags">Enable Project Tags</Label>
                      <Switch
                        id="enable_project_tags"
                        checked={generalForm.data.enable_project_tags}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_tags', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_budgets">Enable Project Budgets</Label>
                      <Switch
                        id="enable_project_budgets"
                        checked={generalForm.data.enable_project_budgets}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_budgets', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_client_access">Enable Client Access</Label>
                      <Switch
                        id="enable_client_access"
                        checked={generalForm.data.enable_client_access}
                        onCheckedChange={(checked) => generalForm.setData('enable_client_access', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_analytics">Enable Project Analytics</Label>
                      <Switch
                        id="enable_project_analytics"
                        checked={generalForm.data.enable_project_analytics}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_analytics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_archive_completed">Auto Archive Completed Projects</Label>
                      <Switch
                        id="auto_archive_completed"
                        checked={generalForm.data.auto_archive_completed}
                        onCheckedChange={(checked) => generalForm.setData('auto_archive_completed', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_approval">Enable Project Approval</Label>
                      <Switch
                        id="enable_project_approval"
                        checked={generalForm.data.enable_project_approval}
                        onCheckedChange={(checked) => generalForm.setData('enable_project_approval', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={generalForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save General Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Task Settings */}
              <TabsContent value="tasks">
                <form onSubmit={handleTaskSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="task_assignment_method">Task Assignment Method</Label>
                      <Select
                        value={taskForm.data.task_assignment_method}
                        onValueChange={(value) => taskForm.setData('task_assignment_method', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="round_robin">Round Robin</SelectItem>
                          <SelectItem value="workload_based">Workload Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_task_priority">Default Task Priority</Label>
                      <Select
                        value={taskForm.data.default_task_priority}
                        onValueChange={(value) => taskForm.setData('default_task_priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_dependencies">Enable Task Dependencies</Label>
                      <Switch
                        id="enable_task_dependencies"
                        checked={taskForm.data.enable_task_dependencies}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_dependencies', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_priorities">Enable Task Priorities</Label>
                      <Switch
                        id="enable_task_priorities"
                        checked={taskForm.data.enable_task_priorities}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_priorities', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_estimates">Enable Task Estimates</Label>
                      <Switch
                        id="enable_task_estimates"
                        checked={taskForm.data.enable_task_estimates}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_estimates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_comments">Enable Task Comments</Label>
                      <Switch
                        id="enable_task_comments"
                        checked={taskForm.data.enable_task_comments}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_comments', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_attachments">Enable Task Attachments</Label>
                      <Switch
                        id="enable_task_attachments"
                        checked={taskForm.data.enable_task_attachments}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_attachments', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_subtasks">Enable Subtasks</Label>
                      <Switch
                        id="enable_subtasks"
                        checked={taskForm.data.enable_subtasks}
                        onCheckedChange={(checked) => taskForm.setData('enable_subtasks', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_templates">Enable Task Templates</Label>
                      <Switch
                        id="enable_task_templates"
                        checked={taskForm.data.enable_task_templates}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_templates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_assign_tasks">Auto Assign Tasks</Label>
                      <Switch
                        id="auto_assign_tasks"
                        checked={taskForm.data.auto_assign_tasks}
                        onCheckedChange={(checked) => taskForm.setData('auto_assign_tasks', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_task_notifications">Enable Task Notifications</Label>
                      <Switch
                        id="enable_task_notifications"
                        checked={taskForm.data.enable_task_notifications}
                        onCheckedChange={(checked) => taskForm.setData('enable_task_notifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={taskForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Task Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Time Tracking Settings */}
              <TabsContent value="time">
                <form onSubmit={handleTimeTrackingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="minimum_time_increment">Minimum Time Increment (minutes)</Label>
                      <Input
                        id="minimum_time_increment"
                        type="number"
                        value={timeTrackingForm.data.minimum_time_increment}
                        onChange={(e) => timeTrackingForm.setData('minimum_time_increment', parseInt(e.target.value))}
                        min="1"
                        max="60"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_hourly_rate">Default Hourly Rate ($)</Label>
                      <Input
                        id="default_hourly_rate"
                        type="number"
                        value={timeTrackingForm.data.default_hourly_rate}
                        onChange={(e) => timeTrackingForm.setData('default_hourly_rate', parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overtime_threshold_hours">Overtime Threshold (hours)</Label>
                      <Input
                        id="overtime_threshold_hours"
                        type="number"
                        value={timeTrackingForm.data.overtime_threshold_hours}
                        onChange={(e) => timeTrackingForm.setData('overtime_threshold_hours', parseInt(e.target.value))}
                        min="1"
                        max="24"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_time_tracking">Enable Time Tracking</Label>
                      <Switch
                        id="enable_time_tracking"
                        checked={timeTrackingForm.data.enable_time_tracking}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_time_tracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_manual_time_entry">Enable Manual Time Entry</Label>
                      <Switch
                        id="enable_manual_time_entry"
                        checked={timeTrackingForm.data.enable_manual_time_entry}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_manual_time_entry', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_timer_tracking">Enable Timer Tracking</Label>
                      <Switch
                        id="enable_timer_tracking"
                        checked={timeTrackingForm.data.enable_timer_tracking}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_timer_tracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_time_approval">Enable Time Approval</Label>
                      <Switch
                        id="enable_time_approval"
                        checked={timeTrackingForm.data.enable_time_approval}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_time_approval', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_billable_hours">Enable Billable Hours</Label>
                      <Switch
                        id="enable_billable_hours"
                        checked={timeTrackingForm.data.enable_billable_hours}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_billable_hours', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_overtime_tracking">Enable Overtime Tracking</Label>
                      <Switch
                        id="enable_overtime_tracking"
                        checked={timeTrackingForm.data.enable_overtime_tracking}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_overtime_tracking', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_time_reports">Enable Time Reports</Label>
                      <Switch
                        id="enable_time_reports"
                        checked={timeTrackingForm.data.enable_time_reports}
                        onCheckedChange={(checked) => timeTrackingForm.setData('enable_time_reports', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={timeTrackingForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Time Tracking Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Milestone Settings */}
              <TabsContent value="milestones">
                <form onSubmit={handleMilestoneSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="milestone_notification_days">Milestone Notification Days</Label>
                      <Input
                        id="milestone_notification_days"
                        type="number"
                        value={milestoneForm.data.milestone_notification_days}
                        onChange={(e) => milestoneForm.setData('milestone_notification_days', parseInt(e.target.value))}
                        min="1"
                        max="90"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_milestones">Enable Milestones</Label>
                      <Switch
                        id="enable_milestones"
                        checked={milestoneForm.data.enable_milestones}
                        onCheckedChange={(checked) => milestoneForm.setData('enable_milestones', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_milestone_dependencies">Enable Milestone Dependencies</Label>
                      <Switch
                        id="enable_milestone_dependencies"
                        checked={milestoneForm.data.enable_milestone_dependencies}
                        onCheckedChange={(checked) => milestoneForm.setData('enable_milestone_dependencies', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_milestone_budgets">Enable Milestone Budgets</Label>
                      <Switch
                        id="enable_milestone_budgets"
                        checked={milestoneForm.data.enable_milestone_budgets}
                        onCheckedChange={(checked) => milestoneForm.setData('enable_milestone_budgets', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_milestone_approval">Enable Milestone Approval</Label>
                      <Switch
                        id="enable_milestone_approval"
                        checked={milestoneForm.data.enable_milestone_approval}
                        onCheckedChange={(checked) => milestoneForm.setData('enable_milestone_approval', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto_create_milestones">Auto Create Milestones</Label>
                      <Switch
                        id="auto_create_milestones"
                        checked={milestoneForm.data.auto_create_milestones}
                        onCheckedChange={(checked) => milestoneForm.setData('auto_create_milestones', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_milestone_reports">Enable Milestone Reports</Label>
                      <Switch
                        id="enable_milestone_reports"
                        checked={milestoneForm.data.enable_milestone_reports}
                        onCheckedChange={(checked) => milestoneForm.setData('enable_milestone_reports', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={milestoneForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Milestone Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Collaboration Settings */}
              <TabsContent value="collaboration">
                <form onSubmit={handleCollaborationSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="max_file_size_mb">Max File Size (MB)</Label>
                      <Input
                        id="max_file_size_mb"
                        type="number"
                        value={collaborationForm.data.max_file_size_mb}
                        onChange={(e) => collaborationForm.setData('max_file_size_mb', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_team_chat">Enable Team Chat</Label>
                      <Switch
                        id="enable_team_chat"
                        checked={collaborationForm.data.enable_team_chat}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_team_chat', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_file_sharing">Enable File Sharing</Label>
                      <Switch
                        id="enable_file_sharing"
                        checked={collaborationForm.data.enable_file_sharing}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_file_sharing', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_document_collaboration">Enable Document Collaboration</Label>
                      <Switch
                        id="enable_document_collaboration"
                        checked={collaborationForm.data.enable_document_collaboration}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_document_collaboration', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_project_discussions">Enable Project Discussions</Label>
                      <Switch
                        id="enable_project_discussions"
                        checked={collaborationForm.data.enable_project_discussions}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_project_discussions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_activity_feeds">Enable Activity Feeds</Label>
                      <Switch
                        id="enable_activity_feeds"
                        checked={collaborationForm.data.enable_activity_feeds}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_activity_feeds', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_mentions">Enable Mentions</Label>
                      <Switch
                        id="enable_mentions"
                        checked={collaborationForm.data.enable_mentions}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_mentions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_email_notifications">Enable Email Notifications</Label>
                      <Switch
                        id="enable_email_notifications"
                        checked={collaborationForm.data.enable_email_notifications}
                        onCheckedChange={(checked) => collaborationForm.setData('enable_email_notifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={collaborationForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Collaboration Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* AI Settings */}
              <TabsContent value="ai">
                <form onSubmit={handleAISubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="ai_confidence_threshold">AI Confidence Threshold (%)</Label>
                      <Input
                        id="ai_confidence_threshold"
                        type="number"
                        value={aiForm.data.ai_confidence_threshold}
                        onChange={(e) => aiForm.setData('ai_confidence_threshold', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_planning">Enable AI Planning</Label>
                      <Switch
                        id="enable_ai_planning"
                        checked={aiForm.data.enable_ai_planning}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_planning', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_task_generation">Enable AI Task Generation</Label>
                      <Switch
                        id="enable_ai_task_generation"
                        checked={aiForm.data.enable_ai_task_generation}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_task_generation', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_milestone_generation">Enable AI Milestone Generation</Label>
                      <Switch
                        id="enable_ai_milestone_generation"
                        checked={aiForm.data.enable_ai_milestone_generation}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_milestone_generation', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_insights">Enable AI Insights</Label>
                      <Switch
                        id="enable_ai_insights"
                        checked={aiForm.data.enable_ai_insights}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_insights', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_risk_analysis">Enable AI Risk Analysis</Label>
                      <Switch
                        id="enable_ai_risk_analysis"
                        checked={aiForm.data.enable_ai_risk_analysis}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_risk_analysis', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_resource_optimization">Enable AI Resource Optimization</Label>
                      <Switch
                        id="enable_ai_resource_optimization"
                        checked={aiForm.data.enable_ai_resource_optimization}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_resource_optimization', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable_ai_timeline_estimation">Enable AI Timeline Estimation</Label>
                      <Switch
                        id="enable_ai_timeline_estimation"
                        checked={aiForm.data.enable_ai_timeline_estimation}
                        onCheckedChange={(checked) => aiForm.setData('enable_ai_timeline_estimation', checked)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={aiForm.processing}>
                      <Save className="h-4 w-4 mr-2" />
                      Save AI Settings
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
