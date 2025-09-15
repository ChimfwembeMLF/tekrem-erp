import React, { useRef } from 'react';
import { Button } from '@/Components/ui/button';
import { Paperclip, Image, Smile, Send, X } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onEmojiClick?: () => void;
  showEmojiPicker?: boolean;
  onFileUpload: (files: FileList) => void;
  onImageUpload: (files: FileList) => void;
  attachmentPreviews: Array<{ url: string; name: string; type: string; onRemove: () => void }>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  onKeyDown,
  onEmojiClick,
  showEmojiPicker,
  onFileUpload,
  onImageUpload,
  attachmentPreviews,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={onSend}
      className=""
    >
      {/* Attachment Previews (up to 5) */}
      {attachmentPreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-2">
          {attachmentPreviews.slice(0, 5).map((att, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 max-w-[120px]">
              {att.type.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="h-10 w-10 object-cover rounded border" />
              ) : (
                <div className="flex flex-col items-center justify-center w-10 h-10 bg-gray-200 rounded border">
                  <span className="text-[10px] truncate w-10 text-center">{att.name}</span>
                </div>
              )}
              <Button type="button" size="icon" variant="ghost" onClick={att.onRemove}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {attachmentPreviews.length > 5 && (
            <span className="text-xs text-gray-500">+{attachmentPreviews.length - 5} more</span>
          )}
        </div>
      )}

        <div className="rounded-full px-3 py-1.5 flex items-center gap-2 shadow-md bg-white dark:bg-muted border">
      {/* Image Upload */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => imageInputRef.current?.click()}
        title="Send images"
        className="text-gray-400 hover:text-primary"
      >
        <Image className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={e => {
          if (!e.target.files) return;
          if (attachmentPreviews.length + e.target.files.length > 5) {
            alert('You can only attach up to 5 files.');
            return;
          }
          onImageUpload(e.target.files);
        }}
      />

      {/* File Upload */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        title="Send files"
        className="text-gray-400 hover:text-primary"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        multiple
        onChange={e => {
          if (!e.target.files) return;
          if (attachmentPreviews.length + e.target.files.length > 5) {
            alert('You can only attach up to 5 files.');
            return;
          }
          onFileUpload(e.target.files);
        }}
      />

      {/* Textarea Input */}
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none text-sm pt-3"
          rows={1}
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
      </div>

      {/* Emoji Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-gray-400 hover:text-primary"
        onClick={onEmojiClick}
      >
        <Smile className="h-4 w-4" />
      </Button>
      {/* Optionally render emoji picker here if showEmojiPicker */}

      {/* Send Button */}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!value.trim() && attachmentPreviews.length === 0}
        className="hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </Button>    
      </div>
    </form>
  );
};

export default ChatInput;
