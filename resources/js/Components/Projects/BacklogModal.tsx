import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { BacklogItem } from '@/types/BacklogItem';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Layers, Flag, User, GitBranch, Zap, Hash, AlignLeft, Tag, BarChart2 } from 'lucide-react';

interface BacklogModalProps {
  projectId: number;
  onClose: () => void;
  onSave: (item: BacklogItem) => void;
  backlogItem?: BacklogItem;
  cards?: any[];
  epics?: any[];
  sprints?: any[];
  users?: any[];
}

const priorities = ['low', 'medium', 'high', 'critical'];
const types = ['product', 'sprint'];
const statuses = ['todo', 'in_progress', 'done', 'ready', 'removed'];

const priorityConfig: Record<string, { color: string; bg: string }> = {
  low:      { color: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30' },
  medium:   { color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  high:     { color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  critical: { color: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/30' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  todo:        { label: 'To Do',       color: 'text-gray-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-400' },
  done:        { label: 'Done',        color: 'text-green-400' },
  ready:       { label: 'Ready',       color: 'text-purple-400' },
  removed:     { label: 'Removed',     color: 'text-red-400' },
};

function FieldGroup({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      {children}
    </div>
  );
}

const glassInput = "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-primary/60 focus:ring-primary/20 focus:bg-white/10 transition-all duration-200";
const glassSelect = "bg-white/5 border-white/10 text-white";

export default function BacklogModal({
  projectId, onClose, onSave, backlogItem,
  cards = [], epics = [], sprints = [], users = []
}: BacklogModalProps) {
  const [title, setTitle]             = useState(backlogItem?.title || '');
  const [description, setDescription] = useState(backlogItem?.description || '');
  const [storyPoints, setStoryPoints] = useState(backlogItem?.story_points || 1);
  const [priority, setPriority]       = useState(backlogItem?.priority || 'medium');
  const [type, setType]               = useState(backlogItem?.type || 'product');
  const [cardId, setCardId]           = useState(String(backlogItem?.card_id || ''));
  const [epicId, setEpicId]           = useState(String(backlogItem?.epic_id || ''));
  const [sprintId, setSprintId]       = useState(String(backlogItem?.sprint_id || ''));
  const [status, setStatus]           = useState(backlogItem?.status || 'todo');
  const [assignedTo, setAssignedTo]   = useState(String(backlogItem?.assigned_to || ''));
  const [order, setOrder]             = useState(backlogItem?.order || 0);
  const [metadata, setMetadata]       = useState(JSON.stringify(backlogItem?.metadata || {}, null, 2));
  const [metaError, setMetaError]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedMeta = {};
    try { parsedMeta = JSON.parse(metadata); } catch { setMetaError(true); return; }
    onSave({
      id: backlogItem?.id,
      project_id: projectId,
      card_id: cardId && cardId !== 'none' ? Number(cardId) : undefined,
      epic_id: epicId && epicId !== 'none' ? Number(epicId) : undefined,
      sprint_id: sprintId && sprintId !== 'none' ? Number(sprintId) : undefined,
      assigned_to: assignedTo && assignedTo !== 'none' ? Number(assignedTo) : undefined,
      type, title, description, priority, story_points: storyPoints,
      status, order, metadata: parsedMeta,
    });
  };

  const isEditing = !!backlogItem;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-4 text-left">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-primary">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <SheetTitle>{isEditing ? 'Edit Backlog Item' : 'New Backlog Item'}</SheetTitle>
              <p className="text-xs text-muted-foreground">Project #{projectId}</p>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">

            {/* Title */}
            <FieldGroup icon={AlignLeft} label="Title">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                required
                className={glassInput}
              />
            </FieldGroup>

            {/* Description */}
            <FieldGroup icon={AlignLeft} label="Description">
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add more context..."
                rows={3}
                className={`${glassInput} resize-none`}
              />
            </FieldGroup>

            {/* Row: Type + Status */}
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup icon={Tag} label="Type">
                <Select value={type} onValueChange={val => setType(val as 'product' | 'sprint')}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {types.map(t => (
                      <SelectItem key={t} value={t} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup icon={BarChart2} label="Status">
                <Select value={status} onValueChange={val => setStatus(val as typeof status)}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {statuses.map(s => (
                      <SelectItem key={s} value={s} className={`${statusConfig[s]?.color} focus:bg-white/10`}>
                        {statusConfig[s]?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>

            {/* Row: Priority + Story Points */}
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup icon={Flag} label="Priority">
                <Select value={priority} onValueChange={val => setPriority(val as typeof priority)}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {priorities.map(p => (
                      <SelectItem key={p} value={p} className={`${priorityConfig[p]?.color} focus:bg-white/10`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup icon={Hash} label="Story Points">
                <Input
                  type="number"
                  value={storyPoints}
                  min={1}
                  max={100}
                  onChange={e => setStoryPoints(Number(e.target.value))}
                  required
                  className={glassInput}
                />
              </FieldGroup>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Card */}
            {cards.length > 0 && (
              <FieldGroup icon={Layers} label="Card">
                <Select value={cardId} onValueChange={setCardId}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="none" className="text-white/50 focus:bg-white/10 focus:text-white">None</SelectItem>
                    {cards.map(card => (
                      <SelectItem key={card.id} value={String(card.id)} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {card.title || card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            )}

            {/* Epic */}
            {epics.length > 0 && (
              <FieldGroup icon={Zap} label="Epic">
                <Select value={epicId} onValueChange={setEpicId}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue placeholder="Select an epic" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="none" className="text-white/50 focus:bg-white/10 focus:text-white">None</SelectItem>
                    {epics.map(epic => (
                      <SelectItem key={epic.id} value={String(epic.id)} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {epic.title || epic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            )}

            {/* Sprint */}
            {sprints.length > 0 && (
              <FieldGroup icon={GitBranch} label="Sprint">
                <Select value={sprintId} onValueChange={setSprintId}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue placeholder="Select a sprint" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="none" className="text-white/50 focus:bg-white/10 focus:text-white">None</SelectItem>
                    {sprints.map(sprint => (
                      <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {sprint.title || sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            )}

            {/* Row: Assigned To + Order */}
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup icon={User} label="Assignee">
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className={`w-full ${glassSelect}`}>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    <SelectItem value="none" className="text-white/50 focus:bg-white/10 focus:text-white">Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={String(user.id)} className="text-white/80 focus:bg-white/10 focus:text-white">
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup icon={Hash} label="Order">
                <Input
                  type="number"
                  value={order}
                  min={0}
                  onChange={e => setOrder(Number(e.target.value))}
                  className={glassInput}
                />
              </FieldGroup>
            </div>

            {/* Metadata */}
            <FieldGroup icon={AlignLeft} label="Metadata (JSON)">
              <Textarea
                value={metadata}
                onChange={e => { setMetaError(false); setMetadata(e.target.value); }}
                rows={2}
                className={`${glassInput} resize-none font-mono text-xs ${metaError ? 'border-red-500/60' : ''}`}
                placeholder="{}"
              />
              {metaError && <p className="text-red-400 text-xs mt-1">Invalid JSON — please fix before saving.</p>}
            </FieldGroup>

          </div>

          {/* Footer actions */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t px-6 py-4">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {isEditing ? `Editing item #${backlogItem?.id}` : 'New item will be added to the backlog'}
            </p>
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}