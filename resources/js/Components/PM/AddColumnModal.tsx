import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
// @ts-ignore
import { Label } from '@/Components/ui/label';
// @ts-ignore
import { Textarea } from '@/Components/ui/textarea';
// @ts-ignore
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
// @ts-ignore
import { Switch } from '@/Components/ui/switch';
// @ts-ignore
import { Badge } from '@/Components/ui/badge';
import { 
  Plus, 
  Columns, 
  Palette, 
  ArrowUpDown,
  Save,
  X,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface BoardColumn {
  id: number;
  name: string;
  description?: string;
  color?: string;
  order?: number;
  is_done_column?: boolean;
}

interface AddColumnModalProps {
  open: boolean;
  onClose: () => void;
  boardId: number;
  projectId: number;
  existingColumns: BoardColumn[];
  editColumn?: BoardColumn | null;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
  color: string;
  order: number;
  is_done_column: boolean;
}

const PRESET_COLORS = [
  { name: 'Blue', value: '#3498DB', bg: 'bg-blue-500' },
  { name: 'Green', value: '#27AE60', bg: 'bg-green-500' },
  { name: 'Orange', value: '#F39C12', bg: 'bg-orange-500' },
  { name: 'Red', value: '#E74C3C', bg: 'bg-red-500' },
  { name: 'Purple', value: '#9B59B6', bg: 'bg-purple-500' },
  { name: 'Teal', value: '#1ABC9C', bg: 'bg-teal-500' },
  { name: 'Gray', value: '#95A5A6', bg: 'bg-gray-500' },
  { name: 'Pink', value: '#E91E63', bg: 'bg-pink-500' },
  { name: 'Indigo', value: '#3F51B5', bg: 'bg-indigo-500' },
  { name: 'Cyan', value: '#00BCD4', bg: 'bg-cyan-500' },
];

const COLUMN_TEMPLATES = [
  { name: 'To Do', color: '#3498DB', description: 'Tasks ready to be worked on' },
  { name: 'In Progress', color: '#F39C12', description: 'Tasks currently being worked on' },
  { name: 'In Review', color: '#9B59B6', description: 'Tasks under review or testing' },
  { name: 'Done', color: '#27AE60', description: 'Completed tasks', isDone: true },
  { name: 'Blocked', color: '#E74C3C', description: 'Tasks that are blocked or on hold' },
  { name: 'Testing', color: '#E67E22', description: 'Tasks in testing phase' },
];

export default function AddColumnModal({
  open,
  onClose,
  boardId,
  projectId,
  existingColumns,
  editColumn,
  onSuccess,
}: AddColumnModalProps) {
  const route = useRoute();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(!editColumn);

  const { data, setData, post, put, processing, errors, reset } = useForm<FormData>({
    name: '',
    description: '',
    color: '#3498DB',
    order: (existingColumns?.length || 0) + 1,
    is_done_column: false,
  });

  // Reset form when modal opens/closes or edit column changes
  useEffect(() => {
    if (open) {
      if (editColumn) {
        setData({
          name: editColumn.name,
          description: editColumn.description || '',
          color: editColumn.color || '#3498DB',
          order: editColumn.order || (existingColumns?.length || 0) + 1,
          is_done_column: editColumn.is_done_column || false,
        });
        setShowTemplates(false);
      } else {
        reset();
        setData('order', (existingColumns?.length || 0) + 1);
        setShowTemplates(true);
      }
      setSelectedTemplate('');
    }
  }, [open, editColumn, existingColumns?.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editColumn) {
      // Update existing column
      put(route('pm.columns.update', editColumn.id), {
        onSuccess: () => {
          toast.success('Column updated successfully');
          onSuccess?.();
          onClose();
        },
        onError: (errors) => {
          console.error('Error updating column:', errors);
          toast.error('Failed to update column. Please try again.');
        }
      });
    } else {
      // Create new column
      post(route('pm.boards.columns.store', { project: projectId, board: boardId }), {
        onSuccess: () => {
          toast.success('Column created successfully');
          onSuccess?.();
          onClose();
        },
        onError: (errors) => {
          console.error('Error creating column:', errors);
          toast.error('Failed to create column. Please try again.');
        }
      });
    }
  };

  const handleTemplateSelect = (template: typeof COLUMN_TEMPLATES[0]) => {
    setData({
      ...data,
      name: template.name,
      description: template.description,
      color: template.color,
      is_done_column: template.isDone || false,
    });
    setSelectedTemplate(template.name);
    setShowTemplates(false);
  };

  const handleColorSelect = (color: string) => {
    setData('color', color);
  };

  const getPositionText = (order: number) => {
    const position = order;
    if (position === 1) return 'First column';
    if (position === (existingColumns?.length || 0) + 1) return 'Last column';
    return `Position ${position}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="h-5 w-5" />
            {editColumn ? 'Edit Column' : 'Add New Column'}
          </DialogTitle>
          <DialogDescription>
            {editColumn 
              ? 'Update the column settings and configuration'
              : 'Create a new column to organize your tasks and workflow'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection (only for new columns) */}
          {showTemplates && !editColumn && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Quick Templates</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Custom
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COLUMN_TEMPLATES.map((template) => (
                  <Button
                    key={template.name}
                    type="button"
                    variant="outline"
                    className="justify-start p-3 h-auto"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: template.color }}
                      />
                      <div className="text-left">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Form */}
          <div className="space-y-4">
            {/* Column Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Column Name *</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Enter column name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)}
                placeholder="Describe the purpose of this column (optional)"
                rows={2}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Column Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="outline"
                    className={`p-2 h-auto ${
                      data.color === color.value ? 'ring-2 ring-ring' : ''
                    }`}
                    onClick={() => handleColorSelect(color.value)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-6 h-6 rounded-full ${color.bg}`}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-color" className="text-sm">Custom:</Label>
                <input
                  id="custom-color"
                  type="color"
                  value={data.color}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-8 h-8 rounded border"
                />
                <span className="text-sm text-muted-foreground">{data.color}</span>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Position
              </Label>
              <Select 
                value={data.order.toString()} 
                onValueChange={(value: string) => setData('order', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: (existingColumns?.length || 0) + 1 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {getPositionText(i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose where this column appears in the board
              </p>
            </div>

            {/* Done Column Setting */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Done Column</Label>
                <p className="text-xs text-muted-foreground">
                  Mark this column as a "done" state for completed tasks
                </p>
              </div>
              <Switch
                checked={data.is_done_column}
                onCheckedChange={(checked) => setData('is_done_column', checked)}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: data.color }}
                />
                <span className="font-medium">{data.name || 'Column Name'}</span>
                {data.is_done_column && (
                  <Badge variant="secondary" className="text-xs">Done</Badge>
                )}
              </div>
              {data.description && (
                <p className="text-sm text-muted-foreground">{data.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Cards can be moved between columns</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={processing || !data.name.trim()}>
                <Save className="h-4 w-4 mr-2" />
                {processing 
                  ? (editColumn ? 'Updating...' : 'Creating...') 
                  : (editColumn ? 'Update Column' : 'Create Column')
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}