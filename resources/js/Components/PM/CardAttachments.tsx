import React, { useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Paperclip, X } from 'lucide-react';

export interface CardAttachment {
  id: number;
  filename: string;
  url: string;
  uploaded_at: string;
}

interface CardAttachmentsProps {
  cardId: number;
  initialAttachments?: CardAttachment[];
}

export function CardAttachments({ cardId, initialAttachments = [] }: CardAttachmentsProps) {
  const [attachments, setAttachments] = useState<CardAttachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // TODO: Replace with real API call
    setTimeout(() => {
      setAttachments(prev => [
        ...prev,
        {
          id: Date.now(),
          filename: file.name,
          url: URL.createObjectURL(file),
          uploaded_at: new Date().toISOString(),
        },
      ]);
      setUploading(false);
    }, 800);
  };

  const handleRemove = (id: number) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="font-semibold text-sm text-gray-700 mb-2">Attachments</div>
      <div className="space-y-2">
        {attachments.length === 0 && <div className="text-xs text-gray-400">No attachments yet.</div>}
        {attachments.map(att => (
          <div key={att.id} className="flex items-center gap-2 bg-gray-50 rounded p-2 text-xs">
            <Paperclip className="h-4 w-4 text-gray-400" />
            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {att.filename}
            </a>
            <span className="text-gray-400 ml-2">{new Date(att.uploaded_at).toLocaleString()}</span>
            <Button size="icon" variant="ghost" onClick={() => handleRemove(att.id)} className="ml-auto">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Paperclip className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Add Attachment'}
        </Button>
      </div>
    </div>
  );
}
