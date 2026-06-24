import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/Components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Save, X, Plus, Calendar, User, Flag, Target, Bug, Zap, BookOpen } from 'lucide-react';

export type CardFormData = {
  id?: number;
  title: string;
  description: string;
  type: string;
  priority: string;
  story_points: number | null;
  due_date: string;
  assignees: string[];
  tags: string[];
  epic_id: number | null;
  sprint_id: number | null;
};

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CardFormData) => void;
  initialData?: Partial<CardFormData>;
  columnId: number;
  mode: 'create' | 'edit';
}

const typeOptions = [
  { value: 'task', label: 'Task', icon: <Zap className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
  { value: 'bug', label: 'Bug', icon: <Bug className="h-4 w-4" />, color: 'text-red-600 bg-red-50' },
  { value: 'story', label: 'Story', icon: <BookOpen className="h-4 w-4" />, color: 'text-green-600 bg-green-50' },
  { value: 'epic', label: 'Epic', icon: <Target className="h-4 w-4" />, color: 'text-purple-600 bg-purple-50' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-50' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-50' },
  { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-50' },
];

const storyPointOptions = [1, 2, 3, 5, 8, 13, 21];

export function CardForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {}, 
  columnId, 
  mode 
}: CardFormProps) {
  const [formData, setFormData] = useState<CardFormData>({
    title: '',
    description: '',
    type: 'task',
    priority: 'medium',
    story_points: null,
    due_date: '',
    assignees: [],
    tags: [],
    epic_id: null,
    sprint_id: null,
    ...initialData,
  });

  const [newTag, setNewTag] = useState('');
  const [newAssignee, setNewAssignee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddAssignee = () => {
    if (newAssignee.trim() && !formData.assignees.includes(newAssignee.trim())) {
      setFormData(prev => ({
        ...prev,
        assignees: [...prev.assignees, newAssignee.trim()]
      }));
      setNewAssignee('');
    }
  };

  const handleRemoveAssignee = (assigneeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.filter(assignee => assignee !== assigneeToRemove)
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>{mode === 'create' ? 'Create New Card' : 'Edit Card'}</SheetTitle>
          <SheetDescription>
            {mode === 'create' ? 'Add a new card to the board.' : 'Update card details.'}
          </SheetDescription>
        </SheetHeader>

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Title */}
        <div>
          <Label className="mb-2 block">Title *</Label>
          <Input
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter card title..."
            required
            className="w-full"
          />
        </div>

        {/* Type and Priority Row - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Issue Type *</Label>
            <Select value={formData.type} onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="mb-2 block">
              <Flag className="h-4 w-4 inline mr-1" />
              Priority
            </Label>
            <Select value={formData.priority} onValueChange={(value: string) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="mb-2 block">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter card description..."
            rows={4}
          />
        </div>

        {/* Story Points and Due Date Row - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">
              <Target className="h-4 w-4 inline mr-1" />
              Story Points
            </Label>
            <Select 
              value={formData.story_points?.toString() || ""} 
              onValueChange={(value: string) => setFormData(prev => ({ 
                ...prev, 
                story_points: value ? parseInt(value) : null 
              }))}
            >
              <SelectTrigger className="w-full h-11 sm:h-10 text-base sm:text-sm">
                <SelectValue placeholder="Select story points" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No points</SelectItem>
                {storyPointOptions.map(points => (
                  <SelectItem key={points} value={points.toString()}>
                    {points} points
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">
              <Calendar className="h-4 w-4 inline mr-1" />
              Due Date
            </Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full h-11 sm:h-10 text-base sm:text-sm"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="mb-2 block">Tags</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newTag}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 h-10 sm:h-9 text-base sm:text-sm"
            />
            <Button type="button" onClick={handleAddTag} size="sm" className="h-10 sm:h-9 px-3">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Assignees */}
        <div>
          <Label className="mb-2 block">
            <User className="h-4 w-4 inline mr-1" />
            Assignees
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newAssignee}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAssignee(e.target.value)}
              placeholder="Add assignee..."
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddAssignee())}
              className="flex-1"
            />
            <Button type="button" onClick={handleAddAssignee} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.assignees.map(assignee => (
              <Badge
                key={assignee}
                variant="outline"
                className="flex items-center gap-1"
              >
                {assignee}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveAssignee(assignee)}
                />
              </Badge>
            ))}
          </div>
        </div>
        </div>

        <SheetFooter className="border-t px-4 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            {mode === 'create' ? 'Create Card' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </form>
      </SheetContent>
    </Sheet>
  );
}