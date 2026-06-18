import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, ImageIcon, SmilePlus, SendHorizonal, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentPreview {
  url: string;
  name: string;
  type: string;
  onRemove: () => void;
}

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (e?: React.FormEvent) => void;
  isLoading?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onBlur?: () => void;
  onEmojiClick?: () => void;
  showEmojiPicker?: boolean;
  onFileUpload: (files: FileList) => void;
  onImageUpload: (files: FileList) => void;
  attachmentPreviews: AttachmentPreview[];
  disabled?: boolean;
  placeholder?: string;
}

const MAX_ATTACHMENTS = 5;

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  onKeyDown,
  onBlur,
  onEmojiClick,
  showEmojiPicker,
  onFileUpload,
  onImageUpload,
  attachmentPreviews,
  disabled,
  placeholder = 'Type a message…',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const canSend = (value.trim().length > 0 || attachmentPreviews.length > 0) && !isLoading && !disabled;
  const slotsLeft = MAX_ATTACHMENTS - attachmentPreviews.length;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    if (!e.target.files) return;
    if (e.target.files.length > slotsLeft) {
      alert(`You can only attach up to ${MAX_ATTACHMENTS} files total.`);
      e.target.value = '';
      return;
    }
    type === 'image' ? onImageUpload(e.target.files) : onFileUpload(e.target.files);
    e.target.value = '';
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <div className="flex flex-col gap-1.5">
      {attachmentPreviews.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {attachmentPreviews.map((att, idx) => (
            <div
              key={idx}
              className="flex max-w-[130px] items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-1.5 py-1 text-[11px] text-primary"
              title={att.name}
            >
              {att.type.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="h-[22px] w-[22px] shrink-0 rounded object-cover" />
              ) : (
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                  <FileText size={14} />
                </div>
              )}
              <span className="flex-1 truncate">{att.name}</span>
              <button
                type="button"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                onClick={att.onRemove}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); onSend(e); }}
        className={cn(
          'flex items-end gap-0.5 rounded-3xl border border-border bg-background px-2 py-1.5 transition-all',
          isFocused ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]' : '',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
            onClick={() => imageInputRef.current?.click()}
            title="Attach image"
            disabled={slotsLeft <= 0 || disabled}
          >
            <ImageIcon size={15} />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            disabled={slotsLeft <= 0 || disabled}
          >
            <Paperclip size={15} />
          </button>
        </div>

        <input ref={imageInputRef} type="file" className="hidden" accept="image/*" multiple onChange={e => handleFileChange(e, 'image')} />
        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" multiple onChange={e => handleFileChange(e, 'file')} />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="max-h-[120px] min-h-[28px] flex-1 resize-none border-0 bg-transparent px-1 py-1 text-[13.5px] leading-6 text-foreground outline-none placeholder:text-muted-foreground [scrollbar-width:thin]"
          rows={1}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          disabled={disabled || isLoading}
        />

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-primary',
              showEmojiPicker && 'bg-primary/10 text-primary',
            )}
            onClick={onEmojiClick}
            title="Emoji"
          >
            <SmilePlus size={15} />
          </button>
          <button
            type="submit"
            className={cn(
              'ml-0.5 flex h-8 w-8 items-center justify-center rounded-full transition-all',
              canSend
                ? 'bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:scale-105'
                : 'bg-muted text-muted-foreground',
            )}
            disabled={!canSend}
            title="Send"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <SendHorizonal size={14} />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
