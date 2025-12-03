import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface BoardColumn {
  id: number;
  name: string;
  order: number;
  wip_limit?: number;
}

interface Board {
  id: number;
  name: string;
  type: 'kanban' | 'scrum';
  columns: BoardColumn[];
}

interface BoardSettingsProps {
  auth: {
    user: any;
  };
  board: Board;
  project: {
    id: number;
    name: string;
  };
}

export default function BoardSettings({ auth, board, project }: BoardSettingsProps) {
  const route = useRoute();
  const [columns, setColumns] = useState(board.columns || []);
  const [newColumn, setNewColumn] = useState({ name: '', wip_limit: '' });

  const handleAddColumn = () => {
    if (!newColumn.name.trim()) return;

    router.post(route('agile.columns.create', board.id), {
      name: newColumn.name,
      wip_limit: newColumn.wip_limit ? parseInt(newColumn.wip_limit) : null,
    }, {
      onSuccess: () => {
        setNewColumn({ name: '', wip_limit: '' });
      }
    });
  };

  const handleUpdateColumn = (columnId: number, field: string, value: any) => {
    router.put(route('agile.columns.update', columnId), {
      [field]: value,
    });
  };

  const handleDeleteColumn = (columnId: number) => {
    if (confirm('Are you sure you want to delete this column? All cards will need to be moved first.')) {
      router.delete(route('agile.columns.destroy', columnId));
    }
  };

  return (
    <AppLayout
      title="Board Settings"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Board Settings - {board.name}
        </h2>
      )}
    >
      <Head title={`Board Settings - ${board.name}`} />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Columns Management */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Columns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Columns */}
              <div className="space-y-3">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50"
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Column Name</Label>
                        <Input
                          value={column.name}
                          onChange={(e) => handleUpdateColumn(column.id, 'name', e.target.value)}
                          onBlur={(e) => handleUpdateColumn(column.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">WIP Limit (Optional)</Label>
                        <Input
                          type="number"
                          value={column.wip_limit || ''}
                          onChange={(e) => handleUpdateColumn(column.id, 'wip_limit', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="No limit"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteColumn(column.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Column */}
              <div className="pt-4 border-t">
                <Label className="mb-2">Add New Column</Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Column name"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="WIP limit"
                    className="w-32"
                    value={newColumn.wip_limit}
                    onChange={(e) => setNewColumn({ ...newColumn, wip_limit: e.target.value })}
                  />
                  <Button onClick={handleAddColumn}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Board Type Info */}
          <Card>
            <CardHeader>
              <CardTitle>Board Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Board Type:</span>
                  <span className="text-sm font-medium capitalize">{board.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Columns:</span>
                  <span className="text-sm font-medium">{columns.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
