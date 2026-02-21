import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Edit, Calendar, Users, DollarSign, Clock, Target, FileText,
  MessageSquare, Plus, Eye, Download, Kanban, Layers, Zap,
  GitBranch, TrendingUp, AlertTriangle, CheckCircle2, Circle,
  Trash2, MoreHorizontal, ExternalLink, Activity, Star,
  BarChart3, ChevronRight, FolderOpen, Timer, Cpu, Shield,
  ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Filter,
  Search, SortAsc, Play, Pause, Archive
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import AIInsights from '@/Components/Projects/AIInsights';
import { Project, ProjectMilestone, ProjectFile, ProjectTimeLog } from '@/types';
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

// ─── Utility helpers ──────────────────────────────────────────────────────────

const statusMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; dot: string }> = {
  draft: { label: 'Draft', color: 'text-gray-400', bg: 'bg-gray-500/20 border-gray-500/30', icon: Circle, dot: 'bg-gray-400' },
  active: { label: 'Active', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', icon: Play, dot: 'bg-blue-400' },
  'on-hold': { label: 'On Hold', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', icon: Pause, dot: 'bg-yellow-400' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', icon: CheckCircle2, dot: 'bg-green-400' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: Archive, dot: 'bg-red-400' },
};

const priorityMeta: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  low: { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', bar: 'bg-blue-400' },
  medium: { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', bar: 'bg-yellow-400' },
  high: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', bar: 'bg-orange-400' },
  critical: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', bar: 'bg-red-400' },
};

const methodologyMeta: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  waterfall: { label: 'Waterfall', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', icon: Layers },
  agile: { label: 'Agile', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', icon: Zap },
  hybrid: { label: 'Hybrid', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30', icon: GitBranch },
};

const formatCurrency = (amount: number | null | undefined) =>
  amount != null ? `$${amount.toLocaleString()}` : 'N/A';

const formatDate = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

const formatDateShort = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

const daysUntil = (date: string | null | undefined) => {
  if (!date) return null;
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return diff;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`border border-white/10 rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color = 'text-white',
  iconBg = 'bg-white/10',
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  iconBg?: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/40';
  return (
    <GlassCard className="p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${color}`}>{value}</p>
        {sub && (
          <div className="flex items-center gap-1 mt-0.5">
            {trend && <TrendIcon className={`w-3 h-3 ${trendColor}`} />}
            <p className="text-white/40 text-xs">{sub}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-white font-semibold text-base">{title}</h3>
        {sub && <p className="text-white/40 text-xs mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <GlassCard className="p-12 text-center">
      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-white/30" />
      </div>
      <p className="text-white/60 font-medium">{title}</p>
      {description && <p className="text-white/30 text-sm mt-1 max-w-xs mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </GlassCard>
  );
}

function PrimaryButton({ children, onClick, href, icon: Icon, small }: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  small?: boolean;
}) {
  const cls = `inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`;
  const content = (
    <>
      {Icon && <Icon className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </>
  );
  if (href) return <Link href={href} className={cls}>{content}</Link>;
  return <button onClick={onClick} className={cls}>{content}</button>;
}

function GhostButton({ children, onClick, href, icon: Icon, small, danger }: {
  children?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon?: React.ElementType;
  small?: boolean;
  danger?: boolean;
}) {
  const cls = `inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 ${danger ? 'text-red-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10' : 'text-white/60 hover:text-white'} font-medium rounded-lg transition-all duration-200 ${small ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`;
  const content = (
    <>
      {Icon && <Icon className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </>
  );
  if (href) return <Link href={href} className={cls}>{content}</Link>;
  return <button onClick={onClick} className={cls}>{content}</button>;
}

function ProgressRing({ value, size = 56, stroke = 5, color = '#6366f1' }: {
  value: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="rgba(255,255,255,0.1)" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={color} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

function GlassProgressBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  return (
    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Milestone Card ────────────────────────────────────────────────────────────

function MilestoneCard({ milestone, project, formatDate, getStatusBadge, hasPermission, route }: any) {
  const days = daysUntil(milestone.due_date);
  const isOverdue = days !== null && days < 0 && milestone.status !== 'completed';
  const isDueSoon = days !== null && days >= 0 && days <= 7 && milestone.status !== 'completed';

  return (
    <GlassCard className="p-5 group hover:border-white/20 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${milestone.status === 'completed' ? 'bg-green-500/20' :
            isOverdue ? 'bg-red-500/20' : 'bg-white/10'
            }`}>
            {milestone.status === 'completed'
              ? <CheckCircle2 className="w-4 h-4 text-green-400" />
              : isOverdue
                ? <AlertTriangle className="w-4 h-4 text-red-400" />
                : <Target className="w-4 h-4 text-white/50" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-medium text-sm">{milestone.name}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusMeta[milestone.status]?.bg || 'bg-white/10 border-white/10'} ${statusMeta[milestone.status]?.color || 'text-white/60'}`}>
                {milestone.status}
              </span>
              {isOverdue && <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 border border-red-500/30 text-red-400">Overdue</span>}
              {isDueSoon && !isOverdue && <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">Due soon</span>}
            </div>
            {milestone.description && (
              <p className="text-white/40 text-xs mt-1 line-clamp-1">{milestone.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/30 text-xs">Progress</span>
                  <span className="text-white/60 text-xs font-medium">{milestone.progress}%</span>
                </div>
                <GlassProgressBar
                  value={milestone.progress}
                  color={milestone.status === 'completed' ? 'bg-green-400' : isOverdue ? 'bg-red-400' : 'bg-primary'}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-white/40">
              {milestone.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(milestone.due_date)}
                  {days !== null && milestone.status !== 'completed' && (
                    <span className={isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : ''}>
                      {isOverdue ? `(${Math.abs(days)}d overdue)` : `(${days}d left)`}
                    </span>
                  )}
                </span>
              )}
              {milestone.assignee && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {milestone.assignee.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GhostButton href={route('projects.milestones.show', [project.id, milestone.id])} icon={Eye} small />
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Backlog Item Card ─────────────────────────────────────────────────────────

function BacklogItemCard({ item, onEdit, onDelete, hasPermission }: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  hasPermission: (p: string) => boolean;
}) {
  const pMeta = priorityMeta[item.priority] || priorityMeta.medium;
  return (
    <GlassCard className="p-4 group hover:border-white/20 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Layers className="w-3.5 h-3.5 text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-medium text-sm">{item.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${pMeta.bg} ${pMeta.color}`}>
                {pMeta.label}
              </span>
              {item.status && (
                <span className={`px-2 py-0.5 rounded-full text-xs border ${statusMeta[item.status]?.bg || 'bg-white/10 border-white/10'} ${statusMeta[item.status]?.color || 'text-white/60'}`}>
                  {item.status.replace('_', ' ')}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-white/40 text-xs mt-1 line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Star className="w-3 h-3" />
                {item.story_points} pts
              </span>
              {item.sprint && (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <GitBranch className="w-3 h-3" />
                  {item.sprint.name}
                </span>
              )}
              {item.assignee && (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Users className="w-3 h-3" />
                  {item.assignee.name}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-white/30">
                <Tag className="w-3 h-3" />
                {item.type}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {hasPermission('projects.edit') && (
            <>
              <GhostButton onClick={() => onEdit(item)} icon={Edit} small />
              <GhostButton onClick={() => onDelete(item.id)} icon={Trash2} small danger />
            </>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ─── File Card ─────────────────────────────────────────────────────────────────

function FileCard({ file }: { file: any }) {
  const ext = file.name?.split('.').pop()?.toLowerCase() || '';
  const extColors: Record<string, string> = {
    pdf: 'text-red-400 bg-red-500/20 border-red-500/30',
    doc: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    docx: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    xls: 'text-green-400 bg-green-500/20 border-green-500/30',
    xlsx: 'text-green-400 bg-green-500/20 border-green-500/30',
    png: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    jpg: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    jpeg: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  };
  const colorCls = extColors[ext] || 'text-white/50 bg-white/10 border-white/10';

  return (
    <GlassCard className="p-4 group hover:border-white/20 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorCls}`}>
            <span className="text-xs font-bold uppercase">{ext || 'F'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium text-sm truncate">{file.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{file.file_size_formatted} · {file.category}</p>
            <p className="text-white/30 text-xs mt-0.5">by {file.uploader?.name}</p>
          </div>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <GhostButton icon={Eye} small />
          <GhostButton icon={Download} small />
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Time Log Card ─────────────────────────────────────────────────────────────

function TimeLogCard({ log, formatDate, formatCurrency }: any) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white/60">{log.user?.name?.charAt(0) || '?'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-medium text-sm">{log.user?.name}</span>
              {log.status && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 border border-white/10 text-white/50">
                  {log.status}
                </span>
              )}
              {log.is_billable && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 border border-green-500/30 text-green-400">
                  Billable
                </span>
              )}
            </div>
            <p className="text-white/40 text-xs mt-1 line-clamp-1">{log.description || 'No description'}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {log.hours}h
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(log.log_date)}
              </span>
              {log.is_billable && log.total_amount && (
                <span className="flex items-center gap-1 text-green-400">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(log.total_amount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Tag import (small helper) ────────────────────────────────────────────────
// (Lucide doesn't export 'Tag', we reuse an alias)
function Tag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3H5a2 2 0 00-2 2v2.586a1 1 0 00.293.707l9.414 9.414a2 2 0 002.828 0l2.586-2.586a2 2 0 000-2.828L8.707 3.293A1 1 0 008 3H7z" />
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProjectShow({ auth, project, board, columns = [], cards = [], productBacklog = [] }: ProjectShowProps) {
  // Navigation bar for quick links
  const NavLinksBar = () => (
    <div className="flex gap-2 mt-3 mb-2">
      {navLinks.map(link => (
        <GhostButton key={link.label}>
          <Link
            href={link.route}
            className="inline-flex items-center text-white rounded-lg font-semibold transition-all duration-150 shadow-sm"
          >
            {link.label}
          </Link>
        </GhostButton>
      ))}
    </div>
  );
  // Initialize backlogItems from productBacklog prop
  const [backlogItems, setBacklogItems] = React.useState<any[]>(productBacklog);
  const [loadingBacklog, setLoadingBacklog] = React.useState(false);
  const [backlogError, setBacklogError] = React.useState<string | null>(null);
  const [showBacklogModal, setShowBacklogModal] = React.useState(false);
  const [editingBacklogItem, setEditingBacklogItem] = React.useState<any | null>(null);
  const [modalCards, setModalCards] = React.useState<any[]>([]);
  const [epics, setEpics] = React.useState<any[]>([]);
  const [sprints, setSprints] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>(project.team_members);
  const [backlogSearch, setBacklogSearch] = React.useState('');
  const [backlogFilter, setBacklogFilter] = React.useState('all');
  const [milestoneFilter, setMilestoneFilter] = React.useState('all');
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);
  const page = useTypedPage();
  const route = useRoute();
  const { hasPermission } = usePermissions();

  React.useEffect(() => {
    // Replaced router.get calls with Link buttons below
  }, [project.id]);

  // --- Quick navigation buttons for Cards, Epics, Sprints, Users ---
  const navLinks = [
    { label: 'Cards', route: route('agile.cards.index', project.id) },
    { label: 'Epics', route: route('agile.epics.index', project.id) },
    { label: 'Sprints', route: route('agile.sprints.index', project.id) },
    { label: 'Users', route: route('projects.project.users', project.id) },
  ];


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
      onError: () => { setBacklogError('Failed to save backlog item'); setLoadingBacklog(false); },
    });
  };

  const handleEditBacklog = (item: any) => router.get(route('agile.backlog.edit', [project.id, item.id]));

  const handleDeleteBacklog = (id: number) => {
    setLoadingBacklog(true);
    setBacklogError(null);
    router.delete(route('agile.backlog.destroy', id), {
      preserveState: true,
      onSuccess: (page: any) => { setBacklogItems(page.props.productBacklog || []); setLoadingBacklog(false); setDeleteConfirm(null); },
      onError: () => { setBacklogError('Failed to delete backlog item'); setLoadingBacklog(false); },
    });
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const methodology = project.methodology || 'hybrid';
  const showMilestones = project.enable_milestones ?? true;
  const showBoards = project.enable_boards ?? true;
  const mMeta = methodologyMeta[methodology] || methodologyMeta.hybrid;
  const sMeta = statusMeta[project.status || 'draft'] || statusMeta.draft;
  const pMeta = priorityMeta[project.priority || 'medium'] || priorityMeta.medium;
  const StatusIcon = sMeta.icon;

  const totalHoursLogged = project.time_logs?.reduce((s: number, l: any) => s + (l.hours || 0), 0) || 0;
  const deadlineDays = daysUntil(project.deadline);

  const filteredMilestones = React.useMemo(() => {
    if (!project.milestones) return [];
    if (milestoneFilter === 'all') return project.milestones;
    return project.milestones.filter((m: any) => m.status === milestoneFilter);
  }, [project.milestones, milestoneFilter]);

  const filteredBacklog = React.useMemo(() => {
    let items = backlogItems;
    if (backlogSearch) items = items.filter(i => i.title?.toLowerCase().includes(backlogSearch.toLowerCase()));
    if (backlogFilter !== 'all') items = items.filter(i => i.priority === backlogFilter || i.status === backlogFilter);
    return items;
  }, [backlogItems, backlogSearch, backlogFilter]);

  const tabCount = [showMilestones, showBoards, showBoards, true, true, true].filter(Boolean).length;

  // ── Tab grid class ────────────────────────────────────────────────────────
  const tabGridCols = `grid-cols-${tabCount}`;

  return (
    <AppLayout
      title={project.name}
      renderHeader={() => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: title + badges */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href={route('projects.index')} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                Projects
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/70 text-sm truncate max-w-[200px]">{project.name}</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">{project.name}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${sMeta.bg} ${sMeta.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sMeta.dot} animate-pulse`} />
                {sMeta.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-medium ${pMeta.bg} ${pMeta.color}`}>
                <AlertTriangle className="w-3 h-3" />
                {pMeta.label}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border font-medium ${mMeta.bg} ${mMeta.color}`}>
                <mMeta.icon className="w-3 h-3" />
                {mMeta.label}
              </span>
              {project.category && (
                <span className="px-2.5 py-1 rounded-full text-xs border bg-white/5 border-white/10 text-white/50">
                  {project.category}
                </span>
              )}
            </div>
            {/* --- Navigation Links Bar --- */}
            <NavLinksBar />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {showMilestones && (
              <GhostButton href={route('projects.kanban', project.id)} icon={Kanban}>
                Kanban
              </GhostButton>
            )}
            <GhostButton href={route('projects.livechat', project.id)} icon={MessageSquare}>
              Chat
            </GhostButton>
            {hasPermission('projects.edit') && (
              <PrimaryButton href={route('projects.edit', project.id)} icon={Edit}>
                Edit Project
              </PrimaryButton>
            )}
          </div>
        </div>
      )}
    >
      <Head title={project.name} />

      <div className="space-y-6 pb-10">

        {/* ── KPI Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Overall Progress"
            value={`${project.progress || 0}%`}
            sub={project.progress >= 80 ? 'Nearly done' : project.progress >= 50 ? 'Halfway there' : 'In progress'}
            trend={project.progress >= 50 ? 'up' : 'neutral'}
            color="text-primary"
            iconBg="bg-primary/20"
          />
          <StatCard
            icon={Target}
            label="Milestones"
            value={`${completedMilestones}/${totalMilestones}`}
            sub={`${milestoneProgress}% complete`}
            trend={milestoneProgress > 50 ? 'up' : 'neutral'}
            color="text-green-400"
            iconBg="bg-green-500/20"
          />
          <StatCard
            icon={Clock}
            label="Hours Logged"
            value={`${totalHoursLogged}h`}
            sub={project.total_hours ? `of ${project.total_hours}h estimated` : 'total logged'}
            color="text-yellow-400"
            iconBg="bg-yellow-500/20"
          />
          <StatCard
            icon={Calendar}
            label="Deadline"
            value={deadlineDays !== null ? (deadlineDays < 0 ? 'Overdue' : `${deadlineDays}d`) : '—'}
            sub={formatDateShort(project.deadline)}
            trend={deadlineDays !== null ? (deadlineDays < 0 ? 'down' : deadlineDays < 14 ? 'neutral' : 'up') : 'neutral'}
            color={deadlineDays !== null && deadlineDays < 0 ? 'text-red-400' : deadlineDays !== null && deadlineDays < 14 ? 'text-yellow-400' : 'text-white'}
            iconBg={deadlineDays !== null && deadlineDays < 0 ? 'bg-red-500/20' : 'bg-white/10'}
          />
        </div>

        {/* ── Main Content Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Overview + Progress */}
          <div className="xl:col-span-2 space-y-6">

            {/* Overview card */}
            <GlassCard className="p-6">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold mb-2">Project Overview</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>
                </div>
                <div className="flex-shrink-0 relative">
                  <ProgressRing value={project.progress || 0} size={72} stroke={6} color="#6366f1" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{project.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-xs font-medium uppercase tracking-wide">Overall Progress</span>
                    <span className="text-white font-semibold text-sm">{project.progress || 0}%</span>
                  </div>
                  <GlassProgressBar value={project.progress || 0} color="bg-primary" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/50 text-xs font-medium uppercase tracking-wide">Milestones</span>
                    <span className="text-white font-semibold text-sm">{milestoneProgress}%</span>
                  </div>
                  <GlassProgressBar value={milestoneProgress} color="bg-green-400" />
                </div>
                {project.budget && project.spent_amount != null && (
                  <div className="sm:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/50 text-xs font-medium uppercase tracking-wide">Budget Used</span>
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(project.spent_amount)} / {formatCurrency(project.budget)}
                      </span>
                    </div>
                    <GlassProgressBar
                      value={project.budget ? (project.spent_amount / project.budget) * 100 : 0}
                      color={project.budget && project.spent_amount / project.budget > 0.9 ? 'bg-red-400' : 'bg-yellow-400'}
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-white/30 text-xs uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>

            {/* AI Insights */}
            <AIInsights project={project} milestones={project.milestones} />
          </div>

          {/* RIGHT: Details sidebar */}
          <div className="space-y-4">

            {/* Project Details */}
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Project Details</h3>
              <div className="space-y-3.5">
                {[
                  project.client && { icon: Users, label: 'Client', value: project.client.name },
                  { icon: Users, label: 'Manager', value: project.manager?.name || '—' },
                  project.budget && { icon: DollarSign, label: 'Budget', value: formatCurrency(project.budget) },
                  { icon: DollarSign, label: 'Spent', value: formatCurrency(project.spent_amount || 0) },
                  project.start_date && { icon: Calendar, label: 'Start', value: formatDate(project.start_date) },
                  project.deadline && { icon: Calendar, label: 'Deadline', value: formatDate(project.deadline) },
                  { icon: Clock, label: 'Total Hours', value: `${project.total_hours || 0}h` },
                  project.total_billable_amount && { icon: DollarSign, label: 'Billable', value: formatCurrency(project.total_billable_amount) },
                ].filter(Boolean).map((row: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/40">
                      <row.icon className="w-3.5 h-3.5" />
                      {row.label}
                    </span>
                    <span className="text-white/80 font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Team Members */}
            {project.team && project.team.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="text-white font-semibold text-sm mb-4">Team</h3>
                <div className="space-y-2.5">
                  {project.team.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {member.name?.charAt(0)}
                      </div>
                      <span className="text-white/70 text-sm">{member.name}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Quick actions */}
            <GlassCard className="p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2 space-x-2">
                {showMilestones && hasPermission('projects.milestones.create') && (
                  <GhostButton href={route('projects.milestones.create', { project: project.id })} icon={Plus} small>
                    Add Milestone
                  </GhostButton>
                )}
                {hasPermission('projects.files.create') && (
                  <GhostButton href={route('projects.files.create', { project: project.id })} icon={Plus} small>
                    Upload File
                  </GhostButton>
                )}
                {hasPermission('projects.time-logs.create') && (
                  <GhostButton href={route('projects.time-logs.create', { project: project.id })} icon={Timer} small>
                    Log Time
                  </GhostButton>
                )}
                <GhostButton href={route('projects.livechat', project.id)} icon={MessageSquare} small>
                  Open Chat
                </GhostButton>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <Tabs defaultValue={showMilestones ? 'milestones' : showBoards ? 'board' : 'files'} className="w-full">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto">
            <TabsList className={`grid w-full min-w-max gap-1 bg-transparent ${tabGridCols}`}>
              {showMilestones && (
                <TabsTrigger value="milestones" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                  <Target className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Milestones</span>
                  {totalMilestones > 0 && (
                    <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{totalMilestones}</span>
                  )}
                </TabsTrigger>
              )}
              {showBoards && (
                <TabsTrigger value="board" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                  <Kanban className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Board</span>
                </TabsTrigger>
              )}
              {showBoards && (
                <TabsTrigger value="backlog" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Backlog</span>
                  {backlogItems.length > 0 && (
                    <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{backlogItems.length}</span>
                  )}
                </TabsTrigger>
              )}
              <TabsTrigger value="files" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Files</span>
                {project.files?.length > 0 && (
                  <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{project.files.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="time-logs" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Time Logs</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1.5 text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-none rounded-lg px-4 py-2 text-sm transition-all">
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Milestones Tab ─────────────────────────────────────────── */}
          {showMilestones && (
            <TabsContent value="milestones" className="space-y-4 mt-0">
              <SectionHeader
                title="Project Milestones"
                sub={`${completedMilestones} of ${totalMilestones} completed`}
                action={
                  <div className="flex items-center gap-2">
                    {/* Filter pills */}
                    <div className="flex gap-1">
                      {['all', 'pending', 'in_progress', 'completed'].map(f => (
                        <button
                          key={f}
                          onClick={() => setMilestoneFilter(f)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all ${milestoneFilter === f ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/70'}`}
                        >
                          {f === 'all' ? 'All' : f.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    {hasPermission('projects.milestones.create') && (
                      <PrimaryButton href={route('projects.milestones.create', { project: project.id })} icon={Plus} small>
                        Add
                      </PrimaryButton>
                    )}
                  </div>
                }
              />

              {/* Milestone summary bar */}
              {totalMilestones > 0 && (
                <GlassCard className="p-4 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-white/40 text-xs">Milestone completion</span>
                        <span className="text-white text-xs font-medium">{milestoneProgress}%</span>
                      </div>
                      <div className="flex gap-px h-2 rounded-full overflow-hidden">
                        {project.milestones?.map((m: any, i: number) => (
                          <div
                            key={m.id}
                            className={`flex-1 ${m.status === 'completed' ? 'bg-green-400' : m.status === 'in_progress' ? 'bg-blue-400' : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 flex-shrink-0">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" />Done</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />Active</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/20" />Pending</span>
                    </div>
                  </div>
                </GlassCard>
              )}

              <div className="space-y-3">
                {filteredMilestones.length > 0 ? (
                  filteredMilestones.map((milestone: any) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      project={project}
                      formatDate={formatDate}
                      getStatusBadge={() => { }}
                      hasPermission={hasPermission}
                      route={route}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Target}
                    title={milestoneFilter !== 'all' ? `No ${milestoneFilter} milestones` : 'No milestones yet'}
                    description="Create milestones to track major project phases and deliverables."
                    action={hasPermission('projects.milestones.create') ? (
                      <PrimaryButton href={route('projects.milestones.create', { project: project.id })} icon={Plus}>
                        Create First Milestone
                      </PrimaryButton>
                    ) : undefined}
                  />
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Board Tab ──────────────────────────────────────────────── */}
          {showBoards && (
            <TabsContent value="board" className="mt-0">
              {board && columns.length > 0 ? (
                <BoardView
                  auth={auth}
                  project={project}
                  board={board}
                  columns={columns}
                  cards={cards}
                  embedded={true}
                />
              ) : (
                <div className="space-y-4">
                  <SectionHeader
                    title="Kanban Board"
                    sub="Visualize and manage your workflow"
                    action={hasPermission('projects.edit') ? (
                      <PrimaryButton href={route('agile.boards.create', project.id)} icon={Plus} small>
                        Create Board
                      </PrimaryButton>
                    ) : undefined}
                  />
                  <EmptyState
                    icon={Kanban}
                    title="No board created yet"
                    description="Create a board to organize work items into columns. Drag and drop cards between stages to track progress."
                    action={hasPermission('projects.edit') ? (
                      <PrimaryButton href={route('agile.boards.create', project.id)} icon={Plus}>
                        Create Board
                      </PrimaryButton>
                    ) : undefined}
                  />
                  {methodology === 'hybrid' && project.milestones?.length > 0 && (
                    <GlassCard className="p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <GitBranch className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm font-medium">Hybrid Mode Active</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          This project uses both Waterfall and Agile methodologies. Tasks and cards can be linked for synchronized tracking.
                        </p>
                      </div>
                    </GlassCard>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          {/* ── Backlog Tab ─────────────────────────────────────────────── */}
          {showBoards && (
            <TabsContent value="backlog" className="mt-0">
              <SectionHeader
                title="Product Backlog"
                sub={`${backlogItems.length} items · ${backlogItems.reduce((s: number, i: any) => s + (i.story_points || 0), 0)} story points`}
                action={
                  <div className="flex items-center gap-2">
                    <Link href={route('agile.backlog.index', project.id)}>
                      <GhostButton>
                        View Product Backlogs
                      </GhostButton>
                    </Link>

                    {hasPermission('projects.edit') && (
                      <PrimaryButton onClick={() => { setEditingBacklogItem(null); setShowBacklogModal(true); }} icon={Plus} small>
                        Add Item
                      </PrimaryButton>
                    )}
                  </div>


                }
              />

              {/* Search + filter bar */}
              {backlogItems.length > 0 && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                      value={backlogSearch}
                      onChange={e => setBacklogSearch(e.target.value)}
                      placeholder="Search backlog..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="flex gap-1">
                    {['all', 'low', 'medium', 'high', 'critical'].map(f => (
                      <button
                        key={f}
                        onClick={() => setBacklogFilter(f)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${backlogFilter === f ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white/70'}`}
                      >
                        {f === 'all' ? 'All' : f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {backlogError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {backlogError}
                </div>
              )}

              {/* Loading */}
              {loadingBacklog && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-white/5 border border-white/10 text-white/40 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              )}

              {/* Story points summary */}
              {filteredBacklog.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {(['todo', 'in_progress', 'ready', 'done'] as const).map(s => {
                    const count = filteredBacklog.filter(i => i.status === s).length;
                    const pts = filteredBacklog.filter(i => i.status === s).reduce((sum: number, i: any) => sum + (i.story_points || 0), 0);
                    const meta = {
                      todo: { label: 'To Do', color: 'text-gray-400', bg: 'bg-gray-500/10' },
                      in_progress: { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                      ready: { label: 'Ready', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      done: { label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10' },
                    }[s];
                    return (
                      <div key={s} className={`${meta.bg} border border-white/5 rounded-lg p-3`}>
                        <p className={`text-xs font-medium ${meta.color}`}>{meta.label}</p>
                        <p className="text-white font-bold text-lg">{count}</p>
                        <p className="text-white/30 text-xs">{pts} pts</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {filteredBacklog.length > 0 ? (
                  filteredBacklog.map((item: any) => (
                    <BacklogItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditBacklog}
                      onDelete={(id) => setDeleteConfirm(id)}
                      hasPermission={hasPermission}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Layers}
                    title={backlogSearch || backlogFilter !== 'all' ? 'No matching backlog items' : 'No backlog items yet'}
                    description="Manage your product backlog with prioritized user stories and tasks. Assign story points and move items into sprints."
                    action={!backlogSearch && backlogFilter === 'all' && hasPermission('projects.edit') ? (
                      <PrimaryButton onClick={() => { setEditingBacklogItem(null); setShowBacklogModal(true); }} icon={Plus}>
                        Create First Backlog Item
                      </PrimaryButton>
                    ) : undefined}
                  />
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Files Tab ──────────────────────────────────────────────── */}
          <TabsContent value="files" className="mt-0">
            <SectionHeader
              title="Project Files"
              sub={project.files?.length ? `${project.files.length} files uploaded` : 'No files yet'}
              action={hasPermission('projects.files.create') ? (
                <PrimaryButton href={route('projects.files.create', { project: project.id })} icon={Plus} small>
                  Upload File
                </PrimaryButton>
              ) : undefined}
            />
            {project.files && project.files.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {project.files.map((file: any) => <FileCard key={file.id} file={file} />)}
              </div>
            ) : (
              <EmptyState
                icon={FolderOpen}
                title="No files uploaded yet"
                description="Upload project documents, designs, and other files to keep everything in one place."
                action={hasPermission('projects.files.create') ? (
                  <PrimaryButton href={route('projects.files.create', { project: project.id })} icon={Plus}>
                    Upload First File
                  </PrimaryButton>
                ) : undefined}
              />
            )}
          </TabsContent>

          {/* ── Time Logs Tab ───────────────────────────────────────────── */}
          <TabsContent value="time-logs" className="mt-0">
            <SectionHeader
              title="Time Logs"
              sub={`${totalHoursLogged}h total · ${formatCurrency(project.total_billable_amount)} billable`}
              action={hasPermission('projects.time-logs.create') ? (
                <PrimaryButton href={route('projects.time-logs.create', { project: project.id })} icon={Timer} small>
                  Log Time
                </PrimaryButton>
              ) : undefined}
            />

            {project.time_logs && project.time_logs.length > 0 ? (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <GlassCard className="p-4 text-center">
                    <p className="text-white/40 text-xs mb-1">Total Hours</p>
                    <p className="text-white font-bold text-xl">{totalHoursLogged}h</p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <p className="text-white/40 text-xs mb-1">Billable</p>
                    <p className="text-green-400 font-bold text-xl">{formatCurrency(project.total_billable_amount)}</p>
                  </GlassCard>
                  <GlassCard className="p-4 text-center">
                    <p className="text-white/40 text-xs mb-1">Team Members</p>
                    <p className="text-white font-bold text-xl">
                      {new Set(project.time_logs.map((l: any) => l.user?.id)).size}
                    </p>
                  </GlassCard>
                </div>
                <div className="space-y-3">
                  {project.time_logs.map((log: any) => (
                    <TimeLogCard key={log.id} log={log} formatDate={formatDate} formatCurrency={formatCurrency} />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={Timer}
                title="No time logged yet"
                description="Track time spent on this project by logging work entries."
                action={hasPermission('projects.time-logs.create') ? (
                  <PrimaryButton href={route('projects.time-logs.create', { project: project.id })} icon={Timer}>
                    Log First Entry
                  </PrimaryButton>
                ) : undefined}
              />
            )}
          </TabsContent>

          {/* ── Activity Tab ────────────────────────────────────────────── */}
          <TabsContent value="activity" className="mt-0">
            <SectionHeader title="Recent Activity" sub="Project events and updates" />
            <EmptyState
              icon={Activity}
              title="Activity feed coming soon"
              description="Track changes, comments, and updates across this project in real time."
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Backlog Modal ────────────────────────────────────────────────── */}
      {showBacklogModal && (
        <BacklogModal
          projectId={project.id}
          onClose={() => { setShowBacklogModal(false); setEditingBacklogItem(null); }}
          onSave={handleSaveBacklog}
          backlogItem={editingBacklogItem}
          cards={modalCards}
          epics={epics}
          sprints={sprints}
          users={users}
        />
      )}

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      {deleteConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
          <div className="relative z-10 backdrop-blur-md bg-gray-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-center mb-2">Delete Backlog Item</h3>
            <p className="text-white/50 text-sm text-center mb-5">
              This action cannot be undone. The item will be permanently removed from the backlog.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBacklog(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// ─── Extended utility components used inline above ────────────────────────────

/**
 * RiskIndicator – shows a risk level pill with animated dot
 */
export function RiskIndicator({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) {
  const config = {
    low: { label: 'Low Risk', color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', dot: 'bg-green-400' },
    medium: { label: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30', dot: 'bg-yellow-400' },
    high: { label: 'High Risk', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', dot: 'bg-orange-400' },
    critical: { label: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', dot: 'bg-red-400' },
  }[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border font-medium ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}

/**
 * BudgetGauge – animated horizontal gauge for budget consumption
 */
export function BudgetGauge({ spent, total }: { spent: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;
  const over = pct >= 90;
  const warn = pct >= 70 && pct < 90;
  const barColor = over ? 'bg-red-400' : warn ? 'bg-yellow-400' : 'bg-green-400';
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">Budget utilisation</span>
        <span className={`font-semibold ${over ? 'text-red-400' : warn ? 'text-yellow-400' : 'text-green-400'}`}>{pct}%</span>
      </div>
      <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
        {/* threshold markers */}
        <div className="absolute top-0 bottom-0 left-[70%] w-px bg-white/20" />
        <div className="absolute top-0 bottom-0 left-[90%] w-px bg-white/20" />
      </div>
      <div className="flex justify-between text-xs text-white/30">
        <span>${spent?.toLocaleString() || 0} spent</span>
        <span>${total?.toLocaleString() || 0} total</span>
      </div>
    </div>
  );
}

/**
 * SprintBurndown placeholder – shows a mini sparkline-style progress
 */
export function SprintBurndown({ items }: { items: any[] }) {
  const total = items.length;
  const done = items.filter(i => i.status === 'done').length;
  const inProg = items.filter(i => i.status === 'in_progress').length;
  const todo = total - done - inProg;
  const doneW = total > 0 ? (done / total) * 100 : 0;
  const inProgW = total > 0 ? (inProg / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1 h-12">
        {Array.from({ length: 10 }).map((_, i) => {
          const height = 30 + Math.sin(i * 0.8) * 20 + (i > 5 ? -(i - 5) * 4 : 0);
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all ${i < done ? 'bg-green-400/60' : i < done + inProg ? 'bg-blue-400/60' : 'bg-white/10'}`}
              style={{ height: `${Math.max(8, Math.min(100, height))}%` }}
            />
          );
        })}
      </div>
      <div className="flex gap-3 text-xs text-white/40">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400/60" />{done} done</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400/60" />{inProg} in progress</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-white/10" />{todo} todo</span>
      </div>
    </div>
  );
}

/**
 * VelocityChip – shows team velocity metric
 */
export function VelocityChip({ items }: { items: any[] }) {
  const completedPts = items.filter(i => i.status === 'done').reduce((s: number, i: any) => s + (i.story_points || 0), 0);
  const totalPts = items.reduce((s: number, i: any) => s + (i.story_points || 0), 0);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
      <div>
        <p className="text-white/40 text-xs">Velocity</p>
        <p className="text-white font-bold text-lg">{completedPts} <span className="text-white/30 text-sm font-normal">/ {totalPts} pts</span></p>
      </div>
      <div className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center">
        <Zap className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
}

/**
 * TeamAvatarStack – overlapping avatars for team display
 */
export function TeamAvatarStack({ team, max = 5 }: { team: any[]; max?: number }) {
  const visible = team.slice(0, max);
  const overflow = team.length - max;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div
          key={m.id}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: visible.length - i }}
          title={m.name}
        >
          {m.name?.charAt(0)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="w-8 h-8 rounded-full bg-white/10 border-2 border-gray-900 flex items-center justify-center text-white/60 text-xs font-bold flex-shrink-0"
          style={{ marginLeft: '-8px' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

/**
 * KeyMetricRow – single metric row for details panel
 */
export function KeyMetricRow({ icon: Icon, label, value, valueClass = 'text-white/80' }: {
  icon: React.ElementType;
  label: string;
  value: string | number | React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="flex items-center gap-2 text-white/40 text-sm">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

/**
 * FilterChip – a small toggleable filter pill
 */
export function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${active
        ? 'bg-primary/20 border-primary/40 text-primary'
        : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10'
        }`}
    >
      {label}
    </button>
  );
}

/**
 * SectionDivider – subtle divider with optional label
 */
export function SectionDivider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-white/5 my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-white/5" />
      <span className="text-white/25 text-xs uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-white/5" />
    </div>
  );
}

/**
 * LoadingSpinner – consistent loading state
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={`${sz} border-2 border-white/20 border-t-primary rounded-full animate-spin`} />
  );
}

/**
 * ConfirmDialog – reusable glass confirmation modal
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
  icon: Icon,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ElementType;
}) {
  const TheIcon = Icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
      <div
        className="relative z-10 backdrop-blur-md bg-gray-900/90 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        {TheIcon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-500/20' : 'bg-primary/20'}`}>
            <TheIcon className={`w-6 h-6 ${danger ? 'text-red-400' : 'text-primary'}`} />
          </div>
        )}
        <h3 className="text-white font-semibold text-center mb-2">{title}</h3>
        <p className="text-white/50 text-sm text-center mb-5">{description}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-sm font-medium transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${danger
              ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
              : 'bg-gradient-to-r from-secondary to-primary text-white hover:opacity-90'
              }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * NotificationBanner – inline alert banner for errors/warnings/success
 */
export function NotificationBanner({
  type,
  message,
  onDismiss,
}: {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  onDismiss?: () => void;
}) {
  const config = {
    error: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', icon: AlertTriangle },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400', icon: AlertTriangle },
    success: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', icon: CheckCircle2 },
    info: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', icon: Activity },
  }[type];
  const BannerIcon = config.icon;
  return (
    <div className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${config.bg} ${config.text} text-sm`}>
      <div className="flex items-center gap-2">
        <BannerIcon className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * MilestoneTimeline – visual timeline of milestones
 */
export function MilestoneTimeline({ milestones, formatDate }: { milestones: any[]; formatDate: (d: any) => string }) {
  if (!milestones?.length) return null;
  const sorted = [...milestones].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
  return (
    <div className="relative pl-5">
      {/* vertical line */}
      <div className="absolute left-0 top-2 bottom-2 w-px bg-white/10" />
      <div className="space-y-4">
        {sorted.map((m, i) => {
          const done = m.status === 'completed';
          const days = daysUntil(m.due_date);
          const overdue = days !== null && days < 0 && !done;
          return (
            <div key={m.id} className="relative flex items-start gap-3">
              {/* dot */}
              <div className={`absolute -left-[17px] w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1 ${done ? 'bg-green-400 border-green-400' :
                overdue ? 'bg-red-400 border-red-400' :
                  'bg-white/10 border-white/30'
                }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${done ? 'text-white/50 line-through' : 'text-white/80'}`}>{m.name}</span>
                  {overdue && <span className="text-xs text-red-400">overdue</span>}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-white/30">
                  {m.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateShort(m.due_date)}</span>}
                  {m.assignee && <span>{m.assignee.name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * BacklogStatsPanel – aggregated stats for the backlog
 */
export function BacklogStatsPanel({ items }: { items: any[] }) {
  const byPriority = ['low', 'medium', 'high', 'critical'].map(p => ({
    label: p, count: items.filter(i => i.priority === p).length,
    color: priorityMeta[p]?.bar || 'bg-white/30',
  }));
  const totalPts = items.reduce((s, i) => s + (i.story_points || 0), 0);
  const completedPts = items.filter(i => i.status === 'done').reduce((s, i) => s + (i.story_points || 0), 0);
  return (
    <div className="grid grid-cols-2 gap-4">
      <GlassCard className="p-4">
        <p className="text-white/40 text-xs mb-3 uppercase tracking-wide">By Priority</p>
        <div className="space-y-2">
          {byPriority.map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-white/50 text-xs w-16 capitalize">{label}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${items.length ? (count / items.length) * 100 : 0}%` }} />
              </div>
              <span className="text-white/60 text-xs w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
      </GlassCard>
      <GlassCard className="p-4">
        <p className="text-white/40 text-xs mb-3 uppercase tracking-wide">Story Points</p>
        <div className="relative flex items-center justify-center">
          <ProgressRing value={totalPts > 0 ? (completedPts / totalPts) * 100 : 0} size={72} stroke={5} color="#a78bfa" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-sm">{completedPts}</span>
            <span className="text-white/30 text-xs">/{totalPts}</span>
          </div>
        </div>
        <p className="text-center text-white/40 text-xs mt-2">pts completed</p>
      </GlassCard>
    </div>
  );
}

/**
 * FileTypeBreakdown – shows file type distribution
 */
export function FileTypeBreakdown({ files }: { files: any[] }) {
  if (!files?.length) return null;
  const byExt: Record<string, number> = {};
  files.forEach(f => {
    const ext = f.name?.split('.').pop()?.toLowerCase() || 'other';
    byExt[ext] = (byExt[ext] || 0) + 1;
  });
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(byExt).map(([ext, count]) => (
        <span key={ext} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/50">
          .{ext} <span className="text-white/30">({count})</span>
        </span>
      ))}
    </div>
  );
}

/**
 * TimeLogSummaryByUser – group time logs by user
 */
export function TimeLogSummaryByUser({ logs, formatCurrency }: { logs: any[]; formatCurrency: (a: any) => string }) {
  if (!logs?.length) return null;
  const byUser: Record<string, { name: string; hours: number; billable: number }> = {};
  logs.forEach(l => {
    const uid = l.user?.id || 'unknown';
    if (!byUser[uid]) byUser[uid] = { name: l.user?.name || 'Unknown', hours: 0, billable: 0 };
    byUser[uid].hours += l.hours || 0;
    if (l.is_billable) byUser[uid].billable += l.total_amount || 0;
  });
  return (
    <GlassCard className="p-4 mb-4">
      <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Hours by Team Member</p>
      <div className="space-y-2.5">
        {Object.entries(byUser).map(([uid, data]) => {
          const maxHours = Math.max(...Object.values(byUser).map(d => d.hours));
          return (
            <div key={uid} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {data.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70 text-xs truncate">{data.name}</span>
                  <span className="text-white/50 text-xs">{data.hours}h</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${maxHours > 0 ? (data.hours / maxHours) * 100 : 0}%` }} />
                </div>
              </div>
              {data.billable > 0 && (
                <span className="text-green-400 text-xs flex-shrink-0">{formatCurrency(data.billable)}</span>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

/**
 * ActivityFeedPlaceholder – coming-soon activity feed with skeleton items
 */
export function ActivityFeedPlaceholder() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <GlassCard key={i} className="p-4">
          <div className="flex items-start gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4" />
              <div className="h-2.5 bg-white/5 rounded w-1/2" />
            </div>
            <div className="h-2.5 bg-white/5 rounded w-16" />
          </div>
        </GlassCard>
      ))}
      <div className="text-center py-4">
        <p className="text-white/30 text-xs">Activity feed coming soon</p>
      </div>
    </div>
  );
}

/**
 * ProjectHealthScore – computed health indicator
 */
export function ProjectHealthScore({ project }: { project: any }) {
  let score = 100;
  const issues: string[] = [];

  const days = daysUntil(project.deadline);
  if (days !== null && days < 0) { score -= 30; issues.push('Past deadline'); }
  else if (days !== null && days < 7) { score -= 10; issues.push('Deadline approaching'); }

  if (project.progress < 30 && days !== null && days < 30) { score -= 20; issues.push('Low progress'); }
  if (project.budget && project.spent_amount && (project.spent_amount / project.budget) > 0.9) {
    score -= 20; issues.push('Near budget limit');
  }
  if (!project.team?.length) { score -= 10; issues.push('No team assigned'); }

  score = Math.max(0, score);
  const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400';
  const bg = score >= 80 ? 'bg-green-500/20 border-green-500/30' : score >= 50 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-red-500/20 border-red-500/30';
  const label = score >= 80 ? 'Healthy' : score >= 50 ? 'At Risk' : 'Critical';

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white/70 text-sm font-medium">Project Health</h4>
        <span className={`px-2.5 py-1 rounded-full text-xs border font-medium ${bg} ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing value={score} size={56} stroke={5} color={score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${color}`}>{score}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {issues.length > 0 ? (
            <ul className="space-y-1">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-white/50">
                  <AlertTriangle className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All systems nominal
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// Re-export X from lucide for use in NotificationBanner above
import { X } from 'lucide-react';
import useTypedPage from '@/Hooks/useTypedPage';

/**
 * SprintSelector – dropdown to assign backlog items to a sprint inline
 */
export function SprintSelector({ sprints, value, onChange }: {
  sprints: any[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none focus:border-primary/50 transition-all"
    >
      <option value="">No sprint</option>
      {sprints.map(s => (
        <option key={s.id} value={String(s.id)}>{s.name || s.title}</option>
      ))}
    </select>
  );
}

/**
 * PriorityDot – tiny colored dot indicating priority
 */
export function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: 'bg-blue-400', medium: 'bg-yellow-400', high: 'bg-orange-400', critical: 'bg-red-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[priority] || 'bg-white/30'}`} />;
}

/**
 * StoryPointBadge – pill showing story points
 */
export function StoryPointBadge({ points }: { points: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400">
      <Star className="w-2.5 h-2.5" />
      {points}
    </span>
  );
}

/**
 * EpicChip – displays an epic association
 */
export function EpicChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
      <Zap className="w-2.5 h-2.5" />
      {name}
    </span>
  );
}

/**
 * OverduePill – red overdue indicator for time-sensitive items
 */
export function OverduePill({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 border border-red-500/30 text-red-400 animate-pulse">
      <AlertTriangle className="w-2.5 h-2.5" />
      {Math.abs(days)}d overdue
    </span>
  );
}

/**
 * DueSoonPill – amber warning for items due within 7 days
 */
export function DueSoonPill({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
      <Clock className="w-2.5 h-2.5" />
      {days}d left
    </span>
  );
}

/**
 * BoardColumnSummary – compact summary of board column stats
 */
export function BoardColumnSummary({ columns, cards }: { columns: any[]; cards: any[] }) {
  if (!columns.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {columns.slice(0, 4).map(col => {
        const colCards = cards.filter(c => c.column_id === col.id || c.board_column_id === col.id);
        return (
          <GlassCard key={col.id} className="p-3">
            <p className="text-white/40 text-xs truncate mb-1">{col.name || col.title}</p>
            <p className="text-white font-bold text-xl">{colCards.length}</p>
            <p className="text-white/30 text-xs">cards</p>
          </GlassCard>
        );
      })}
    </div>
  );
}

/**
 * ProjectCompletionBanner – shown when project is completed
 */
export function ProjectCompletionBanner({ projectName }: { projectName: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-r from-green-500/20 via-emerald-500/10 to-teal-500/20 border border-green-500/30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/30 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h4 className="text-green-400 font-semibold">Project Completed!</h4>
          <p className="text-white/50 text-sm mt-0.5">
            <span className="text-white/70">{projectName}</span> has been successfully delivered.
          </p>
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-green-500/10" />
      <div className="absolute -right-8 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/5" />
    </div>
  );
}

/**
 * OnHoldBanner – shown when project is on hold
 */
export function OnHoldBanner({ reason }: { reason?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
      <div className="w-9 h-9 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
        <Pause className="w-4 h-4 text-yellow-400" />
      </div>
      <div>
        <p className="text-yellow-400 font-medium text-sm">Project On Hold</p>
        {reason && <p className="text-white/40 text-xs mt-0.5">{reason}</p>}
      </div>
    </div>
  );
}

/**
 * CriticalAlertBanner – shown for projects with critical priority + overdue
 */
export function CriticalAlertBanner({ deadline }: { deadline: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
      </div>
      <div>
        <p className="text-red-400 font-semibold text-sm">Critical: Deadline Passed</p>
        <p className="text-white/40 text-xs mt-0.5">
          Project deadline was {formatDate(deadline)}. Immediate action required.
        </p>
      </div>
    </div>
  );
}

/**
 * useProjectAlerts – hook to derive alert banners from project state
 */
export function useProjectAlerts(project: any): Array<{ type: 'error' | 'warning' | 'success' | 'info'; message: string }> {
  return React.useMemo(() => {
    const alerts: Array<{ type: 'error' | 'warning' | 'success' | 'info'; message: string }> = [];
    const days = daysUntil(project?.deadline);
    if (project?.status === 'on-hold') alerts.push({ type: 'warning', message: 'This project is currently on hold.' });
    if (days !== null && days < 0 && project?.status !== 'completed') alerts.push({ type: 'error', message: `Project deadline passed ${Math.abs(days)} day(s) ago.` });
    if (days !== null && days >= 0 && days <= 3 && project?.status !== 'completed') alerts.push({ type: 'warning', message: `Project deadline is in ${days} day(s).` });
    if (project?.budget && project?.spent_amount && (project.spent_amount / project.budget) > 0.9) alerts.push({ type: 'warning', message: 'Budget is over 90% utilised.' });
    if (project?.status === 'completed') alerts.push({ type: 'success', message: 'This project has been marked as completed.' });
    return alerts;
  }, [project]);
}

/**
 * BacklogGroupedBySprint – groups backlog items by their sprint assignment
 */
export function BacklogGroupedBySprint({ items, sprints, onEdit, onDelete, hasPermission }: {
  items: any[];
  sprints: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  hasPermission: (p: string) => boolean;
}) {
  const unassigned = items.filter(i => !i.sprint_id);
  const bySprint = sprints.map(s => ({
    sprint: s,
    items: items.filter(i => i.sprint_id === s.id),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      {bySprint.map(({ sprint, items: sprintItems }) => (
        <div key={sprint.id}>
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <h4 className="text-white/70 text-sm font-medium">{sprint.name || sprint.title}</h4>
            <span className="text-xs text-white/30">({sprintItems.length} items · {sprintItems.reduce((s: number, i: any) => s + (i.story_points || 0), 0)} pts)</span>
          </div>
          <div className="space-y-2.5">
            {sprintItems.map((item: any) => (
              <BacklogItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} hasPermission={hasPermission} />
            ))}
          </div>
        </div>
      ))}
      {unassigned.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-white/30" />
            <h4 className="text-white/50 text-sm font-medium">Unassigned</h4>
            <span className="text-xs text-white/30">({unassigned.length} items)</span>
          </div>
          <div className="space-y-2.5">
            {unassigned.map((item: any) => (
              <BacklogItemCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} hasPermission={hasPermission} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ProjectSharePanel – shows share/export options
 */
export function ProjectSharePanel({ project, route }: { project: any; route: any }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <GlassCard className="p-5">
      <h4 className="text-white/70 text-sm font-medium mb-4">Share & Export</h4>
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all text-left"
        >
          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          {copied ? 'Copied!' : 'Copy project link'}
        </button>
        <Link
          href={route('projects.livechat', project.id)}
          className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          Open project chat
        </Link>
      </div>
    </GlassCard>
  );
}