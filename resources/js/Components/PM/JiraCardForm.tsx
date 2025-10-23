import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/Components/ui/dialog';
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
  Link,
  Bell,
  Share,
  ChevronDown,
  Zap,
  Eye,
  Settings
} from 'lucide-react';

interface JiraCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  card?: any;
  mode: 'create' | 'edit';
  columnId?: number;
  projectMembers?: any[];
  sprints?: any[];
}

export function JiraCardForm({ 
  isOpen, 
  onClose, 
  onSave, 
  card, 
  mode, 
  columnId,
  projectMembers = [],
  sprints = []
}: JiraCardFormProps) {
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [priority, setPriority] = useState(card?.priority || 'medium');
  const [assignee, setAssignee] = useState(card?.assignee || '');
  const [reporter, setReporter] = useState(card?.reporter || 'Chimfwembe Kangwa');
  const [status, setStatus] = useState(card?.status || 'To Do');
  const [labels, setLabels] = useState(card?.labels || []);
  const [dueDate, setDueDate] = useState(card?.due_date || '');
  const [startDate, setStartDate] = useState(card?.start_date || '');
  const [sprint, setSprint] = useState(card?.sprint || '');
  const [storyPoints, setStoryPoints] = useState(card?.story_points || '');
  const [originalEstimate, setOriginalEstimate] = useState(card?.original_estimate || '');
  const [timeTracking, setTimeTracking] = useState(card?.time_tracking || '');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(card?.acceptance_criteria || '');
  const [comment, setComment] = useState('');

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
      reporter,
      status,
      labels,
      due_date: dueDate,
      start_date: startDate,
      sprint,
      story_points: storyPoints,
      original_estimate: originalEstimate,
      time_tracking: timeTracking,
      acceptance_criteria: acceptanceCriteria,
      column_id: columnId
    };
    onSave(formData);
  };

  const addLabel = (labelText: string) => {
    if (labelText && !labels.includes(labelText)) {
      setLabels([...labels, labelText]);
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const addComment = () => {
    if (comment.trim()) {
      // Handle comment addition
      console.log('Adding comment:', comment);
      setComment('');
    }
  };

  const selectedPriority = priorityOptions.find(p => p.value === priority);
  const selectedStatus = statusOptions.find(s => s.value === status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>CBS-175</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-3">
                {selectedStatus && (
                  <Badge className={selectedStatus.color}>
                    {selectedStatus.label}
                  </Badge>
                )}
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <Button variant="ghost" size="sm" className="text-blue-500">
                    Improve work item
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Issue title"
                  className="text-xl font-semibold border-none p-0 focus-visible:ring-0"
                  style={{ fontSize: '20px', fontWeight: 600 }}
                />
              </div>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="worklog">Work log</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Create a REST API endpoint to allow branch managers to transfer a center from one loan officer to another."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* Route and Request Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Implementation Details</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• <strong>Route:</strong> POST /api/v1/centers/transfer</li>
                        <li>• <strong>Request body:</strong> {"{ centerId, fromLoanOfficerId, toLoanOfficerId }"}</li>
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
                    <Textarea
                      value={acceptanceCriteria}
                      onChange={(e) => setAcceptanceCriteria(e.target.value)}
                      placeholder="• Endpoint validates center and loan officer IDs
• Center is reassigned to the new loan officer
• Proper error handling for invalid requests"
                      className="min-h-[80px]"
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
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      CK
                    </div>
                    <div className="flex-1">
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px]"
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
                          <Button size="sm" onClick={addComment}>
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="text-sm text-gray-500">
                    Activity history will appear here
                  </div>
                </TabsContent>

                <TabsContent value="worklog">
                  <div className="text-sm text-gray-500">
                    Work log entries will appear here
                  </div>
                </TabsContent>
              </Tabs>
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
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>{option.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Labels */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Labels
              </label>
              <div className="flex flex-wrap gap-1 mb-2">
                {labels.map((label, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {label}
                    <button 
                      onClick={() => removeLabel(label)}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
                onClick={() => {
                  const newLabel = prompt('Enter label:');
                  if (newLabel) addLabel(newLabel);
                }}
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
                onClick={() => {
                  const date = prompt('Enter due date (YYYY-MM-DD):');
                  if (date) setDueDate(date);
                }}
              >
                Add due date
              </Button>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Start date
              </label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
                onClick={() => {
                  const date = prompt('Enter start date (YYYY-MM-DD):');
                  if (date) setStartDate(date);
                }}
              >
                Add date
              </Button>
            </div>

            {/* Sprint */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Sprint
              </label>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                CBS Sprint 1
              </Badge>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 block">
                Priority
              </label>
              <div className="flex items-center gap-2">
                <span className="text-orange-500">━</span>
                <span className="text-sm">Medium</span>
              </div>
            </div>

            {/* More Fields */}
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
              >
                More fields
                <span className="text-xs ml-1">Story Points, Original estimate, Time tracking, Co...</span>
              </Button>
            </div>

            {/* Automation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Automation
                </label>
                <Zap className="w-4 h-4 text-gray-400" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 p-0 h-auto"
              >
                Rule executions
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
      </DialogContent>
    </Dialog>
  );
}