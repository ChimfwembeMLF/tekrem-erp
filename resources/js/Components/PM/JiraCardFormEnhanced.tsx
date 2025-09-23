import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/Components/ui/tabs';
import { 
  Calendar,
  Clock,
  User,
  Tag,
  Flag,
  MoreHorizontal,
  Plus,
  CheckSquare,
  MessageSquare,
  ChevronDown,
  Zap,
  Eye,
  Save,
  X,
  Target,
  Bug,
  BookOpen
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface JiraCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  card?: any;
  mode: 'create' | 'edit';
  columnId?: number;
  employees?: Array<{
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  }>;
}

export function JiraCardForm({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  mode, 
  columnId,
  employees = []
}: JiraCardFormProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [type, setType] = useState(card?.type || 'task');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [assignee, setAssignee] = useState(card?.assignee_id?.toString() || card?.assignee || '');
  const [status, setStatus] = useState(card?.status || 'To Do');
  const [labels, setLabels] = useState<string[]>(card?.labels || []);
  const [storyPoints, setStoryPoints] = useState(card?.story_points || '');
  const [dueDate, setDueDate] = useState(card?.due_date || '');
  const [activeTab, setActiveTab] = useState('details');

  // Reset form when card changes
  useEffect(() => {
    setTitle(card?.title || '');
    setDescription(card?.description || '');
    setType(card?.type || 'task');
    setPriority(card?.priority || 'medium');
    setAssignee(card?.assignee_id?.toString() || card?.assignee || '');
    setStatus(card?.status || 'To Do');
    setLabels(card?.labels || []);
    setStoryPoints(card?.story_points || '');
    setDueDate(card?.due_date || '');
  }, [card]);

  const priorityOptions = [
    { value: 'highest', label: 'Highest', color: 'text-red-600', icon: '🔺' },
    { value: 'high', label: 'High', color: 'text-red-500', icon: '🔹' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500', icon: '🔶' },
    { value: 'low', label: 'Low', color: 'text-green-500', icon: '🔽' },
    { value: 'lowest', label: 'Lowest', color: 'text-muted-foreground', icon: '🔻' }
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'Review', label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-800' }
  ];

  const typeOptions = [
    { value: 'task', label: 'Task', icon: <Zap className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
    { value: 'bug', label: 'Bug', icon: <Bug className="h-4 w-4" />, color: 'text-red-600 bg-red-50' },
    { value: 'story', label: 'Story', icon: <BookOpen className="h-4 w-4" />, color: 'text-green-600 bg-green-50' },
    { value: 'epic', label: 'Epic', icon: <Target className="h-4 w-4" />, color: 'text-purple-600 bg-purple-50' },
  ];

  const handleSave = () => {
    const data = {
      id: card?.id,
      title,
      description,
      type,
      priority,
      assignee_id: assignee,
      status,
      labels,
      story_points: storyPoints ? parseInt(storyPoints) : null,
      due_date: dueDate,
      column_id: columnId || card?.column_id
    };
    onSave(data);
  };

  const handleAddLabel = (labelName: string) => {
    if (labelName && !labels.includes(labelName)) {
      setLabels([...labels, labelName]);
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label: string) => label !== labelToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden flex flex-col bg-card">
        <DialogHeader className="flex-none border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Create Issue' : 'Edit Issue'}
            </h2>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="text-sm font-medium text-foreground mb-2 block">
                Summary *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="text-lg font-medium"
                required
              />
            </div>

            {/* Description with WYSIWYG */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description
              </label>
              <div className="border border-input rounded-md overflow-hidden">
                <MDEditor
                  value={description}
                  onChange={(val) => setDescription(val || '')}
                  preview="edit"
                  hideToolbar={false}
                  height={300}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Supports markdown formatting. Use the preview tab to see how it will look.
              </p>
            </div>

            {/* Acceptance Criteria */}
            <div className="mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Acceptance Criteria
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 border border-input rounded">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Add acceptance criteria..." className="border-none shadow-none" />
                </div>
                <Button variant="ghost" size="sm" className="text-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add criteria
                </Button>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Activity</label>
              </div>
              <div className="space-y-3">
                <div className="border border-input rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                      U
                    </div>
                    <span className="text-sm font-medium text-foreground">Add a comment...</span>
                  </div>
                  <textarea
                    placeholder="Add a comment..."
                    className="w-full p-2 border border-input rounded text-sm resize-none bg-background text-foreground placeholder:text-muted-foreground"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm">Comment</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-border p-6 bg-muted/30">
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Assignee</label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="w-full">
                    <User className="h-4 w-4 text-muted-foreground mr-2" />
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        <div className="flex items-center gap-2">
                          {employee.avatar ? (
                            <img 
                              src={employee.avatar} 
                              alt={employee.name}
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                          )}
                          <span>{employee.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reporter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Reporter</label>
                <div className="flex items-center gap-2 p-2 border border-input rounded bg-background">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground font-medium">
                    CK
                  </div>
                  <span className="text-sm text-foreground">Chimfwembe Kangwa</span>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span className={option.color}>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Labels */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Labels</label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {labels.map(label => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                      >
                        {label}
                        <button
                          onClick={() => handleRemoveLabel(label)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Add label..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddLabel(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Story Points */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Story Points</label>
                <Input
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="None"
                  type="number"
                  min="1"
                  max="100"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Due Date</label>
                <div className="flex items-center gap-2 p-2 border border-input rounded bg-background">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="border-none shadow-none p-0"
                  />
                </div>
              </div>

              {/* Sprint */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Sprint</label>
                <div className="flex items-center gap-2 p-2 border border-input rounded bg-background">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-primary font-medium">CBS Sprint 1</span>
                </div>
              </div>

              {/* More Fields */}
              <div>
                <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add more fields
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}