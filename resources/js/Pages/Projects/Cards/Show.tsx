import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Progress } from '@/Components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/Components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Edit,
  Trash2,
  Calendar,
  Target,
  Users,
  Flag,
  FolderOpen,
  MessageSquare,
  Paperclip,
  User as UserIcon,
  History,
  Layers,
  Upload,
  X,
  Send,
  ChevronRight,
  MoreVertical,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowUpRight,
  Zap,
  Tag,
  Link2,
  Copy,
  Download,
  ExternalLink,
  Activity,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  Hash,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
  Check,
  Info,
  Smile,
  AtSign,
  AlignLeft,
  CalendarDays,
  BarChart3,
  Shield,
  GitBranch,
  Timer,
  Flame,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/Components/ui/select';
import useRoute from '@/Hooks/useRoute';
import { LinkedItemIndicator } from '@/Components/HybridSync';
import MarkdownEditor from '@/Components/PM/MarkdownEditor';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChecklistItemReminder {
  id: number | string;
  remind_at: string;
  notified: boolean;
}

interface ChecklistItem {
  id: number | string;
  name: string;
  completed: boolean;
  due_date?: string;
  assignee?: { id: number | string; name: string; avatar?: string };
  reminders?: ChecklistItemReminder[];
}

interface Checklist {
  id: number | string;
  title: string;
  items: ChecklistItem[];
}

interface Comment {
  id: number | string;
  body?: string;
  comment?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: number | string; name?: string; avatar?: string };
  reactions?: Array<{ emoji: string; users: Array<{ id: number | string; name: string }> }>;
}

interface Attachment {
  id: number | string;
  name?: string;
  file_name?: string;
  file_url?: string;
  url?: string;
  path?: string;
  size?: number;
  mime_type?: string;
  description?: string;
  created_at?: string;
  uploaded_by?: { id: number | string; name?: string; avatar?: string };
}

interface ActivityLog {
  id: number | string;
  description?: string;
  action?: string;
  created_at?: string;
  user?: { id: number | string; name?: string; avatar?: string };
  metadata?: Record<string, any>;
}

interface BoardCard {
  id: number;
  title: string;
  description?: string;
  type: 'story' | 'task' | 'bug' | 'epic';
  priority: 'low' | 'medium' | 'high' | 'critical';
  story_points?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  position?: number;
  labels?: Array<{ id: number | string; name: string; color: string }>;
  assignee?: { id: number | string; name?: string; avatar?: string; email?: string };
  reporter?: { id: number | string; name?: string; avatar?: string; email?: string };
  column: { id: number | string; name: string; color?: string };
  board: { id: number; name: string };
  sprint?: { id: number | string; name: string; status?: string };
  epic?: { id: number | string; name: string; color?: string };
  task?: { id: number | string; title?: string; name?: string; description?: string; status?: string };
  comments?: Comment[];
  attachments?: Attachment[];
  activity_logs?: ActivityLog[];
  invitations?: Array<{ id: number | string; email?: string; user?: { id: number | string; name?: string; avatar?: string }; status?: string; created_at?: string }>;
  checklists?: Checklist[];
  subscribers?: Array<{ id: number | string; user?: { id: number | string; name?: string; avatar?: string } }>;
  votes?: Array<{ id: number | string; user?: { id: number | string; name?: string }; type?: 'up' | 'down' }>;
  watchers?: Array<{ id: number | string; user?: { id: number | string; name?: string; avatar?: string } }>;
  estimated_hours?: number;
  logged_hours?: number;
  blocked_by?: Array<{ id: number | string; title: string }>;
  blocks?: Array<{ id: number | string; title: string }>;
  related?: Array<{ id: number | string; title: string }>;
}

interface CardShowProps {
  auth: { user: any };
  card: BoardCard;
  project?: any;
  board: {
    id: number;
    name: string;
    columns: Array<{ id: number | string; name: string; color?: string }>;
    members: Array<{ id: number | string; user?: { id: number | string; name?: string; avatar?: string; email?: string } }>;
  };
  board_invitations?: Array<any>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  low:      { label: 'Low',      icon: <Circle       className="h-3 w-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  medium:   { label: 'Medium',   icon: <Zap          className="h-3 w-3" />, cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  high:     { label: 'High',     icon: <Flame        className="h-3 w-3" />, cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  critical: { label: 'Critical', icon: <AlertCircle  className="h-3 w-3" />, cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
} as const;

const TYPE_CONFIG = {
  story: { label: 'Story', icon: <BookmarkCheck className="h-3 w-3" />, cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  task:  { label: 'Task',  icon: <CheckSquare  className="h-3 w-3" />, cls: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700' },
  bug:   { label: 'Bug',   icon: <AlertCircle  className="h-3 w-3" />, cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
  epic:  { label: 'Epic',  icon: <Zap          className="h-3 w-3" />, cls: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
} as const;

const FILE_ICONS: Record<string, React.ReactNode> = {
  'image/': <ImageIcon className="h-4 w-4 text-blue-500" />,
  'application/pdf': <FileText className="h-4 w-4 text-red-500" />,
  'text/': <AlignLeft className="h-4 w-4 text-gray-500" />,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

const fmtDateShort = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

const fmtRelative = (d?: string) => {
  if (!d) return 'N/A';
  const diff = Date.now() - new Date(d).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 30) return `${day}d ago`;
  return fmtDateShort(d);
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <File className="h-4 w-4 text-gray-400" />;
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (mimeType.startsWith(key)) return icon;
  }
  return <File className="h-4 w-4 text-gray-400" />;
};

const attachmentUrl = (a: Attachment) =>
  a.file_url || a.url || (a.path ? `/uploads/${a.path}` : null);

const attachmentName = (a: Attachment) =>
  a.name || a.file_name || 'Attachment';

const getUserInitials = (name?: string) =>
  (name || '?').split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

const isOverdue = (due_date?: string) =>
  due_date ? new Date(due_date) < new Date() : false;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface UserAvatarProps {
  user?: { id?: number | string; name?: string; avatar?: string };
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
}

function UserAvatar({ user, size = 'sm', showTooltip = true }: UserAvatarProps) {
  const sizeMap = { xs: 'h-5 w-5 text-[9px]', sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm' };
  const avatar = (
    <Avatar className={cn(sizeMap[size], 'ring-2 ring-white dark:ring-gray-900 shrink-0')}>
      {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-semibold">
        {getUserInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
  if (!showTooltip) return avatar;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{avatar}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{user?.name || 'Unknown'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: number | string;
  action?: React.ReactNode;
  description?: string;
}

function SectionHeader({ icon, title, badge, action, description }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 pb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
          <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</h3>
            {badge !== undefined && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 tabular-nums">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  description?: string;
}

function EmptyState({ icon, message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{message}</p>
      {description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

// ─── Checklist Component ──────────────────────────────────────────────────────

interface ChecklistSectionProps {
  checklists: Checklist[];
  cardId: number;
  route: ReturnType<typeof useRoute>;
}

function ChecklistSection({ checklists, cardId, route }: ChecklistSectionProps) {
  const [expandedChecklists, setExpandedChecklists] = useState<Set<string | number>>(
    new Set(checklists.map((cl) => cl.id))
  );
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [newItemTexts, setNewItemTexts] = useState<Record<string | number, string>>({});
  const [addingItemFor, setAddingItemFor] = useState<string | number | null>(null);

  const totalItems = checklists.reduce((acc, cl) => acc + cl.items.length, 0);
  const completedItems = checklists.reduce(
    (acc, cl) => acc + cl.items.filter((i) => i.completed).length,
    0
  );
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const toggleExpand = (id: string | number) => {
    setExpandedChecklists((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleItem = (checklistId: string | number, itemId: string | number, completed: boolean) => {
    router.put(
      route('agile.cards.checklists.items.update', [cardId, checklistId, itemId]),
      { completed },
      { preserveScroll: true }
    );
  };

  const handleAddChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    router.post(
      route('agile.cards.checklists.store', cardId),
      { title: newChecklistTitle },
      {
        preserveScroll: true,
        onSuccess: () => { setNewChecklistTitle(''); setAddingChecklist(false); },
      }
    );
  };

  const handleAddItem = (checklistId: string | number) => {
    const text = newItemTexts[checklistId]?.trim();
    if (!text) return;
    router.post(
      route('agile.cards.checklists.items.store', [cardId, checklistId]),
      { name: text },
      {
        preserveScroll: true,
        onSuccess: () => {
          setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }));
          setAddingItemFor(null);
        },
      }
    );
  };

  const handleDeleteChecklist = (checklistId: string | number) => {
    if (!confirm('Delete this checklist?')) return;
    router.delete(route('agile.cards.checklists.destroy', [cardId, checklistId]), {
      preserveScroll: true,
    });
  };

  return (
    <div className="space-y-4">
      {totalItems > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Overall Progress</span>
            <span className="tabular-nums font-semibold text-gray-700 dark:text-gray-300">
              {completedItems}/{totalItems}
              <span className="ml-1.5 text-gray-400">({progressPct}%)</span>
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-in-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {checklists.map((cl) => {
        const done = cl.items.filter((i) => i.completed).length;
        const pct = cl.items.length > 0 ? Math.round((done / cl.items.length) * 100) : 0;
        const isExpanded = expandedChecklists.has(cl.id);

        return (
          <div key={cl.id} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
              onClick={() => toggleExpand(cl.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{cl.title}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {done}/{cl.items.length}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="text-sm">
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={(e) => { e.stopPropagation(); handleDeleteChecklist(cl.id); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete checklist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-800">
                {cl.items.length === 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 px-4 py-3">No items yet.</p>
                )}
                <ul className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {cl.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-2.5 group hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={(checked) =>
                          handleToggleItem(cl.id, item.id, checked as boolean)
                        }
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`item-${item.id}`}
                          className={cn(
                            'text-sm cursor-pointer leading-snug',
                            item.completed
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-800 dark:text-gray-200'
                          )}
                        >
                          {item.name}
                        </label>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {item.due_date && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 text-[10px]',
                                isOverdue(item.due_date) && !item.completed
                                  ? 'text-red-500'
                                  : 'text-gray-400'
                              )}
                            >
                              <CalendarDays className="h-2.5 w-2.5" />
                              {fmtDateShort(item.due_date)}
                            </span>
                          )}
                          {item.reminders && item.reminders.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-400">
                              <Bell className="h-2.5 w-2.5" />
                              {item.reminders.length} reminder{item.reminders.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {item.assignee && (
                            <UserAvatar user={item.assignee} size="xs" />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="px-4 py-3 border-t border-gray-50 dark:border-gray-800/60">
                  {addingItemFor === cl.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        autoFocus
                        value={newItemTexts[cl.id] || ''}
                        onChange={(e) =>
                          setNewItemTexts((prev) => ({ ...prev, [cl.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddItem(cl.id);
                          if (e.key === 'Escape') setAddingItemFor(null);
                        }}
                        placeholder="Add item..."
                        className="h-8 text-sm"
                      />
                      <Button size="sm" className="h-8 shrink-0" onClick={() => handleAddItem(cl.id)}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 shrink-0"
                        onClick={() => setAddingItemFor(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingItemFor(cl.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add item
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {addingChecklist ? (
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3">
          <Input
            autoFocus
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddChecklist();
              if (e.key === 'Escape') setAddingChecklist(false);
            }}
            placeholder="Checklist title..."
            className="h-8 text-sm"
          />
          <Button size="sm" className="h-8 shrink-0" onClick={handleAddChecklist}>
            Create
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 shrink-0"
            onClick={() => { setAddingChecklist(false); setNewChecklistTitle(''); }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full border-dashed text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          onClick={() => setAddingChecklist(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-2" />
          Add checklist
        </Button>
      )}
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  logs: ActivityLog[];
}

function ActivityFeed({ logs }: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? logs : logs.slice(0, 8);

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="h-4 w-4" />}
        message="No activity yet"
        description="Actions on this card will appear here"
      />
    );
  }

  return (
    <div className="space-y-0">
      <div className="relative">
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800" />
        <ul className="space-y-0">
          {visible.map((log, idx) => (
            <li key={log.id} className="relative flex gap-3 pl-8 pb-5 last:pb-0">
              <div className="absolute left-0 flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 z-10">
                <UserAvatar user={log.user} size="xs" showTooltip={false} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                  {log.user?.name && (
                    <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1">
                      {log.user.name}
                    </span>
                  )}
                  {log.description || log.action || 'performed an action'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {fmtRelative(log.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {logs.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          {showAll ? (
            <><ChevronUp className="h-3 w-3" />Show less</>
          ) : (
            <><ChevronDown className="h-3 w-3" />Show {logs.length - 8} more</>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Voters / Watchers / Subscribers ─────────────────────────────────────────

interface PeopleListProps {
  items: Array<{ id: number | string; user?: { id: number | string; name?: string; avatar?: string } }>;
  emptyMessage: string;
  onAdd?: () => void;
  onRemove?: (id: number | string) => void;
  currentUserId?: number | string;
}

function PeopleList({ items, emptyMessage, onAdd, onRemove, currentUserId }: PeopleListProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500">{emptyMessage}</p>
        {onAdd && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAdd}>
            <Plus className="h-3 w-3 mr-1" />Add
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex -space-x-1.5 flex-wrap">
        {items.slice(0, 8).map((item) => (
          <TooltipProvider key={item.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group cursor-pointer">
                  <UserAvatar user={item.user} size="sm" showTooltip={false} />
                  {onRemove && item.user?.id === currentUserId && (
                    <button
                      className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-gray-800 text-white"
                      onClick={() => onRemove(item.id)}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">{item.user?.name || 'User'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {items.length > 8 && (
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900">
            +{items.length - 8}
          </div>
        )}
      </div>
      {onAdd && (
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAdd}>
          <Plus className="h-3 w-3 mr-1" />Add
        </Button>
      )}
    </div>
  );
}

// ─── Vote Section ─────────────────────────────────────────────────────────────

interface VoteSectionProps {
  votes: BoardCard['votes'];
  cardId: number;
  currentUserId: number | string;
  route: ReturnType<typeof useRoute>;
}

function VoteSection({ votes = [], cardId, currentUserId, route }: VoteSectionProps) {
  const upVotes = votes.filter((v) => v.type === 'up' || !v.type);
  const downVotes = votes.filter((v) => v.type === 'down');
  const userVote = votes.find((v) => v.user?.id === currentUserId);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote?.type === type) {
      router.delete(route('agile.cards.votes.destroy', [cardId, userVote.id]), {
        preserveScroll: true,
      });
    } else {
      router.post(route('agile.cards.votes.store', cardId), { type }, { preserveScroll: true });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('up')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          userVote?.type === 'up'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        <span className="tabular-nums">{upVotes.length}</span>
      </button>
      <button
        onClick={() => handleVote('down')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
          userVote?.type === 'down'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
        <span className="tabular-nums">{downVotes.length}</span>
      </button>
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  currentUserId: number | string;
  cardId: number;
  route: ReturnType<typeof useRoute>;
}

function CommentItem({ comment, currentUserId, cardId, route }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body ?? comment.comment ?? '');
  const isOwn = comment.user?.id === currentUserId;

  const handleSaveEdit = () => {
    router.put(
      route('agile.cards.comments.update', [cardId, comment.id]),
      { comment: editText },
      { preserveScroll: true, onSuccess: () => setEditing(false) }
    );
  };

  const handleDelete = () => {
    if (!confirm('Delete this comment?')) return;
    router.delete(route('agile.cards.comments.destroy', [cardId, comment.id]), {
      preserveScroll: true,
    });
  };

  return (
    <div className="group flex gap-3">
      <UserAvatar user={comment.user} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="rounded-xl rounded-tl-sm bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {comment.user?.name || 'Unknown'}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {fmtRelative(comment.created_at)}
              </span>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <span className="text-[10px] text-gray-400 italic">(edited)</span>
              )}
            </div>
            {isOwn && (
              <div className="hidden group-hover:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                  onClick={() => setEditing(true)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-500"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdit}>Save</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {comment.body ?? comment.comment ?? ''}
            </p>
          )}
        </div>
        {comment.reactions && comment.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5 pl-1">
            {comment.reactions.map((r) => (
              <button
                key={r.emoji}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {r.emoji}
                <span className="tabular-nums text-gray-600 dark:text-gray-300">{r.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Attachment Item ──────────────────────────────────────────────────────────

interface AttachmentItemProps {
  attachment: Attachment;
  cardId: number;
  route: ReturnType<typeof useRoute>;
}

function AttachmentItem({ attachment, cardId, route }: AttachmentItemProps) {
  const url = attachmentUrl(attachment);
  const name = attachmentName(attachment);
  const isImage = attachment.mime_type?.startsWith('image/');

  const handleDelete = () => {
    if (!confirm('Delete this attachment?')) return;
    router.delete(route('agile.cards.attachments.destroy', [cardId, attachment.id]), {
      preserveScroll: true,
    });
  };

  return (
    <div className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-all">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden">
        {isImage && url ? (
          <img src={url} alt={name} className="w-full h-full object-cover" />
        ) : (
          getFileIcon(attachment.mime_type)
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatFileSize(attachment.size)}</span>
          {attachment.uploaded_by && (
            <>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{attachment.uploaded_by.name}</span>
            </>
          )}
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{fmtRelative(attachment.created_at)}</span>
        </div>
        {attachment.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{attachment.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {url && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Open</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a href={url} download={name}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">Download</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

interface UploadZoneProps {
  cardId: number;
  route: ReturnType<typeof useRoute>;
}

function UploadZone({ cardId, route }: UploadZoneProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const attachmentForm = useForm({
    file: null as File | null,
    name: '',
    description: '',
  });

  const handleFile = (file: File) => {
    setSelectedFile(file);
    attachmentForm.setData('file', file);
    if (!attachmentForm.data.name) {
      attachmentForm.setData('name', file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) { handleFile(file); setOpen(true); }
  };

  const submitAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    attachmentForm.post(route('agile.cards.attachments.store', cardId), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setSelectedFile(null);
        attachmentForm.reset('name', 'description', 'file');
        setOpen(false);
      },
    });
  };

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all',
          dragging
            ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-950/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => setOpen(true)}
      >
        <Upload className={cn('h-5 w-5 mb-2 transition-colors', dragging ? 'text-blue-500' : 'text-gray-400')} />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Any file type accepted</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>Add a file to this card</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitAttachment} className="space-y-4">
            <div>
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Select file</span>
                  <input type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                </label>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0">
                    {getFileIcon(selectedFile.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setSelectedFile(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="attach-name" className="text-xs">Display Name</Label>
                <Input
                  id="attach-name"
                  value={attachmentForm.data.name}
                  onChange={(e) => attachmentForm.setData('name', e.target.value)}
                  placeholder="Optional"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="attach-desc" className="text-xs">Description</Label>
                <Input
                  id="attach-desc"
                  value={attachmentForm.data.description}
                  onChange={(e) => attachmentForm.setData('description', e.target.value)}
                  placeholder="Optional"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {attachmentForm.progress && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Uploading…</span>
                  <span className="tabular-nums">{attachmentForm.progress.percentage}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${attachmentForm.progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" size="sm" disabled={attachmentForm.processing || !selectedFile}>
                {attachmentForm.processing ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Uploading…</>
                ) : (
                  <><Upload className="h-3.5 w-3.5 mr-2" />Upload</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Invitations Panel ────────────────────────────────────────────────────────

interface InvitationsPanelProps {
  invitations: NonNullable<CardShowProps['board_invitations']>;
  boardId: number;
  route: ReturnType<typeof useRoute>;
}

function InvitationsPanel({ invitations, boardId, route }: InvitationsPanelProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
    accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
    declined: { label: 'Declined', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setSending(true);
    router.post(
      route('agile.boards.invitations.store', boardId),
      { email: inviteEmail },
      {
        preserveScroll: true,
        onFinish: () => { setSending(false); setInviteEmail(''); },
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          placeholder="Invite by email…"
          className="h-8 text-sm"
          type="email"
        />
        <Button size="sm" className="h-8 shrink-0" onClick={handleInvite} disabled={sending}>
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {invitations.length === 0 ? (
        <EmptyState icon={<Mail className="h-4 w-4" />} message="No invitations sent" />
      ) : (
        <ul className="space-y-2">
          {invitations.map((invite: any) => {
            const sc = statusConfig[invite.status ?? 'pending'] || statusConfig.pending;
            return (
              <li key={invite.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar user={invite.user} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {invite.user?.name || invite.email || 'Unknown'}
                    </p>
                    {invite.email && invite.user && (
                      <p className="text-xs text-gray-400 truncate">{invite.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', sc.cls)}>
                    {sc.label}
                  </Badge>
                  <span className="text-xs text-gray-400">{fmtRelative(invite.created_at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Time Tracking ────────────────────────────────────────────────────────────

interface TimeTrackingProps {
  estimated?: number;
  logged?: number;
  cardId: number;
  route: ReturnType<typeof useRoute>;
}

function TimeTracking({ estimated, logged = 0, cardId, route }: TimeTrackingProps) {
  const [logHours, setLogHours] = useState('');
  const [logging, setLogging] = useState(false);
  const pct = estimated ? Math.min(100, Math.round((logged / estimated) * 100)) : 0;
  const over = estimated ? logged > estimated : false;

  const handleLog = () => {
    const h = parseFloat(logHours);
    if (isNaN(h) || h <= 0) return;
    setLogging(true);
    router.post(route('agile.cards.time.store', cardId), { hours: h }, {
      preserveScroll: true,
      onFinish: () => { setLogging(false); setLogHours(''); },
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Estimated</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            {estimated !== undefined ? `${estimated}h` : '—'}
          </p>
        </div>
        <div className={cn('rounded-lg p-3', over ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-800/60')}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Logged</p>
          <p className={cn('text-base font-bold', over ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100')}>
            {logged}h
            {over && <span className="text-xs font-normal ml-1">(over)</span>}
          </p>
        </div>
      </div>

      {estimated !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-red-500' : 'bg-blue-500')}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={logHours}
          onChange={(e) => setLogHours(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLog()}
          type="number"
          min="0.25"
          step="0.25"
          placeholder="Log hours (e.g. 1.5)"
          className="h-8 text-sm"
        />
        <Button size="sm" className="h-8 shrink-0" onClick={handleLog} disabled={logging}>
          {logging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Timer className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

// ─── Linked Issues ────────────────────────────────────────────────────────────

interface LinkedIssuesProps {
  blockedBy?: BoardCard['blocked_by'];
  blocks?: BoardCard['blocks'];
  related?: BoardCard['related'];
  route: ReturnType<typeof useRoute>;
}

function LinkedIssues({ blockedBy = [], blocks = [], related = [] }: LinkedIssuesProps) {
  const hasLinks = blockedBy.length > 0 || blocks.length > 0 || related.length > 0;

  if (!hasLinks) {
    return <EmptyState icon={<Link2 className="h-4 w-4" />} message="No linked issues" />;
  }

  const renderGroup = (label: string, items: Array<{ id: number | string; title: string }>, color: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', color)} />
            <span className="truncate text-gray-700 dark:text-gray-300">{item.title}</span>
            <span className="shrink-0 text-xs text-gray-400 ml-auto">#{item.id}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderGroup('Blocked by', blockedBy, 'bg-red-500')}
      {renderGroup('Blocks', blocks, 'bg-orange-500')}
      {renderGroup('Related', related, 'bg-blue-500')}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CardShow({ auth, card, project, board, board_invitations }: CardShowProps) {
  const route = useRoute();

  // ─── Derived data ─────────────────────────────────────────────────────────

  const activityLogs  = card.activity_logs  ?? [];
  const invitations   = board_invitations   ?? [];
  const checklists    = card.checklists     ?? [];
  const subscribers   = card.subscribers    ?? [];
  const votes         = card.votes          ?? [];
  const watchers      = card.watchers       ?? [];
  const comments      = card.comments       ?? [];
  const attachments   = card.attachments    ?? [];

  const currentUserId = auth.user.id;

  // ─── State ────────────────────────────────────────────────────────────────

  const [assigneeId, setAssigneeId]   = useState(card.assignee?.id?.toString() ?? '');
  const [columnId,   setColumnId]     = useState(card.column?.id?.toString()   ?? '');
  const [updating,   setUpdating]     = useState(false);
  const [copied,     setCopied]       = useState(false);
  const [activeTab,  setActiveTab]    = useState<'overview' | 'activity' | 'people'>('overview');

  const isSubscribed = subscribers.some((s) => s.user?.id === currentUserId);
  const isWatching   = watchers.some((w)   => w.user?.id === currentUserId);

  const priorityCfg  = PRIORITY_CONFIG[card.priority] ?? PRIORITY_CONFIG.medium;
  const typeCfg      = TYPE_CONFIG[card.type]         ?? TYPE_CONFIG.task;

  const dueSoon = card.due_date && !isOverdue(card.due_date) && (() => {
    const diff = new Date(card.due_date!).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000;
  })();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleUpdate = useCallback((field: 'assignee_id' | 'column_id', value: string) => {
    setUpdating(true);
    const data: Record<string, string | null> = {};
    if (field === 'assignee_id') { setAssigneeId(value); data.assignee_id = value === 'none' ? null : value; }
    else                         { setColumnId(value);   data.column_id  = value; }
    router.put(route('agile.cards.update', card.id), data, {
      preserveScroll: true,
      onFinish: () => setUpdating(false),
    });
  }, [card.id, route]);

  const handleDelete = useCallback(() => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) return;
    router.delete(route('agile.cards.destroy', card.id));
  }, [card.id, route]);

  const handleToggleSubscribe = () => {
    if (isSubscribed) {
      const sub = subscribers.find((s) => s.user?.id === currentUserId);
      if (sub) router.delete(route('agile.cards.subscribers.destroy', [card.id, sub.id]), { preserveScroll: true });
    } else {
      router.post(route('agile.cards.subscribers.store', card.id), {}, { preserveScroll: true });
    }
  };

  const handleToggleWatch = () => {
    if (isWatching) {
      const w = watchers.find((w) => w.user?.id === currentUserId);
      if (w) router.delete(route('agile.cards.watchers.destroy', [card.id, w.id]), { preserveScroll: true });
    } else {
      router.post(route('agile.cards.watchers.store', card.id), {}, { preserveScroll: true });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Comment form ─────────────────────────────────────────────────────────

  const commentForm = useForm({ comment: '' });

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.data.comment.trim()) return;
    commentForm.post(route('agile.cards.comments.store', card.id), {
      preserveScroll: true,
      onSuccess: () => commentForm.reset('comment'),
    });
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  const checklistTotals = useMemo(() => {
    const total     = checklists.reduce((a, cl) => a + cl.items.length, 0);
    const completed = checklists.reduce((a, cl) => a + cl.items.filter((i) => i.completed).length, 0);
    return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [checklists]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout
      title={card.title}
      renderHeader={() => (
        <div className="flex items-start justify-between gap-4">
          {/* Breadcrumb + Title */}
          <div className="min-w-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
              {project && (
                <>
                  <Link href={route('projects.show', project.id)} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    {project.name}
                  </Link>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                </>
              )}
              <Link
                href={route('agile.board.show', card.board.id)}
                className="inline-flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <LayoutGrid className="h-3 w-3" />
                {card.board?.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-gray-400">{card.column?.name}</span>
            </nav>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-bold text-xl text-gray-900 dark:text-gray-50 leading-tight">
                {card.title}
              </h1>
              <Badge variant="outline" className={cn('gap-1 text-xs font-semibold', typeCfg.cls)}>
                {typeCfg.icon}{typeCfg.label}
              </Badge>
              <Badge variant="outline" className={cn('gap-1 text-xs font-semibold', priorityCfg.cls)}>
                {priorityCfg.icon}{priorityCfg.label}
              </Badge>
              {card.due_date && (
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 text-xs font-semibold',
                    isOverdue(card.due_date)
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
                      : dueSoon
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/60 dark:text-gray-400 dark:border-gray-700'
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  {isOverdue(card.due_date) ? 'Overdue · ' : ''}
                  {fmtDateShort(card.due_date)}
                </Badge>
              )}
              {card.labels?.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${label.color}15`,
                    color: label.color,
                    borderColor: `${label.color}40`,
                  }}
                >
                  <Tag className="h-2.5 w-2.5 mr-1" />
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleCopyLink}>
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-9 gap-2',
                isSubscribed && 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
              )}
              onClick={handleToggleSubscribe}
            >
              {isSubscribed ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-9 gap-2',
                isWatching && 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300'
              )}
              onClick={handleToggleWatch}
            >
              {isWatching ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isWatching ? 'Unwatch' : 'Watch'}</span>
            </Button>

            <Link href={route('agile.cards.edit', card.id)}>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Edit className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="h-3.5 w-3.5 mr-2" />Copy link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={route('agile.cards.edit', card.id)}>
                    <Edit className="h-3.5 w-3.5 mr-2" />Edit card
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400" onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" />Delete card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
    >
      <Head title={`${card.title} · ${card.board?.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* ── Main Column ─────────────────────────────────────────────── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Description ──────────────────────────────────────────────── */}
              <Card className="overflow-hidden border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <AlignLeft className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Description</h3>
                      </div>
                      {card.description ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {card.description}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No description provided.</p>
                      )}
                    </div>

                    {/* Hybrid linked task */}
                    {project?.methodology === 'hybrid' && card.task && (
                      <>
                        <Separator />
                        <LinkedItemIndicator type="card" linkedItem={card.task} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Linked Task ───────────────────────────────────────────────── */}
              {card.task && (
                <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardContent className="pt-6">
                    <SectionHeader icon={<Layers className="h-3.5 w-3.5" />} title="Linked Task" />
                    <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 p-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0 mt-0.5">
                          <GitBranch className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                            {card.task?.title ?? card.task?.name ?? 'Linked Task'}
                          </p>
                          {card.task?.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {card.task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {card.task?.status && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {String(card.task.status)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Linked Issues ─────────────────────────────────────────────── */}
              {(
                (card.blocked_by?.length ?? 0) > 0 ||
                (card.blocks?.length   ?? 0) > 0 ||
                (card.related?.length  ?? 0) > 0
              ) && (
                <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardContent className="pt-6">
                    <SectionHeader icon={<Link2 className="h-3.5 w-3.5" />} title="Linked Issues" />
                    <LinkedIssues
                      blockedBy={card.blocked_by}
                      blocks={card.blocks}
                      related={card.related}
                      route={route}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Tabs: Overview / Activity / People ──────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  <div className="border-b border-gray-100 dark:border-gray-800 px-6 pt-4">
                    <TabsList className="h-9 bg-transparent gap-0 p-0 -mb-px">
                      <TabsTrigger
                        value="overview"
                        className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 dark:data-[state=active]:border-gray-100 data-[state=active]:bg-transparent text-sm font-medium px-4"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="activity"
                        className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 dark:data-[state=active]:border-gray-100 data-[state=active]:bg-transparent text-sm font-medium px-4"
                      >
                        Activity
                        {activityLogs.length > 0 && (
                          <span className="ml-1.5 text-[10px] tabular-nums bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                            {activityLogs.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="people"
                        className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 dark:data-[state=active]:border-gray-100 data-[state=active]:bg-transparent text-sm font-medium px-4"
                      >
                        People
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* ── Overview Tab ─────────────────────────────────────── */}
                  <TabsContent value="overview" className="m-0">
                    <div className="p-6 space-y-8">

                      {/* Checklists */}
                      <div>
                        <SectionHeader
                          icon={<CheckSquare className="h-3.5 w-3.5" />}
                          title="Checklists"
                          badge={checklistTotals.total > 0 ? `${checklistTotals.completed}/${checklistTotals.total}` : checklists.length}
                          description={checklists.length > 0 ? `${checklistTotals.pct}% complete` : undefined}
                        />
                        <ChecklistSection checklists={checklists} cardId={card.id} route={route} />
                      </div>

                      <Separator />

                      {/* Attachments */}
                      <div>
                        <SectionHeader
                          icon={<Paperclip className="h-3.5 w-3.5" />}
                          title="Attachments"
                          badge={attachments.length}
                        />
                        <div className="space-y-4">
                          <UploadZone cardId={card.id} route={route} />
                          {attachments.length > 0 && (
                            <div className="space-y-2">
                              {attachments.map((a) => (
                                <AttachmentItem key={a.id} attachment={a} cardId={card.id} route={route} />
                              ))}
                            </div>
                          )}
                          {attachments.length === 0 && (
                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 py-2">No attachments yet.</p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Comments */}
                      <div>
                        <SectionHeader
                          icon={<MessageSquare className="h-3.5 w-3.5" />}
                          title="Comments"
                          badge={comments.length}
                        />

                        <form onSubmit={submitComment} className="space-y-3 mb-6">
                          <div className="flex gap-3">
                            <UserAvatar user={auth.user} size="sm" showTooltip={false} />
                            <div className="flex-1 space-y-2">
                              <Textarea
                                value={commentForm.data.comment}
                                onChange={(e) => commentForm.setData('comment', e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment(e);
                                }}
                                placeholder="Add a comment… (⌘+Enter to submit)"
                                rows={3}
                                className="resize-none text-sm"
                              />
                              {commentForm.errors.comment && (
                                <p className="text-xs text-red-600">{commentForm.errors.comment}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 dark:text-gray-500">Markdown supported</p>
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={commentForm.processing || !commentForm.data.comment.trim()}
                                  className="h-8 gap-2"
                                >
                                  {commentForm.processing ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                  Comment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </form>

                        {comments.length === 0 ? (
                          <EmptyState
                            icon={<MessageSquare className="h-4 w-4" />}
                            message="No comments yet"
                            description="Start the conversation"
                          />
                        ) : (
                          <div className="space-y-4">
                            {comments.map((c) => (
                              <CommentItem
                                key={c.id}
                                comment={c}
                                currentUserId={currentUserId}
                                cardId={card.id}
                                route={route}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── Activity Tab ─────────────────────────────────────── */}
                  <TabsContent value="activity" className="m-0">
                    <div className="p-6">
                      <ActivityFeed logs={activityLogs} />
                    </div>
                  </TabsContent>

                  {/* ── People Tab ───────────────────────────────────────── */}
                  <TabsContent value="people" className="m-0">
                    <div className="p-6 space-y-8">

                      {/* Votes */}
                      <div>
                        <SectionHeader
                          icon={<TrendingUp className="h-3.5 w-3.5" />}
                          title="Votes"
                          badge={votes.length}
                        />
                        <VoteSection
                          votes={votes}
                          cardId={card.id}
                          currentUserId={currentUserId}
                          route={route}
                        />
                      </div>

                      <Separator />

                      {/* Subscribers */}
                      <div>
                        <SectionHeader
                          icon={<Bell className="h-3.5 w-3.5" />}
                          title="Subscribers"
                          badge={subscribers.length}
                          description="Get notified on changes"
                        />
                        <PeopleList
                          items={subscribers}
                          emptyMessage="No subscribers yet"
                          onAdd={handleToggleSubscribe}
                          onRemove={(id) => router.delete(route('agile.cards.subscribers.destroy', [card.id, id]), { preserveScroll: true })}
                          currentUserId={currentUserId}
                        />
                      </div>

                      <Separator />

                      {/* Watchers */}
                      <div>
                        <SectionHeader
                          icon={<Eye className="h-3.5 w-3.5" />}
                          title="Watchers"
                          badge={watchers.length}
                          description="Silent observers"
                        />
                        <PeopleList
                          items={watchers}
                          emptyMessage="No watchers yet"
                          onAdd={handleToggleWatch}
                          onRemove={(id) => router.delete(route('agile.cards.watchers.destroy', [card.id, id]), { preserveScroll: true })}
                          currentUserId={currentUserId}
                        />
                      </div>

                      <Separator />

                      {/* Board Invitations */}
                      <div>
                        <SectionHeader
                          icon={<Mail className="h-3.5 w-3.5" />}
                          title="Board Invitations"
                          badge={invitations.length}
                        />
                        <InvitationsPanel invitations={invitations} boardId={board.id} route={route} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>

            {/* ── Sidebar ────────────────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Status & Assignee ─────────────────────────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <Flag className="h-3 w-3" />Status
                    </Label>
                    <Select value={columnId} onValueChange={(v) => handleUpdate('column_id', v)} disabled={updating}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {board.columns.map((col) => (
                          <SelectItem key={col.id} value={col.id.toString()} className="text-sm">
                            <div className="flex items-center gap-2">
                              {col.color && (
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col.color }} />
                              )}
                              {col.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <Users className="h-3 w-3" />Assignee
                    </Label>
                    <Select value={assigneeId || 'none'} onValueChange={(v) => handleUpdate('assignee_id', v)} disabled={updating}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-sm">
                          <span className="text-gray-400">Unassigned</span>
                        </SelectItem>
                        {board.members.map((member) =>
                          member.user ? (
                            <SelectItem key={member.user.id} value={member.user.id.toString()} className="text-sm">
                              <div className="flex items-center gap-2">
                                <UserAvatar user={member.user} size="xs" showTooltip={false} />
                                {member.user.name}
                              </div>
                            </SelectItem>
                          ) : null
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Reporter</p>
                    {card.reporter ? (
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={card.reporter} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{card.reporter.name}</p>
                          {card.reporter.email && (
                            <p className="text-xs text-gray-400">{card.reporter.email}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not set</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Details ───────────────────────────────────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Details</p>
                  <dl className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <Target className="h-3 w-3" />Story Points
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {card.story_points !== undefined ? card.story_points : (
                          <span className="font-normal text-gray-400">—</span>
                        )}
                      </dd>
                    </div>

                    {card.due_date && (
                      <div className="flex items-center justify-between gap-3">
                        <dt className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          <Calendar className="h-3 w-3" />Due Date
                        </dt>
                        <dd className={cn(
                          'text-sm font-semibold',
                          isOverdue(card.due_date)
                            ? 'text-red-600 dark:text-red-400'
                            : dueSoon
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-gray-900 dark:text-gray-100'
                        )}>
                          {fmtDateShort(card.due_date)}
                          {isOverdue(card.due_date) && (
                            <span className="ml-1 text-xs font-normal text-red-500">overdue</span>
                          )}
                        </dd>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <Layers className="h-3 w-3" />Type
                      </dt>
                      <dd>
                        <Badge variant="outline" className={cn('text-xs gap-1', typeCfg.cls)}>
                          {typeCfg.icon}{typeCfg.label}
                        </Badge>
                      </dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <Flame className="h-3 w-3" />Priority
                      </dt>
                      <dd>
                        <Badge variant="outline" className={cn('text-xs gap-1', priorityCfg.cls)}>
                          {priorityCfg.icon}{priorityCfg.label}
                        </Badge>
                      </dd>
                    </div>

                    {checklists.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <CheckSquare className="h-3 w-3" />Tasks
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                            {checklistTotals.completed}/{checklistTotals.total}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
                            style={{ width: `${checklistTotals.pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              {/* Sprint & Epic ─────────────────────────────────────────────── */}
              {(card.sprint || card.epic) && (
                <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardContent className="pt-5 space-y-4">
                    {card.sprint && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Sprint</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950/40 shrink-0">
                              <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{card.sprint.name}</p>
                          </div>
                          {card.sprint.status && (
                            <Badge variant="outline" className="text-xs shrink-0">{card.sprint.status}</Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {card.sprint && card.epic && <Separator />}
                    {card.epic && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Epic</p>
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                            style={{ background: card.epic.color ? `${card.epic.color}20` : undefined }}
                          >
                            <Bookmark className="h-3 w-3" style={{ color: card.epic.color ?? '#8b5cf6' }} />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{card.epic.name}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Time Tracking ─────────────────────────────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Time Tracking</p>
                  <TimeTracking
                    estimated={card.estimated_hours}
                    logged={card.logged_hours}
                    cardId={card.id}
                    route={route}
                  />
                </CardContent>
              </Card>

              {/* Context ────────────────────────────────────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-5 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Context</p>

                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Board</p>
                    <Link
                      href={route('agile.board.show', card.board.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <LayoutGrid className="h-3.5 w-3.5 text-gray-400" />
                      {card.board?.name}
                      <ArrowUpRight className="h-3 w-3 text-gray-400" />
                    </Link>
                  </div>

                  {project && (
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide">Project</p>
                      <Link
                        href={route('projects.show', project.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
                        {project.name}
                        <ArrowUpRight className="h-3 w-3 text-gray-400" />
                      </Link>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <History className="h-3 w-3" />Created
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium text-gray-700 dark:text-gray-300 cursor-default">
                              {fmtRelative(card.created_at)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">{fmtDate(card.created_at)}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <RefreshCw className="h-3 w-3" />Updated
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium text-gray-700 dark:text-gray-300 cursor-default">
                              {fmtRelative(card.updated_at)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">{fmtDate(card.updated_at)}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {card.position !== undefined && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                          <Hash className="h-3 w-3" />Position
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">{card.position}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Labels ─────────────────────────────────────────────────────── */}
              {card.labels && card.labels.length > 0 && (
                <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Labels</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.labels.map((label) => (
                        <Badge
                          key={label.id}
                          variant="outline"
                          className="text-xs gap-1"
                          style={{
                            backgroundColor: `${label.color}15`,
                            color: label.color,
                            borderColor: `${label.color}40`,
                          }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: label.color }} />
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats ──────────────────────────────────────────────── */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Quick Stats</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Comments', value: comments.length,    icon: <MessageSquare className="h-3.5 w-3.5" /> },
                      { label: 'Attachments', value: attachments.length, icon: <Paperclip     className="h-3.5 w-3.5" /> },
                      { label: 'Watchers',   value: watchers.length,   icon: <Eye            className="h-3.5 w-3.5" /> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <span className="text-gray-400 dark:text-gray-500">{icon}</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-none">{value}</span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
            {/* ── End Sidebar ─────────────────────────────────────────────── */}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}