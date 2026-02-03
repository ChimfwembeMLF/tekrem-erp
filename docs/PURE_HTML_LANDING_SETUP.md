# Pure HTML Landing Page Setup

## Summary
You now have two ways to display company landing pages:

### 1. **React Component Landing** (Default)
- Uses `Public/CMS/Page.tsx` component
- Renders with React sidebar, breadcrumbs, related pages
- Supports Markdown or HTML content with DOMPurify sanitization
- Best for: Content-driven pages that need structure

### 2. **Pure HTML Landing** (New)
- Uses `Company/Landing.tsx` with an `html_content` section
- Renders your HTML within the landing layout (nav + footer)
- Best for: Custom landing pages with company theming and structure

## How It Works

### Automatic Routing
When a CMS page has `use_html_content = true` and contains `html_content`:
1. PublicCMSController detects this
2. Routes to `Company/Landing` and injects an `html_content` section
3. Renders your HTML inside `HTMLContentSection`

### Admin Editor Flow
1. Edit a page in PageEditor
2. Toggle to "HTML Mode"
3. Paste/write complete HTML (with `<html>`, `<head>`, `<body>`, etc.)
4. Can include inline CSS and JavaScript
5. Publish
6. Automatically renders as pure HTML landing page

## Setup Complete

✅ Migration added for `html_content` and `use_html_content` fields  
✅ Page Model updated with new fields  
✅ PageEditor with HTML/Rich Text toggle  
✅ PublicCMSController routing logic  
✅ Company/Landing renders `html_content` via `HTMLContentSection`  
✅ Public/CMS/Page continues to render non-HTML-mode pages  

## Example HTML Content

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Landing</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    .hero { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 100px 20px; text-align: center; }
    h1 { font-size: 48px; margin: 0; }
    .cta { display: inline-block; background: white; color: #667eea; padding: 15px 40px; border-radius: 5px; margin-top: 20px; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>Welcome to Pure HTML</h1>
    <p>Complete design freedom without React components</p>
    <a href="#contact" class="cta">Get Started</a>
  </div>
</body>
</html>
```

## Admin Usage

1. Create/edit a page in the CMS
2. Click "Switch to HTML" button in PageEditor
3. Paste complete HTML (or build with TipTap HTML editor)
4. Publish
5. Visitors see pure HTML rendered at `/company/{slug}/pages/{page-slug}`

No React components, no additional styling overhead, just raw HTML.
