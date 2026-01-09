import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { 
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
    List, ListOrdered, Quote, Minus, Undo, Redo,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link2, Image as ImageIcon, Table as TableIcon, 
    Heading1, Heading2, Heading3, Type, 
    Palette, Highlighter, Save, Eye, X,
    ChevronDown, Plus, Trash2, Settings, Maximize2
} from 'lucide-react';

// Types
interface WYSIWYGEditorProps {
    initialContent?: string;
    placeholder?: string;
    onSave?: (content: string, html: string) => void;
    onChange?: (content: string, html: string) => void;
    maxCharacters?: number;
    minHeight?: string;
    className?: string;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip: string;
    icon: React.ReactNode;
    variant?: 'default' | 'danger';
}

interface DropdownOption {
    label: string;
    value: string;
    onClick: () => void;
}

// Toolbar Button Component
const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
    onClick, 
    isActive, 
    disabled, 
    tooltip, 
    icon,
    variant = 'default'
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            className={`
                relative p-2 rounded-md transition-all duration-200
                flex items-center justify-center
                ${disabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : 'hover:bg-slate-100 active:scale-95'
                }
                ${isActive 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-slate-700'
                }
                ${variant === 'danger' ? 'hover:bg-red-50 hover:text-red-600' : ''}
            `}
        >
            {icon}
        </button>
    );
};

// Toolbar Divider
const ToolbarDivider: React.FC = () => (
    <div className="w-px h-6 bg-slate-300 mx-1" />
);

// Dropdown Component
const ToolbarDropdown: React.FC<{
    label: string;
    icon?: React.ReactNode;
    options: DropdownOption[];
    activeValue?: string;
}> = ({ label, icon, options, activeValue }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
            >
                {icon}
                <span className="text-sm font-medium">{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[160px] z-20">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    option.onClick();
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors
                                    ${activeValue === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Color Picker Component
const ColorPicker: React.FC<{
    onColorSelect: (color: string) => void;
    currentColor?: string;
    type: 'text' | 'highlight';
}> = ({ onColorSelect, currentColor, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Yellow', value: '#EAB308' },
        { name: 'Green', value: '#22C55E' },
        { name: 'Blue', value: '#3B82F6' },
        { name: 'Purple', value: '#A855F7' },
        { name: 'Pink', value: '#EC4899' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                title={type === 'text' ? 'Text Color' : 'Highlight Color'}
                className="p-2 rounded-md hover:bg-slate-100 text-slate-700 transition-colors"
            >
                {type === 'text' ? <Palette className="w-5 h-5" /> : <Highlighter className="w-5 h-5" />}
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-20">
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {colors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => {
                                        onColorSelect(color.value);
                                        setIsOpen(false);
                                    }}
                                    title={color.name}
                                    className={`
                                        w-8 h-8 rounded border-2 transition-all hover:scale-110
                                        ${currentColor === color.value ? 'border-blue-500 shadow-md' : 'border-slate-300'}
                                    `}
                                    style={{ backgroundColor: color.value }}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                onColorSelect('');
                                setIsOpen(false);
                            }}
                            className="w-full text-xs text-slate-600 hover:text-slate-900 py-1"
                        >
                            Clear {type === 'text' ? 'Color' : 'Highlight'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// Link Modal Component
const LinkModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (url: string, text?: string) => void;
    currentUrl?: string;
}> = ({ isOpen, onClose, onSubmit, currentUrl }) => {
    const [url, setUrl] = useState(currentUrl || '');
    const [text, setText] = useState('');

    useEffect(() => {
        if (isOpen) {
            setUrl(currentUrl || '');
            setText('');
        }
    }, [isOpen, currentUrl]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            onSubmit(url, text || undefined);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Insert Link</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            URL
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            autoFocus
                        />
                    </div>
                    
                    {!currentUrl && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Link Text (optional)
                            </label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Enter link text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    )}
                    
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {currentUrl ? 'Update' : 'Insert'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

// Main Editor Component
const WYSIWYGEditor: React.FC<WYSIWYGEditorProps> = ({
    initialContent = '',
    placeholder = 'Start writing...',
    onSave,
    onChange,
    maxCharacters,
    minHeight = '300px',
    className = '',
}) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 bg-slate-50 px-4 py-2 text-left font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 px-4 py-2',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            CharacterCount.configure({
                limit: maxCharacters,
            }),
            Color,
            TextStyle,
            Highlight.configure({
                multicolor: true,
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none px-6 py-4',
                style: `min-height: ${minHeight}`,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const json = JSON.stringify(editor.getJSON());
            onChange?.(json, html);
        },
    });

    // Handle link insertion
    const handleLinkSubmit = useCallback((url: string, text?: string) => {
        if (!editor) return;

        if (text) {
            editor
                .chain()
                .focus()
                .insertContent(`<a href="${url}">${text}</a>`)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .setLink({ href: url })
                .run();
        }
    }, [editor]);

    // Handle image insertion
    const handleImageInsert = useCallback(() => {
        const url = prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    // Handle save
    const handleSave = useCallback(() => {
        if (!editor) return;
        const html = editor.getHTML();
        const json = JSON.stringify(editor.getJSON());
        onSave?.(json, html);
    }, [editor, onSave]);

    // Handle fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    if (!editor) {
        return null;
    }

    const headingOptions: DropdownOption[] = [
        { label: 'Paragraph', value: 'paragraph', onClick: () => editor.chain().focus().setParagraph().run() },
        { label: 'Heading 1', value: 'h1', onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'Heading 2', value: 'h2', onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Heading 3', value: 'h3', onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    ];

    const currentHeading = editor.isActive('heading', { level: 1 }) ? 'h1'
        : editor.isActive('heading', { level: 2 }) ? 'h2'
        : editor.isActive('heading', { level: 3 }) ? 'h3'
        : 'paragraph';

    return (
        <div className={`
            ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}
            ${className}
        `}>
            <div className={`
                flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden
                ${isFullscreen ? '' : 'max-h-[800px]'}
            `}>
                
                {/* Toolbar */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex items-center gap-1 p-2 flex-wrap">
                        
                        {/* Text Formatting */}
                        <ToolbarDropdown
                            label={headingOptions.find(opt => opt.value === currentHeading)?.label || 'Paragraph'}
                            icon={<Type className="w-4 h-4" />}
                            options={headingOptions}
                            activeValue={currentHeading}
                        />
                        
                        <ToolbarDivider />
                        
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            isActive={editor.isActive('bold')}
                            tooltip="Bold (Ctrl+B)"
                            icon={<Bold className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            isActive={editor.isActive('italic')}
                            tooltip="Italic (Ctrl+I)"
                            icon={<Italic className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            isActive={editor.isActive('underline')}
                            tooltip="Underline (Ctrl+U)"
                            icon={<UnderlineIcon className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            isActive={editor.isActive('strike')}
                            tooltip="Strikethrough"
                            icon={<Strikethrough className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            isActive={editor.isActive('code')}
                            tooltip="Code"
                            icon={<Code className="w-5 h-5" />}
                        />
                        
                        <ToolbarDivider />
                        
                        {/* Colors */}
                        <ColorPicker
                            onColorSelect={(color) => editor.chain().focus().setColor(color).run()}
                            currentColor={editor.getAttributes('textStyle').color}
                            type="text"
                        />
                        <ColorPicker
                            onColorSelect={(color) => {
                                if (color) {
                                    editor.chain().focus().setHighlight({ color }).run();
                                } else {
                                    editor.chain().focus().unsetHighlight().run();
                                }
                            }}
                            type="highlight"
                        />
                        
                        <ToolbarDivider />
                        
                        {/* Alignment */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            isActive={editor.isActive({ textAlign: 'left' })}
                            tooltip="Align Left"
                            icon={<AlignLeft className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            isActive={editor.isActive({ textAlign: 'center' })}
                            tooltip="Align Center"
                            icon={<AlignCenter className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            isActive={editor.isActive({ textAlign: 'right' })}
                            tooltip="Align Right"
                            icon={<AlignRight className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                            isActive={editor.isActive({ textAlign: 'justify' })}
                            tooltip="Justify"
                            icon={<AlignJustify className="w-5 h-5" />}
                        />
                        
                        <ToolbarDivider />
                        
                        {/* Lists */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            isActive={editor.isActive('bulletList')}
                            tooltip="Bullet List"
                            icon={<List className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            isActive={editor.isActive('orderedList')}
                            tooltip="Numbered List"
                            icon={<ListOrdered className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            isActive={editor.isActive('blockquote')}
                            tooltip="Quote"
                            icon={<Quote className="w-5 h-5" />}
                        />
                        
                        <ToolbarDivider />
                        
                        {/* Insert */}
                        <ToolbarButton
                            onClick={() => setIsLinkModalOpen(true)}
                            isActive={editor.isActive('link')}
                            tooltip="Insert Link"
                            icon={<Link2 className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={handleImageInsert}
                            tooltip="Insert Image"
                            icon={<ImageIcon className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                            tooltip="Insert Table"
                            icon={<TableIcon className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                            tooltip="Horizontal Rule"
                            icon={<Minus className="w-5 h-5" />}
                        />
                        
                        <ToolbarDivider />
                        
                        {/* History */}
                        <ToolbarButton
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            tooltip="Undo (Ctrl+Z)"
                            icon={<Undo className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            tooltip="Redo (Ctrl+Y)"
                            icon={<Redo className="w-5 h-5" />}
                        />
                        
                        <div className="flex-1" />
                        
                        {/* Actions */}
                        <ToolbarButton
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            isActive={isPreviewMode}
                            tooltip="Preview"
                            icon={<Eye className="w-5 h-5" />}
                        />
                        <ToolbarButton
                            onClick={toggleFullscreen}
                            isActive={isFullscreen}
                            tooltip="Fullscreen"
                            icon={<Maximize2 className="w-5 h-5" />}
                        />
                        {onSave && (
                            <button
                                onClick={handleSave}
                                className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto bg-white">
                    {isPreviewMode ? (
                        <div 
                            className="prose prose-slate max-w-none px-6 py-4"
                            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
                        />
                    ) : (
                        <EditorContent editor={editor} />
                    )}
                </div>
                
                {/* Footer */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                        {maxCharacters && (
                            <div className={`font-medium ${
                                editor.storage.characterCount.characters() > maxCharacters * 0.9
                                    ? 'text-red-600'
                                    : ''
                            }`}>
                                {editor.storage.characterCount.characters()} / {maxCharacters} characters
                            </div>
                        )}
                        <div>
                            {editor.storage.characterCount.words()} words
                        </div>
                    </div>
                    
                    {editor.isActive('link') && (
                        <button
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className="text-red-600 hover:text-red-700 font-medium"
                        >
                            Remove Link
                        </button>
                    )}
                </div>
            </div>
            
            {/* Link Modal */}
            <LinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                onSubmit={handleLinkSubmit}
                currentUrl={editor.isActive('link') ? editor.getAttributes('link').href : undefined}
            />
        </div>
    );
};

export default WYSIWYGEditor;