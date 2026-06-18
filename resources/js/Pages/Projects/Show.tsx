import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import {
  Edit,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Target,
  FileText,
  MessageSquare,
  Plus,
  Kanban,
  Layers,
  ChevronRight,
  Trash2,
  Search,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project } from '@/types';
import BoardView from '@/Pages/Projects/Board';
import { BacklogItem } from '@/types/BacklogItem';
import BacklogModal from '@/Components/Projects/BacklogModal';

interface ProjectShowProps {
  auth: { user: any };
  project: Project;
  board?: any;
  columns?: any[];
  cards?: any[];
  productBacklog?: any[];
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const formatCurrency = (amount: number | null | undefined) =>
  amount != null ? `$${amount.toLocaleString()}` : '—';

const formatDate = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function ProjectShow({
  auth,
  project,
  board,
  columns = [],
  cards = [],
  productBacklog = [],
}: ProjectShowProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

  const [backlogItems, setBacklogItems] = React.useState<any[]>(productBacklog);
  const [loadingBacklog, setLoadingBacklog] = React.useState(false);
  const [backlogError, setBacklogError] = React.useState<string | null>(null);
  const [showBacklogModal, setShowBacklogModal] = React.useState(false);
  const [editingBacklogItem, setEditingBacklogItem] = React.useState<any | null>(null);
  const [backlogSearch, setBacklogSearch] = React.useState('');
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

  const showMilestones = project.enable_milestones ?? true;
  const showBoards = project.enable_boards ?? true;

  const completedMilestones = project.milestones?.filter((m) => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const totalHoursLogged = project.time_logs?.reduce((s: number, l: any) => s + (l.hours || 0), 0) || 0;

  const filteredBacklog = React.useMemo(() => {
    if (!backlogSearch) return backlogItems;
    const q = backlogSearch.toLowerCase();
    return backlogItems.filter((i) => i.title?.toLowerCase().includes(q));
  }, [backlogItems, backlogSearch]);

  const handleSaveBacklog = (item: BacklogItem) => {
    setLoadingBacklog(true);
    setBacklogError(null);
    const isEdit = !!item.id;
    const url = isEdit ? route('agile.backlog.update', item.id) : route('agile.backlog.store', project.id);
    const method = isEdit ? 'put' : 'post';
    router[method](url, { ...item }, {
      preserveState: true,
      onSuccess: (page: any) => {
        setShowBacklogModal(false);
        setEditingBacklogItem(null);
        setBacklogItems(page.props.productBacklog || []);
        setLoadingBacklog(false);
      },
      onError: () => {
        setBacklogError('Failed to save backlog item');
        setLoadingBacklog(false);
      },
    });
  };

  const handleDeleteBacklog = (id: number) => {
    setLoadingBacklog(true);
    router.delete(route('agile.backlog.destroy', id), {
      preserveState: true,
      onSuccess: (page: any) => {
        setBacklogItems(page.props.productBacklog || []);
        setLoadingBacklog(false);
        setDeleteConfirm(null);
      },
      onError: () => {
        setBacklogError('Failed to delete backlog item');
        setLoadingBacklog(false);
      },
    });
  };

  const defaultTab = showMilestones ? 'milestones' : showBoards ? 'board' : 'files';

  return (
    <AppLayout
      title={project.name}
      renderHeader={() => (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href={route('projects.index')} className="hover:text-foreground">
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate">{project.name}</span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{project.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={statusColors[project.status || 'draft']}>
                {(project.status || 'draft').replace('-', ' ')}
              </Badge>
              <Badge className={priorityColors[project.priority || 'medium']}>
                {project.priority || 'medium'} priority
              </Badge>
              {project.category && (
                <Badge variant="outline">{project.category}</Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {showBoards && board && (
              <Button variant="outline" size="sm" asChild>
                <Link href={route('projects.kanban', project.id)}>
                  <Kanban className="mr-2 h-4 w-4" />
                  Open Board
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={route('projects.livechat', project.id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </Link>
            </Button>
            {hasPermission('projects.edit') && (
              <Button size="sm" asChild>
                <Link href={route('projects.edit', project.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={project.name} />

      <div className="space-y-6 pb-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Progress', value: `${project.progress || 0}%` },
            { label: 'Milestones', value: `${completedMilestones}/${totalMilestones}` },
            { label: 'Hours logged', value: `${totalHoursLogged}h` },
            { label: 'Deadline', value: formatDate(project.deadline) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Overview + sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
              <CardDescription>
                {project.description || 'No description provided.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall progress</span>
                  <span className="font-medium">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} />
              </div>
              {project.budget != null && (
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="font-medium">
                      {formatCurrency(project.spent_amount)} / {formatCurrency(project.budget)}
                    </span>
                  </div>
                  <Progress
                    value={project.budget ? Math.min(100, ((project.spent_amount || 0) / project.budget) * 100) : 0}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                project.client && { label: 'Client', value: project.client.name },
                { label: 'Manager', value: project.manager?.name || '—' },
                project.start_date && { label: 'Start', value: formatDate(project.start_date) },
                project.deadline && { label: 'Deadline', value: formatDate(project.deadline) },
                project.budget && { label: 'Budget', value: formatCurrency(project.budget) },
              ]
                .filter(Boolean)
                .map((row: any) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-right font-medium">{row.value}</span>
                  </div>
                ))}
              {project.team && project.team.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-muted-foreground">Team</p>
                  <div className="flex flex-wrap gap-2">
                    {project.team.map((member: any) => (
                      <Badge key={member.id} variant="secondary">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Work tabs */}
        <Tabs defaultValue={defaultTab}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            {showMilestones && (
              <TabsTrigger value="milestones" className="gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Milestones
                {totalMilestones > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">({totalMilestones})</span>
                )}
              </TabsTrigger>
            )}
            {showBoards && (
              <TabsTrigger value="board" className="gap-1.5">
                <Kanban className="h-3.5 w-3.5" />
                Board
              </TabsTrigger>
            )}
            {showBoards && (
              <TabsTrigger value="backlog" className="gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Backlog
                {backlogItems.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">({backlogItems.length})</span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="files" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Files
            </TabsTrigger>
            <TabsTrigger value="time-logs" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Time
            </TabsTrigger>
          </TabsList>

          {showMilestones && (
            <TabsContent value="milestones" className="mt-4 space-y-3">
              <div className="flex justify-end">
                {hasPermission('projects.milestones.create') && (
                  <Button size="sm" asChild>
                    <Link href={route('projects.milestones.create', { project: project.id })}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add milestone
                    </Link>
                  </Button>
                )}
              </div>
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((milestone: any) => (
                  <Card key={milestone.id}>
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={route('projects.milestones.show', [project.id, milestone.id])}
                            className="font-medium hover:underline"
                          >
                            {milestone.name}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {milestone.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          {milestone.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(milestone.due_date)}
                            </span>
                          )}
                          <span>{milestone.progress}% complete</span>
                        </div>
                        <Progress value={milestone.progress} className="mt-2 h-1.5" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No milestones yet.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {showBoards && (
            <TabsContent value="board" className="mt-4">
              {board && columns.length > 0 ? (
                <BoardView
                  auth={auth}
                  project={project}
                  board={board}
                  columns={columns}
                  cards={cards}
                  embedded
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                    <Kanban className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">No board yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create a board to organize work in columns.
                      </p>
                    </div>
                    {hasPermission('projects.edit') && (
                      <Button asChild>
                        <Link href={route('agile.boards.create', project.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create board
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {showBoards && (
            <TabsContent value="backlog" className="mt-4 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-xs flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={backlogSearch}
                    onChange={(e) => setBacklogSearch(e.target.value)}
                    placeholder="Search backlog..."
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={route('agile.backlog.index', project.id)}>View all</Link>
                  </Button>
                  {hasPermission('projects.edit') && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingBacklogItem(null);
                        setShowBacklogModal(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add item
                    </Button>
                  )}
                </div>
              </div>

              {backlogError && (
                <p className="text-sm text-destructive">{backlogError}</p>
              )}

              {filteredBacklog.length > 0 ? (
                filteredBacklog.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="font-medium">{item.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge className={priorityColors[item.priority] || priorityColors.medium} variant="secondary">
                            {item.priority}
                          </Badge>
                          {item.story_points != null && <span>{item.story_points} pts</span>}
                          {item.assignee && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                      {hasPermission('projects.edit') && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteConfirm(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    {backlogSearch ? 'No matching items.' : 'No backlog items yet.'}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          <TabsContent value="files" className="mt-4 space-y-3">
            <div className="flex justify-end">
              {hasPermission('projects.files.create') && (
                <Button size="sm" asChild>
                  <Link href={route('projects.files.create', { project: project.id })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload file
                  </Link>
                </Button>
              )}
            </div>
            {project.files && project.files.length > 0 ? (
              project.files.map((file: any) => (
                <Card key={file.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size_formatted} · {file.uploader?.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No files uploaded.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="time-logs" className="mt-4 space-y-3">
            <div className="flex justify-end">
              {hasPermission('projects.time-logs.create') && (
                <Button size="sm" asChild>
                  <Link href={route('projects.time-logs.create', { project: project.id })}>
                    <Plus className="mr-2 h-4 w-4" />
                    Log time
                  </Link>
                </Button>
              )}
            </div>
            {project.time_logs && project.time_logs.length > 0 ? (
              project.time_logs.map((log: any) => (
                <Card key={log.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{log.user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.description || 'No description'}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{log.hours}h</p>
                      <p className="text-muted-foreground">{formatDate(log.log_date)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No time logged yet.
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showBacklogModal && (
        <BacklogModal
          projectId={project.id}
          onClose={() => {
            setShowBacklogModal(false);
            setEditingBacklogItem(null);
          }}
          onSave={handleSaveBacklog}
          backlogItem={editingBacklogItem}
          cards={[]}
          epics={[]}
          sprints={[]}
          users={project.team_members || []}
        />
      )}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <Card className="relative z-10 w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-base">Delete backlog item?</CardTitle>
              <CardDescription>This action cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={loadingBacklog}
                onClick={() => handleDeleteBacklog(deleteConfirm)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
