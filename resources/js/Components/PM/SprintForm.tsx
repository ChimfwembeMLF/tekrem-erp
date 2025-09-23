import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge.jsx';
import { Modal } from '@/Components/ui/modal';
import { Save, X, Calendar, Target, Flag } from 'lucide-react';

export type SprintFormData = {
  id?: number;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  board_id: number;
};

interface SprintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SprintFormData) => void;
  initialData?: Partial<SprintFormData>;
  boardId: number;
  mode: 'create' | 'edit';
}

const statusOptions = [
  { value: 'planned', label: 'Planned', color: 'bg-gray-100 text-gray-700' },
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-500' },
];

export function SprintForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = {}, 
  boardId, 
  mode 
}: SprintFormProps) {
  const [formData, setFormData] = useState<SprintFormData>({
    name: '',
    goal: '',
    start_date: '',
    end_date: '',
    status: 'planned',
    board_id: boardId,
    ...initialData,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, board_id: boardId });
    onClose();
  };

  const handleChange = (field: keyof SprintFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Sprint' : 'Edit Sprint'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sprint Name *
          </label>
          <Input
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
            placeholder="e.g., Sprint 1, Feature Development Sprint..."
            required
            className="w-full"
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Target className="h-4 w-4 inline mr-1" />
            Sprint Goal
          </label>
          <textarea
            value={formData.goal}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('goal', e.target.value)}
            placeholder="What is the main objective of this sprint?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('start_date', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('end_date', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Flag className="h-4 w-4 inline mr-1" />
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sprint Duration Info */}
        {formData.start_date && formData.end_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Duration:</strong> {
                Math.ceil(
                  (new Date(formData.end_date).getTime() - new Date(formData.start_date).getTime()) 
                  / (1000 * 60 * 60 * 24)
                )
              } days
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            {mode === 'create' ? 'Create Sprint' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}