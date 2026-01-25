// Utility to recursively replace null/undefined with empty string or array
function normalizeSectionData(section) {
  if (Array.isArray(section)) {
    return section.map(normalizeSectionData);
  } else if (section && typeof section === 'object') {
    const out = {};
    for (const key in section) {
      if (section[key] === null || section[key] === undefined) {
        // Use empty array for known array fields, else empty string
        if (key === 'items' || key === 'members' || key === 'stats' || key === 'images') {
          out[key] = [];
        } else if (typeof section[key] === 'object') {
          out[key] = {};
        } else {
          out[key] = '';
        }
      } else {
        out[key] = normalizeSectionData(section[key]);
      }
    }
    return out;
  }
  return section;
}
import React, { useState } from 'react';
import HtmlContentEditor from './HtmlContentEditor';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { GripVertical, Trash2, Plus } from 'lucide-react';

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'services', label: 'Services' },
  { value: 'features', label: 'Features' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'team', label: 'Team' },
  { value: 'stats', label: 'Stats' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'contact', label: 'Contact' },
  { value: 'content', label: 'Content' },
  { value: 'html_content', label: 'HTML Content' },
];

function SectionCard({ id, section, onEdit, onRemove, listeners, attributes, isDragging }: any) {
  return (
    <div
      className={`mb-4 bg-white rounded shadow border transition-all ${isDragging ? 'opacity-60' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab" />
          <span className="font-semibold text-sm">{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(id)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onRemove(id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      <CardContent>
        {section.type === 'hero' && section.data?.title && (
          <div className="text-muted-foreground text-xs">{section.data.title}</div>
        )}
        {section.type === 'services' && Array.isArray(section.data?.items) && (
          <div className="text-muted-foreground text-xs">{section.data.items.map(i => i.title).join(', ')}</div>
        )}
        {section.type === 'features' && Array.isArray(section.data?.items) && (
          <div className="text-muted-foreground text-xs">{section.data.items.map(i => i.title).join(', ')}</div>
        )}
        {section.type === 'testimonials' && Array.isArray(section.data?.items) && section.data.items.length > 0 && (
          <div className="text-muted-foreground text-xs">{section.data.items.map(i => i.name).join(', ')}</div>
        )}
        {section.type === 'team' && Array.isArray(section.data?.members) && section.data.members.length > 0 && (
          <div className="text-muted-foreground text-xs">{section.data.members.map(m => m.name).join(', ')}</div>
        )}
        {section.type === 'stats' && Array.isArray(section.data?.stats) && section.data.stats.length > 0 && (
          <div className="text-muted-foreground text-xs">{section.data.stats.map(s => s.label).join(', ')}</div>
        )}
        {section.type === 'gallery' && Array.isArray(section.data?.images) && section.data.images.length > 0 && (
          <div className="text-muted-foreground text-xs">{section.data.images.length} image(s)</div>
        )}
        {section.type === 'cta' && section.data?.text && (
          <div className="text-muted-foreground text-xs">{section.data.text}</div>
        )}
        {section.type === 'contact' && (section.data?.email || section.data?.phone) && (
          <div className="text-muted-foreground text-xs">{[section.data.email, section.data.phone].filter(Boolean).join(' / ')}</div>
        )}
        {section.type === 'content' && section.data?.title && (
          <div className="text-muted-foreground text-xs">{section.data.title}</div>
        )}
        {section.type === 'html_content' && section.data?.html && (
          <div className="text-muted-foreground text-xs">[HTML Block]</div>
        )}
      </CardContent>
    </div>
  );
          type SectionData = {
            [key: string]: any;
          };
}

function SortableSection({ id, section, onEdit, onRemove } : any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <SectionCard id={id} section={section} onEdit={onEdit} onRemove={onRemove} listeners={listeners} attributes={attributes} isDragging={isDragging} />
    </div>
  );
}

export default function SectionBlocksEditor({ value, onChange } : any) {
  const [addingType, setAddingType] = useState('hero');
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const sensors = useSensors(useSensor(PointerSensor));

  // Normalize value on load and whenever it changes
  React.useEffect(() => {
    const normalized = normalizeSectionData(value);
    if (JSON.stringify(normalized) !== JSON.stringify(value)) {
      onChange(normalized);
    }
    // eslint-disable-next-line
  }, [value]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((s) => s.id === active.id);
    const newIndex = value.findIndex((s) => s.id === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  };

  const handleAddSection = () => {
    let data = {};
    switch (addingType) {
      case 'hero':
        data = { title: '', subtitle: '', backgroundImage: '' };
        break;
      case 'services':
        data = { items: [] };
        break;
      case 'features':
        data = { items: [] };
        break;
      case 'testimonials':
        data = { items: [] };
        break;
      case 'team':
        data = { members: [] };
        break;
      case 'stats':
        data = { stats: [] };
        break;
      case 'cta':
        data = { text: '', button: { label: '', url: '' } };
        break;
      case 'gallery':
        data = { images: [] };
        break;
      case 'contact':
        data = { email: '', phone: '', address: '' };
        break;
      case 'content':
        data = { title: '', content: '' };
        break;
      case 'html_content':
        data = { html: '' };
        break;
      default:
        data = {};
    }
    const newSection = { id: Date.now().toString(), type: addingType, data };
    onChange(normalizeSectionData([...value, newSection]));
  };

  const handleRemove = (id: string) => onChange(value.filter((s) => s.id !== id));
  const handleEdit = (id: string) => {
    const idx = value.findIndex((s) => s.id === id);
    setEditId(id);
    setEditData(value[idx].data);
  };

  const handleEditFieldChange = (field: string, val: string) => setEditData(prev => ({ ...prev, [field]: val }));
  const handleEditServiceItemChange = (idx: number, field: string, val: string) =>
    setEditData(prev => ({ ...prev, items: prev.items.map((item, i) => i === idx ? { ...item, [field]: val } : item) }));
  const handleAddServiceItem = () => setEditData(prev => ({ ...prev, items: [...(prev.items || []), { icon: '', title: '', description: '' }] }));
  const handleRemoveServiceItem = (idx: number) => setEditData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const handleEditSave = () => {
    const idx = value.findIndex((s) => s.id === editId);
    const updated = [...value];
    updated[idx] = { ...updated[idx], data: editData };
    onChange(updated);
    setEditId(null);
    setEditData({});
  };
  const handleEditCancel = () => { setEditId(null); setEditData({}); };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Select value={addingType} onValueChange={setAddingType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={handleAddSection} variant="default"><Plus className="h-4 w-4 mr-1" /> Add Section</Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {value.map(section => <SortableSection key={section.id} id={section.id} section={section} onEdit={handleEdit} onRemove={handleRemove} />)}
        </SortableContext>
      </DndContext>

      {editId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Edit Section</h2>
            {/* Hero Section Edit */}
            {value.find(s => s.id === editId)?.type === 'hero' && (
              <>
                <Input placeholder="Title" value={editData.title || ''} onChange={e => handleEditFieldChange('title', e.target.value)} />
                <Input placeholder="Subtitle" value={editData.subtitle || ''} onChange={e => handleEditFieldChange('subtitle', e.target.value)} />
                <Input placeholder="Background Image URL" value={editData.backgroundImage || ''} onChange={e => handleEditFieldChange('backgroundImage', e.target.value)} />
              </>
            )}
            {/* Services Section Edit */}
            {value.find(s => s.id === editId)?.type === 'services' && (
              <>
                {(editData.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <Input className="w-24" placeholder="Icon" value={item.icon} onChange={e => handleEditServiceItemChange(idx, 'icon', e.target.value)} />
                    <Input className="w-32" placeholder="Title" value={item.title} onChange={e => handleEditServiceItemChange(idx, 'title', e.target.value)} />
                    <Input className="flex-1" placeholder="Description" value={item.description} onChange={e => handleEditServiceItemChange(idx, 'description', e.target.value)} />
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveServiceItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={handleAddServiceItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
              </>
            )}
            {/* Features Section Edit */}
            {value.find(s => s.id === editId)?.type === 'features' && (
              <>
                {(editData.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <Input className="w-32" placeholder="Title" value={item.title || ''} onChange={e => handleEditServiceItemChange(idx, 'title', e.target.value)} />
                    <Input className="flex-1" placeholder="Description" value={item.description || ''} onChange={e => handleEditServiceItemChange(idx, 'description', e.target.value)} />
                    <Button size="sm" variant="destructive" onClick={() => handleRemoveServiceItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={handleAddServiceItem}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
              </>
            )}
            {/* Content Section Edit */}
            {value.find(s => s.id === editId)?.type === 'content' && (
              <>
                <Input placeholder="Title" value={editData.title || ''} onChange={e => handleEditFieldChange('title', e.target.value)} />
                <Input placeholder="Content" value={editData.content || ''} onChange={e => handleEditFieldChange('content', e.target.value)} />
              </>
            )}
            {/* HTML Content Section Edit */}
            {value.find(s => s.id === editId)?.type === 'html_content' && (
              <HtmlContentEditor
                value={editData.html || ''}
                onChange={val => handleEditFieldChange('html', val)}
              />
            )}
            {/* CTA Section Edit */}
            {value.find(s => s.id === editId)?.type === 'cta' && (
              <>
                <Input placeholder="Text" value={editData.text || ''} onChange={e => handleEditFieldChange('text', e.target.value)} />
                <Input placeholder="Button Label" value={editData.button?.label || ''} onChange={e => handleEditFieldChange('button', { ...editData.button, label: e.target.value })} />
                <Input placeholder="Button URL" value={editData.button?.url || ''} onChange={e => handleEditFieldChange('button', { ...editData.button, url: e.target.value })} />
              </>
            )}
            {/* Contact Section Edit */}
            {value.find(s => s.id === editId)?.type === 'contact' && (
              <>
                <Input placeholder="Email" value={editData.email || ''} onChange={e => handleEditFieldChange('email', e.target.value)} />
                <Input placeholder="Phone" value={editData.phone || ''} onChange={e => handleEditFieldChange('phone', e.target.value)} />
                <Input placeholder="Address" value={editData.address || ''} onChange={e => handleEditFieldChange('address', e.target.value)} />
              </>
            )}
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
