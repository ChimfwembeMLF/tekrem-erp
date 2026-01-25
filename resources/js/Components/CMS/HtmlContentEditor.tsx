import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function HtmlContentEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line
  }, [value]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-2 bg-gray-100 border rounded p-2">
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('bold') ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('italic') ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded ${editor?.isActive('link') ? 'bg-gray-300 font-bold' : ''}`}
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          title="Add Link"
        >
          🔗
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded"
          onClick={() => {
            const url = window.prompt('Image URL');
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          }}
          title="Add Image"
        >
          🖼️
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded"
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
        >
          ⬚
        </button>
      </div>
      <div className="border rounded mb-2 p-2 bg-gray-50">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}