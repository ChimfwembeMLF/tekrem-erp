# WYSIWYG Editor - Installation & Usage Guide

## Overview

A production-ready, feature-rich WYSIWYG (What You See Is What You Get) editor built with React and Tiptap. This editor provides a professional interface for content creation with comprehensive formatting options.

## Features

### Text Formatting
- **Basic Formatting**: Bold, Italic, Underline, Strikethrough, Code
- **Headings**: H1, H2, H3, and Paragraph styles
- **Text Alignment**: Left, Center, Right, Justify
- **Colors**: Text color and highlight color picker
- **Lists**: Bullet lists, Numbered lists, Blockquotes

### Content Insertion
- **Links**: Interactive link insertion with URL and text options
- **Images**: URL-based image insertion
- **Tables**: Create tables with resizable columns and header rows
- **Horizontal Rules**: Add visual dividers

### Advanced Features
- **Undo/Redo**: Full history management
- **Character & Word Count**: Real-time tracking with limit warnings
- **Preview Mode**: Toggle between edit and preview
- **Fullscreen Mode**: Distraction-free writing experience
- **Keyboard Shortcuts**: Standard shortcuts (Ctrl+B, Ctrl+I, etc.)
- **Auto-save Support**: onChange callback for real-time syncing
- **Placeholder Text**: Customizable empty state

## Installation

### 1. Install Dependencies

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-placeholder @tiptap/extension-character-count @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-highlight lucide-react
```

### 2. Install Peer Dependencies

Make sure you have React installed:

```bash
npm install react react-dom
```

### 3. Copy the Component Files

Copy the following files to your project:
- `WYSIWYGEditor.tsx` - Main editor component
- `EditorDemo.tsx` - Demo/example usage (optional)

## Usage

### Basic Usage

```tsx
import WYSIWYGEditor from './WYSIWYGEditor';

function MyComponent() {
  const handleSave = (content: string, html: string) => {
    console.log('JSON content:', content);
    console.log('HTML content:', html);
    // Send to your backend
  };

  return (
    <WYSIWYGEditor
      placeholder="Start writing..."
      onSave={handleSave}
    />
  );
}
```

### With All Options

```tsx
import WYSIWYGEditor from './WYSIWYGEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  const handleSave = (content: string, html: string) => {
    // Save to backend
    fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, html }),
    });
  };

  const handleChange = (content: string, html: string) => {
    // Auto-save or update state
    setContent(content);
  };

  return (
    <WYSIWYGEditor
      initialContent={content}
      placeholder="Start writing something amazing..."
      onSave={handleSave}
      onChange={handleChange}
      maxCharacters={5000}
      minHeight="500px"
      className="my-custom-class"
    />
  );
}
```

### In a Form

```tsx
import WYSIWYGEditor from './WYSIWYGEditor';

function ArticleForm() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentHtml: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Article Title"
      />
      
      <WYSIWYGEditor
        placeholder="Write your article..."
        onChange={(content, html) => {
          setFormData({
            ...formData,
            content,
            contentHtml: html,
          });
        }}
        maxCharacters={10000}
      />
      
      <button type="submit">Publish Article</button>
    </form>
  );
}
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialContent` | `string` | `''` | Initial HTML or JSON content to load |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text when editor is empty |
| `onSave` | `(content: string, html: string) => void` | `undefined` | Callback when save button is clicked |
| `onChange` | `(content: string, html: string) => void` | `undefined` | Callback when content changes |
| `maxCharacters` | `number` | `undefined` | Maximum character limit (shows warning at 90%) |
| `minHeight` | `string` | `'300px'` | Minimum height of the editor |
| `className` | `string` | `''` | Additional CSS classes |

## Keyboard Shortcuts

- **Bold**: `Ctrl/Cmd + B`
- **Italic**: `Ctrl/Cmd + I`
- **Underline**: `Ctrl/Cmd + U`
- **Undo**: `Ctrl/Cmd + Z`
- **Redo**: `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z`

## Styling & Customization

### Custom Styling

The editor uses Tailwind CSS classes. You can customize the appearance by:

1. **Modifying the component directly** - Update the className attributes
2. **Using the className prop** - Add your own wrapper classes
3. **CSS overrides** - Target the generated classes

### Custom Toolbar

To customize the toolbar, edit the toolbar section in `WYSIWYGEditor.tsx`:

```tsx
// Add your custom button
<ToolbarButton
  onClick={() => /* your action */}
  isActive={false}
  tooltip="My Custom Action"
  icon={<YourIcon className="w-5 h-5" />}
/>
```

### Custom Extensions

Add additional Tiptap extensions:

```tsx
import CustomExtension from '@tiptap/extension-custom';

const editor = useEditor({
  extensions: [
    // ... existing extensions
    CustomExtension.configure({
      // your config
    }),
  ],
});
```

## Backend Integration

### Saving Content

The editor provides content in two formats:

1. **JSON Format** - Tiptap's internal format (recommended for storage)
2. **HTML Format** - Rendered HTML (for display)

**Recommended approach:**

```tsx
const handleSave = async (content: string, html: string) => {
  try {
    const response = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content,      // Store this in your database
        contentHtml: html,     // Optional: for quick display
      }),
    });
    
    if (response.ok) {
      toast.success('Content saved!');
    }
  } catch (error) {
    toast.error('Failed to save');
  }
};
```

### Loading Saved Content

```tsx
useEffect(() => {
  // Fetch from your backend
  fetch('/api/content/123')
    .then(res => res.json())
    .then(data => {
      // Set the initial content
      setInitialContent(data.content);
    });
}, []);

return (
  <WYSIWYGEditor
    initialContent={initialContent}
    onSave={handleSave}
  />
);
```

## Common Use Cases

### Blog/Article Editor

```tsx
<WYSIWYGEditor
  placeholder="Write your article..."
  maxCharacters={50000}
  minHeight="600px"
  onSave={handleArticleSave}
  onChange={handleAutoSave}
/>
```

### Comment System

```tsx
<WYSIWYGEditor
  placeholder="Write a comment..."
  maxCharacters={2000}
  minHeight="150px"
  onSave={handleCommentSubmit}
/>
```

### Email Composer

```tsx
<WYSIWYGEditor
  placeholder="Compose your email..."
  maxCharacters={100000}
  minHeight="400px"
  onSave={handleSendEmail}
  onChange={handleDraftSave}
/>
```

## Troubleshooting

### Editor not rendering

Make sure all dependencies are installed:
```bash
npm install @tiptap/react @tiptap/starter-kit
```

### Styles not applied

Ensure Tailwind CSS is properly configured in your project.

### Content not saving

Check that your `onSave` callback is properly implemented and handling the content.

### Images not displaying

The image insertion uses URL-based images. Make sure:
1. The image URL is accessible
2. CORS is properly configured if loading from external sources
3. Your CSP allows the image source

## Advanced Features

### Custom Image Upload

Replace the simple URL prompt with a file upload:

```tsx
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  editor.chain().focus().setImage({ src: url }).run();
};
```

### Collaborative Editing

To add real-time collaboration, you can integrate Yjs:

```bash
npm install @tiptap/extension-collaboration y-websocket
```

### Export to PDF

```tsx
import html2pdf from 'html2pdf.js';

const exportToPDF = () => {
  const html = editor.getHTML();
  html2pdf().from(html).save('document.pdf');
};
```

## Performance Tips

1. **Use onChange debouncing** for auto-save to avoid too many API calls
2. **Lazy load the editor** if it's not immediately visible
3. **Consider pagination** for very long documents
4. **Implement draft auto-save** every 30 seconds instead of on every change

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support (with responsive toolbar)

## License

This component uses Tiptap which is licensed under MIT.

## Support

For issues or questions:
1. Check the Tiptap documentation: https://tiptap.dev/
2. Review this README
3. Open an issue in your project repository

## Credits

Built with:
- [Tiptap](https://tiptap.dev/) - Headless editor framework
- [React](https://react.dev/) - UI framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Tailwind CSS](https://tailwindcss.com/) - Styling