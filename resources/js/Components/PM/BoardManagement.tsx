import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Modal } from '@/Components/ui/modal';
import { Plus, Edit, Trash2, Settings, Columns, Tag, Palette, Move } from 'lucide-react';

export type Board = {
  id: number;
  name: string;
  type?: string;
  description?: string;
  columns: Column[];
};

export type Column = {
  id: number;
  name: string;
  order?: number;
  color?: string;
  is_done_column?: boolean;
  cards?: any[];
};

export type BoardFormData = {
  id?: number;
  name: string;
  description: string;
  type: string;
};

export type ColumnFormData = {
  id?: number;
  name: string;
  color: string;
  is_done_column: boolean;
  order?: number;
  board_id?: number;
};

interface BoardManagementProps {
  boards: Board[];
  activeBoard: Board;
  onBoardCreate?: (boardData: BoardFormData) => void;
  onBoardEdit?: (boardData: BoardFormData) => void;
  onBoardDelete?: (boardId: number) => void;
  onColumnCreate?: (columnData: ColumnFormData) => void;
  onColumnEdit?: (columnData: ColumnFormData) => void;
  onColumnDelete?: (columnId: number) => void;
  onColumnReorder?: (columnId: number, newOrder: number) => void;
}

const columnColors = [
  { value: '#ef4444', label: 'Red', class: 'bg-red-500' },
  { value: '#f97316', label: 'Orange', class: 'bg-orange-500' },
  { value: '#eab308', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#22c55e', label: 'Green', class: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', class: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#ec4899', label: 'Pink', class: 'bg-pink-500' },
  { value: '#6b7280', label: 'Gray', class: 'bg-gray-500' },
];

const boardTypes = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'scrum', label: 'Scrum' },
  { value: 'task', label: 'Task Board' },
];

export function BoardManagement({
  boards,
  activeBoard,
  onBoardCreate,
  onBoardEdit,
  onBoardDelete,
  onColumnCreate,
  onColumnEdit,
  onColumnDelete,
  onColumnReorder,
}: BoardManagementProps) {
  const [boardFormOpen, setBoardFormOpen] = useState(false);
  const [boardFormMode, setBoardFormMode] = useState<'create' | 'edit'>('create');
  const [boardFormData, setBoardFormData] = useState<Partial<BoardFormData>>({});

  const [columnFormOpen, setColumnFormOpen] = useState(false);
  const [columnFormMode, setColumnFormMode] = useState<'create' | 'edit'>('create');
  const [columnFormData, setColumnFormData] = useState<Partial<ColumnFormData>>({});

  const handleBoardCreate = () => {
    setBoardFormMode('create');
    setBoardFormData({ type: 'kanban' });
    setBoardFormOpen(true);
  };

  const handleBoardEdit = (board: Board) => {
    setBoardFormMode('edit');
    setBoardFormData({
      id: board.id,
      name: board.name,
      description: board.description || '',
      type: board.type || 'kanban',
    });
    setBoardFormOpen(true);
  };

  const handleBoardSave = () => {
    if (!boardFormData.name?.trim()) return;

    const data: BoardFormData = {
      id: boardFormData.id,
      name: boardFormData.name.trim(),
      description: boardFormData.description?.trim() || '',
      type: boardFormData.type || 'kanban',
    };

    if (boardFormMode === 'create') {
      onBoardCreate?.(data);
    } else {
      onBoardEdit?.(data);
    }

    setBoardFormOpen(false);
    setBoardFormData({});
  };

  const handleColumnCreate = () => {
    setColumnFormMode('create');
    setColumnFormData({
      color: columnColors[0].value,
      is_done_column: false,
      board_id: activeBoard.id,
    });
    setColumnFormOpen(true);
  };

  const handleColumnEdit = (column: Column) => {
    setColumnFormMode('edit');
    setColumnFormData({
      id: column.id,
      name: column.name,
      color: column.color || columnColors[0].value,
      is_done_column: column.is_done_column || false,
      order: column.order,
      board_id: activeBoard.id,
    });
    setColumnFormOpen(true);
  };

  const handleColumnSave = () => {
    if (!columnFormData.name?.trim()) return;

    const data: ColumnFormData = {
      id: columnFormData.id,
      name: columnFormData.name.trim(),
      color: columnFormData.color || columnColors[0].value,
      is_done_column: columnFormData.is_done_column || false,
      order: columnFormData.order,
      board_id: activeBoard.id,
    };

    if (columnFormMode === 'create') {
      onColumnCreate?.(data);
    } else {
      onColumnEdit?.(data);
    }

    setColumnFormOpen(false);
    setColumnFormData({});
  };

  return (
    <div className="space-y-6">
      {/* Board Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Board Management</h3>
            <p className="text-sm text-gray-600">Manage boards and their configurations</p>
          </div>
          <Button onClick={handleBoardCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>

        {/* Current Board */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{activeBoard.name}</h4>
              {activeBoard.description && (
                <p className="text-sm text-gray-600 mt-1">{activeBoard.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border">
                  {activeBoard.type || 'kanban'}
                </span>
                <span className="text-xs text-gray-500">
                  {activeBoard.columns?.length || 0} columns
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBoardEdit(activeBoard)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {boards.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBoardDelete?.(activeBoard.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* All Boards List */}
        {boards.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">All Boards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {boards.filter(board => board.id !== activeBoard.id).map((board) => (
                <div key={board.id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{board.name}</h5>
                      {board.description && (
                        <p className="text-xs text-gray-600 mt-1">{board.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {board.type || 'kanban'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {board.columns?.length || 0} columns
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBoardEdit(board)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBoardDelete?.(board.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Column Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Column Management</h3>
            <p className="text-sm text-gray-600">Configure columns for {activeBoard.name}</p>
          </div>
          <Button onClick={handleColumnCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>

        {/* Columns List */}
        <div className="space-y-3">
          {activeBoard.columns?.length === 0 && (
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
              <Columns className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No columns created yet</p>
              <p className="text-sm text-gray-400 mb-4">Add your first column to get started</p>
              <Button onClick={handleColumnCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Column
              </Button>
            </div>
          )}

          {activeBoard.columns?.map((column, index) => (
            <div key={column.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-gray-400 cursor-move" />
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                  </div>
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: column.color || columnColors[0].value }}
                  />
                  <div>
                    <h5 className="font-medium text-gray-900">{column.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      {column.is_done_column && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Done Column
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {column.cards?.length || 0} cards
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleColumnEdit(column)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onColumnDelete?.(column.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Board Form Modal */}
      <Modal
        isOpen={boardFormOpen}
        onClose={() => setBoardFormOpen(false)}
        title={boardFormMode === 'create' ? 'Create Board' : 'Edit Board'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Name *
            </label>
            <Input
              value={boardFormData.name || ''}
              onChange={(e) => setBoardFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter board name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={boardFormData.description || ''}
              onChange={(e) => setBoardFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter board description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Type
            </label>
            <select
              value={boardFormData.type || 'kanban'}
              onChange={(e) => setBoardFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {boardTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setBoardFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBoardSave}>
              <Settings className="h-4 w-4 mr-2" />
              {boardFormMode === 'create' ? 'Create Board' : 'Update Board'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Column Form Modal */}
      <Modal
        isOpen={columnFormOpen}
        onClose={() => setColumnFormOpen(false)}
        title={columnFormMode === 'create' ? 'Create Column' : 'Edit Column'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Name *
            </label>
            <Input
              value={columnFormData.name || ''}
              onChange={(e) => setColumnFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter column name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {columnColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setColumnFormData(prev => ({ ...prev, color: color.value }))}
                  className={`p-3 rounded-lg border-2 ${
                    columnFormData.color === color.value
                      ? 'border-gray-800'
                      : 'border-gray-200'
                  } hover:border-gray-400 transition-colors`}
                >
                  <div className={`w-full h-4 rounded ${color.class}`} />
                  <span className="text-xs mt-1 block">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_done_column"
              checked={columnFormData.is_done_column || false}
              onChange={(e) => setColumnFormData(prev => ({ ...prev, is_done_column: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_done_column" className="text-sm text-gray-700">
              Mark as "Done" column
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setColumnFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleColumnSave}>
              <Columns className="h-4 w-4 mr-2" />
              {columnFormMode === 'create' ? 'Create Column' : 'Update Column'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}