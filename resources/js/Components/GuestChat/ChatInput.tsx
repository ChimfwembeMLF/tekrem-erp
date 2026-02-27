import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, ImageIcon, SmilePlus, SendHorizonal, X, FileText } from 'lucide-react';

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

  // Auto-grow textarea
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

  return (
    <div className="chat-input-root">
      {/* Attachment strip */}
      {attachmentPreviews.length > 0 && (
        <div className="attach-strip">
          {attachmentPreviews.map((att, idx) => (
            <div key={idx} className="attach-chip" title={att.name}>
              {att.type.startsWith('image/') ? (
                <img src={att.url} alt={att.name} className="attach-thumb" />
              ) : (
                <div className="attach-file-icon">
                  <FileText size={14} />
                </div>
              )}
              <span className="attach-name">{att.name}</span>
              <button className="attach-remove" onClick={att.onRemove} type="button">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input row */}
      <form
        onSubmit={(e) => { e.preventDefault(); onSend(e); }}
        className={`input-pill ${isFocused ? 'focused' : ''} ${disabled ? 'pill-disabled' : ''}`}
      >
        {/* Left actions */}
        <div className="pill-actions-left">
          <button
            type="button"
            className="action-btn"
            onClick={() => imageInputRef.current?.click()}
            title="Attach image"
            disabled={slotsLeft <= 0 || disabled}
          >
            <ImageIcon size={15} />
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            disabled={slotsLeft <= 0 || disabled}
          >
            <Paperclip size={15} />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input ref={imageInputRef} type="file" className="hidden" accept="image/*" multiple onChange={e => handleFileChange(e, 'image')} />
        <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip" multiple onChange={e => handleFileChange(e, 'file')} />

        {/* Text area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="pill-textarea"
          rows={1}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || isLoading}
        />

        {/* Right actions */}
        <div className="pill-actions-right">
          <button
            type="button"
            className={`action-btn ${showEmojiPicker ? 'action-btn-active' : ''}`}
            onClick={onEmojiClick}
            title="Emoji"
          >
            <SmilePlus size={15} />
          </button>
          <button
            type="submit"
            className={`send-btn ${canSend ? 'send-btn-active' : ''}`}
            disabled={!canSend}
            title="Send"
          >
            {isLoading
              ? <span className="send-spinner" />
              : <SendHorizonal size={14} />
            }
          </button>
        </div>
      </form>

      <style>{`
        .chat-input-root { display: flex; flex-direction: column; gap: 6px; }

        .attach-strip {
          display: flex; flex-wrap: wrap; gap: 6px;
          padding: 0 2px;
        }
        .attach-chip {
          display: flex; align-items: center; gap: 4px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 8px;
          padding: 3px 6px 3px 4px;
          max-width: 130px;
          font-size: 11px;
          color: #7c3aed;
        }
        .attach-thumb {
          width: 22px; height: 22px;
          object-fit: cover; border-radius: 4px; flex-shrink: 0;
        }
        .attach-file-icon {
          width: 22px; height: 22px;
          background: rgba(139,92,246,0.15);
          border-radius: 4px; display: flex;
          align-items: center; justify-content: center; flex-shrink: 0;
          color: #7c3aed;
        }
        .attach-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .attach-remove {
          width: 16px; height: 16px; border-radius: 50%;
          background: rgba(139,92,246,0.15);
          border: none; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          color: #7c3aed; flex-shrink: 0;
          transition: background 0.15s;
        }
        .attach-remove:hover { background: rgba(139,92,246,0.3); }

        .input-pill {
          display: flex; align-items: flex-end; gap: 2px;
          background: #ffffff;
          border: 1.5px solid #e5e7eb;
          border-radius: 24px;
          padding: 6px 6px 6px 8px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-pill.focused {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .input-pill.pill-disabled { opacity: 0.6; pointer-events: none; }

        .pill-actions-left, .pill-actions-right {
          display: flex; align-items: center; gap: 1px; flex-shrink: 0;
        }

        .action-btn {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          background: transparent; color: #9ca3af;
          transition: color 0.15s, background 0.15s;
        }
        .action-btn:hover:not(:disabled) { color: #7c3aed; background: rgba(139,92,246,0.08); }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .action-btn-active { color: #7c3aed !important; background: rgba(139,92,246,0.1) !important; }

        .pill-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          resize: none; font-size: 13.5px; line-height: 1.5;
          color: #111827; min-height: 28px; max-height: 120px;
          padding: 4px 4px; overflow-y: auto;
          font-family: inherit;
        }
        .pill-textarea::placeholder { color: #9ca3af; }
        .pill-textarea::-webkit-scrollbar { width: 3px; }
        .pill-textarea::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }

        .send-btn {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          background: #e5e7eb; color: #9ca3af;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          flex-shrink: 0;
        }
        .send-btn.send-btn-active {
          background: linear-gradient(135deg, #8b5cf6, #6366f1);
          color: #fff;
        }
        .send-btn.send-btn-active:hover { transform: scale(1.08); }
        .send-btn:disabled { cursor: not-allowed; }

        .send-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hidden { display: none; }
      `}</style>
    </div>
  );
};

export default ChatInput;