import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
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
  Eye
} from 'lucide-react';

interface JiraCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  card?: any;
  mode: 'create' | 'edit';
  columnId?: number;
}

export function JiraCardForm({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  mode, 
  columnId
}: JiraCardFormProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [status, setStatus] = useState(card?.status || 'To Do');
  const [activeTab, setActiveTab] = useState('details');

  const priorityOptions = [
    { value: 'highest', label: 'Highest', color: 'text-red-600', icon: '🔺' },
    { value: 'high', label: 'High', color: 'text-red-500', icon: '🔹' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500', icon: '🔶' },
    { value: 'low', label: 'Low', color: 'text-green-500', icon: '🔽' },
    { value: 'lowest', label: 'Lowest', color: 'text-gray-500', icon: '🔻' }
  ];

  const statusOptions = [
    { value: 'To Do', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'In Review', label: 'In Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-800' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      id: card?.id,
      title,
      description,
      priority,
      assignee,
      status,
      column_id: columnId
    };
    onSave(formData);
  };

  const selectedPriority = priorityOptions.find(p => p.value === priority);
  const selectedStatus = statusOptions.find(s => s.value === status);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full max-w-6xl flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <div className="flex flex-1 overflow-y-auto">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <SheetHeader className="mb-6 text-left">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>CBS-175</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedStatus?.color}`}>
                  {selectedStatus?.label}
                </span>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    Improve work item
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Implement endpoint to transfer a center between loan officers"
                  className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
                  style={{ fontSize: '20px', fontWeight: 600 }}
                />
              </div>

              {/* Tabs */}
              <div className="w-full">
                <div className="flex space-x-1 mb-4 border-b">
                  {['details', 'comments', 'history', 'worklog'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-2 text-sm font-medium capitalize ${
                        activeTab === tab 
                          ? 'border-b-2 border-blue-500 text-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'worklog' ? 'Work log' : tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Create a REST API endpoint to allow branch managers to transfer a center from one loan officer to another."
                        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Implementation Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Implementation Details</h4>
                        <ul className="space-y-1 text-sm text-gray-700 bg-gray-50 p-4 rounded">
                          <li>• <strong>Route:</strong> POST /api/v1/centers/transfer</li>
                          <li>• <strong>Request body:</strong> {`{ centerId, fromLoanOfficerId, toLoanOfficerId }`}</li>
                          <li>• Only accessible to branch managers</li>
                          <li>• Updates center assignment and related fields</li>
                        </ul>
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Acceptance Criteria:
                      </label>
                      <textarea
                        placeholder="• Endpoint validates center and loan officer IDs&#10;• Center is reassigned to the new loan officer&#10;• Proper error handling for invalid requests"
                        className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Subtasks */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Subtasks</h4>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          Add subtask
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        No subtasks added yet
                      </div>
                    </div>

                    {/* Connected work items */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Connected work items</h4>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          Add connected work item
                        </Button>
                      </div>
                      <div className="text-sm text-gray-500">
                        No connected items
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        CK
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Add a comment..."
                          className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>💪 Looks good!</span>
                            <span>⚠️ Need help?</span>
                            <span>🚫 This is blocked...</span>
                            <span>🔍 Can you clarify...?</span>
                            <span>✅ This is ok...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              Pro tip: press M to comment
                            </span>
                            <Button size="sm">
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="text-sm text-gray-500">
                    Activity history will appear here
                  </div>
                )}

                {activeTab === 'worklog' && (
                  <div className="text-sm text-gray-500">
                    Work log entries will appear here
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-gray-50 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Details</h3>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Status
              </label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Assignee
              </label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  CK
                </div>
                <span className="text-sm">Chimfwembe Kangwa</span>
              </div>
            </div>

            {/* Reporter */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Reporter
              </label>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  CK
                </div>
                <span className="text-sm">Chimfwembe Kangwa</span>
              </div>
            </div>

            {/* Development */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Development
              </label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Open with VS Code
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <span className="w-4 h-4 mr-2">🌿</span>
                  Create branch
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <span className="w-4 h-4 mr-2">📝</span>
                  Create commit
                </Button>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Priority
              </label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sprint */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Sprint
              </label>
              <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 border border-blue-200 rounded">
                CBS Sprint 1
              </span>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Labels
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
              >
                Add labels
              </Button>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Due date
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
              >
                Add due date
              </Button>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created 3 days ago</div>
              <div>Updated 7 days ago</div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}