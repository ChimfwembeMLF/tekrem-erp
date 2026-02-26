// ── MarkdownEditor.tsx ────────────────────────────────────────────────────────
// Reusable GitHub-style Markdown editor – fully typed for TypeScript.
//
// Usage:
//   import MarkdownEditor from "@/components/MarkdownEditor";
//   <MarkdownEditor onChange={(val) => console.log(val)} />
//
// Props: see MarkdownEditorProps below.
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FC,
  type ReactNode,
  type ChangeEvent,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Public types – export these so consumers can use them
// ─────────────────────────────────────────────────────────────────────────────

/** The three layout modes the editor can be in. */
export type EditorMode = "write" | "preview" | "split";

/** Language tokens supported by the built-in syntax highlighter. */
export type SupportedLanguage =
  | "js"
  | "javascript"
  | "ts"
  | "typescript"
  | "jsx"
  | "tsx"
  | "python"
  | "py"
  | "css"
  | "html"
  | "bash"
  | "sh";

/** Internal language family the highlighter normalises tokens to. */
type LanguageFamily = "js" | "python" | "css" | "html" | "bash";

/** Shape returned by the `wrap` and `prefix` helpers. */
interface EditResult {
  /** The full new textarea value after the edit. */
  value: string;
  /** Tuple of [start, end] for the new selection cursor. */
  cur: [number, number];
}

/** All toolbar action keys. */
export type ToolbarAction =
  | "bold"
  | "italic"
  | "strike"
  | "h1"
  | "h2"
  | "h3"
  | "code"
  | "cblock"
  | "ul"
  | "ol"
  | "bq"
  | "hr";

/**
 * Props accepted by `<MarkdownEditor />`.
 * All props are optional — the component is fully self-contained.
 */
export interface MarkdownEditorProps {
  /** Initial markdown string shown on mount. Defaults to the built-in demo. */
  initialValue?: string;
  /** Textarea placeholder shown when the editor is empty. */
  placeholder?: string;
  /**
   * localStorage key used for autosave.
   * Change this to namespace separate editors on the same page.
   * @default "mde-v1"
   */
  storageKey?: string;
  /**
   * Height of the editor body in pixels.
   * Does not include the header, toolbar, or status bar.
   * @default 500
   */
  height?: number;
  /** Extra CSS class applied to the root element. */
  className?: string;
  /**
   * Callback fired on every content change (debounced to every keystroke,
   * not the autosave debounce).
   */
  onChange?: (value: string) => void;
  /**
   * Controlled dark-mode override. When omitted the editor manages
   * dark mode internally, seeded from `prefers-color-scheme`.
   */
  darkMode?: boolean;
  /**
   * Called when the user toggles the dark-mode button.
   * Only relevant when `darkMode` is a controlled prop.
   */
  onDarkModeChange?: (dark: boolean) => void;
  /**
   * Autosave debounce in milliseconds.
   * @default 700
   */
  autosaveDelay?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

/** A single toolbar button definition. */
interface ToolbarButton {
  action: ToolbarAction;
  title: string;
  label: ReactNode;
  style?: React.CSSProperties;
}

/** A group of toolbar buttons separated by dividers. */
type ToolbarGroup = ToolbarButton[];

/** Theme colour token map. */
interface ThemeTokens {
  bg: string;
  surf: string;
  surf2: string;
  bdr: string;
  bdr2: string;
  tx: string;
  tx2: string;
  tx3: string;
  link: string;
  bqbar: string;
  shk: string;
  shs: string;
  shc: string;
  shn: string;
}

/** Language keyword map used by the highlighter. */
type KeywordMap = Partial<Record<LanguageFamily, RegExp>>;

/** Language normalisation lookup. */
type LangLookup = Partial<Record<SupportedLanguage | string, LanguageFamily>>;

// ─────────────────────────────────────────────────────────────────────────────
// Markdown parser utilities
// ─────────────────────────────────────────────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LANG_MAP: LangLookup = {
  js: "js", javascript: "js", ts: "js", typescript: "js", jsx: "js", tsx: "js",
  python: "python", py: "python",
  css: "css",
  html: "html",
  bash: "bash", sh: "bash",
};

const KEYWORD_PATTERNS: KeywordMap = {
  js:     /\b(const|let|var|function|return|if|else|for|while|do|class|extends|import|export|default|from|as|async|await|new|this|typeof|instanceof|in|of|null|undefined|true|false|try|catch|finally|throw|switch|case|break|continue|delete|void)\b/g,
  python: /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|True|False|None|with|as|try|except|finally|lambda|yield|pass|break|continue|global|nonlocal|del|assert|raise|is)\b/g,
  css:    /\b(important|inherit|initial|unset|auto|none|block|flex|grid|inline|absolute|relative|fixed|sticky|solid|transparent)\b/g,
  bash:   /\b(echo|cd|ls|mkdir|rm|mv|cp|grep|awk|sed|cat|if|then|else|fi|for|do|done|while|export|source|alias)\b/g,
};

function highlight(code: string, lang: string): string {
  const family = LANG_MAP[lang.toLowerCase() as SupportedLanguage];
  if (!family) return code;

  // strings
  code = code.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
    '<span class="sh-s">$1</span>',
  );

  // comments
  if (family === "python" || family === "bash") {
    code = code.replace(/(#[^\n]*)/g, '<span class="sh-c">$1</span>');
  } else {
    code = code.replace(/(\/\/[^\n]*)/g, '<span class="sh-c">$1</span>');
    code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sh-c">$1</span>');
  }

  // keywords
  const kwPattern = KEYWORD_PATTERNS[family];
  if (kwPattern) {
    // Reset lastIndex since we reuse regexes
    kwPattern.lastIndex = 0;
    code = code.replace(kwPattern, '<span class="sh-k">$1</span>');
  }

  // numbers
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="sh-n">$1</span>');

  return code;
}

function inlineMarkdown(raw: string): string {
  let t = escHtml(raw);
  t = t.replace(/\*\*\*([\s\S]*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  t = t.replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/__([\s\S]*?)__/g, "<strong>$1</strong>");
  t = t.replace(/\*([\s\S]*?)\*/g, "<em>$1</em>");
  t = t.replace(/_([\s\S]*?)_/g, "<em>$1</em>");
  t = t.replace(/~~([\s\S]*?)~~/g, "<del>$1</del>");
  t = t.replace(/`([^`]+)`/g, '<code class="md-ic">$1</code>');
  t = t.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy"/>',
  );
  t = t.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return t;
}

function parseMarkdown(md: string): string {
  if (!md.trim()) return "";
  const lines = md.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      let src = "";
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        src += lines[i] + "\n";
        i++;
      }
      const escaped = escHtml(src.trimEnd());
      const highlighted = highlight(escaped, lang);
      html += `<pre class="md-cb"><div class="md-lang">${escHtml(lang || "text")}</div><code>${highlighted}</code></pre>`;
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3}) (.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      html += `<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`;
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      html += "<hr/>";
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      let bq = "";
      while (i < lines.length && lines[i].startsWith("> ")) {
        bq += inlineMarkdown(lines[i].slice(2)) + " ";
        i++;
      }
      html += `<blockquote>${bq.trim()}</blockquote>`;
      continue;
    }

    // Unordered list
    if (/^[-*+] /.test(line)) {
      let items = "";
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items += `<li>${inlineMarkdown(lines[i].slice(2))}</li>`;
        i++;
      }
      html += `<ul>${items}</ul>`;
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      let items = "";
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items += `<li>${inlineMarkdown(lines[i].replace(/^\d+\. /, ""))}</li>`;
        i++;
      }
      html += `<ol>${items}</ol>`;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph – collect contiguous non-special lines
    let para = line;
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !/^#{1,3} /.test(lines[i + 1]) &&
      !/^> /.test(lines[i + 1]) &&
      !/^```/.test(lines[i + 1]) &&
      !/^[-*+] /.test(lines[i + 1]) &&
      !/^\d+\. /.test(lines[i + 1]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i + 1].trim())
    ) {
      i++;
      para += " " + lines[i];
    }
    html += `<p>${inlineMarkdown(para)}</p>`;
    i++;
  }

  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor action helpers
// ─────────────────────────────────────────────────────────────────────────────

function wrapSelection(
  ta: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder = "text",
): EditResult {
  const s = ta.selectionStart;
  const e = ta.selectionEnd;
  const selected = ta.value.slice(s, e) || placeholder;
  return {
    value: ta.value.slice(0, s) + before + selected + after + ta.value.slice(e),
    cur: [s + before.length, s + before.length + selected.length],
  };
}

function prefixLine(ta: HTMLTextAreaElement, pfx: string): EditResult {
  const s = ta.selectionStart;
  const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
  return {
    value: ta.value.slice(0, lineStart) + pfx + ta.value.slice(lineStart),
    cur: [s + pfx.length, s + pfx.length],
  };
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default content
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_VALUE = `# Markdown Editor

Write in **Markdown** with live preview, *syntax highlighting*, and ~~zero~~ friction.

## Getting Started

Use the toolbar above to insert formatting, or type directly. Your work **autosaves** to localStorage.

### Supported Elements

- **Bold**, *italic*, ~~strikethrough~~, and \`inline code\`
- Headings H1 → H3
- Ordered and unordered lists
- Fenced code blocks with syntax highlighting
- Blockquotes and horizontal rules

\`\`\`typescript
interface Editor {
  value: string;
  mode: "write" | "preview" | "split";
  onChange: (value: string) => void;
}

const parseContent = async (md: string): Promise<string> => {
  return parseMarkdown(md);
};
\`\`\`

> Switch between **Write**, **Preview**, and **Split** view using the tabs above.

---

1. Write your content
2. Preview renders in real time
3. Copy or export anytime
`;

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

const Icons = {
  pen: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.013 2.5a1.5 1.5 0 0 1 2.121 0l.365.366a1.5 1.5 0 0 1 0 2.12L5.5 13 2 14l1-3.5 8.013-8Z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  split: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="14" rx="1" />
      <rect x="9" y="1" width="6" height="14" rx="1" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="9" height="9" rx="1.5" />
      <path d="M4 11H3a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 3 1h7A1.5 1.5 0 0 1 11.5 2.5V4" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M2.5 8L6.5 12L13.5 4" />
    </svg>
  ),
  moon: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M10.5 3L14 8l-3.5 5M5.5 3L2 8l3.5 5" />
    </svg>
  ),
  blockCode: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="14" height="12" rx="2" />
      <path d="M1 6h14M5 10l1.5 1.5L5 13M8.5 13h3" />
    </svg>
  ),
  ul: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="2.5" cy="4" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M5.5 4h9M5.5 8h9M5.5 12h9" />
    </svg>
  ),
  ol: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5.5 4h9M5.5 8h9M5.5 12h9" />
      <path d="M2 3v2M1.5 5h1" strokeLinecap="round" />
      <path d="M1 8.5c0-.5.5-1 1-1s1 .3 1 .8-.5.8-1 1l-1 .7h2" strokeLinecap="round" />
      <path d="M1.5 11v1.5M1 13h1" strokeLinecap="round" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z" />
    </svg>
  ),
  hr: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8h14" strokeLinecap="round" />
      <path d="M3 5v2M7 5v2M11 5v2M5 9v2M9 9v2" strokeLinecap="round" />
    </svg>
  ),
  pulse: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8h3l2-5 3 10 2-5h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
} as const satisfies Record<string, ReactNode>;

// ─────────────────────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────────────────────

const LIGHT_THEME: ThemeTokens = {
  bg: "#F6F5F2", surf: "#FFFFFF", surf2: "#F0EFE9",
  bdr: "#E3E2DC", bdr2: "#C4C3BC",
  tx: "#1A1917", tx2: "#6E6D68", tx3: "#ADACA6",
  link: "#2563EB", bqbar: "#D4D3CC",
  shk: "#7C3AED", shs: "#059669", shc: "#9CA3AF", shn: "#D97706",
};

const DARK_THEME: ThemeTokens = {
  bg: "#0F0F0E", surf: "#191917", surf2: "#131312",
  bdr: "#2A2927", bdr2: "#3C3B38",
  tx: "#F4F3EF", tx2: "#72716C", tx3: "#484742",
  link: "#60A5FA", bqbar: "#3C3B38",
  shk: "#A78BFA", shs: "#34D399", shc: "#52525B", shn: "#FBBF24",
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS (injected via <style>) – kept out of the TSX rendering
// ─────────────────────────────────────────────────────────────────────────────

const EDITOR_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

.mde {
  --bg:    #F6F5F2; --surf:  #FFFFFF;  --surf2: #F0EFE9;
  --bdr:   #E3E2DC; --bdr2:  #C4C3BC;
  --tx:    #1A1917; --tx2:   #6E6D68;  --tx3:   #ADACA6;
  --link:  #2563EB; --bqbar: #D4D3CC;
  --sh-k:  #7C3AED; --sh-s:  #059669;  --sh-c:  #9CA3AF; --sh-n: #D97706;

  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg); border: 1px solid var(--bdr); border-radius: 12px;
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 1px 4px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
  transition: background .2s, border-color .2s;
}
.mde.dark {
  --bg:    #0F0F0E; --surf:  #191917;  --surf2: #131312;
  --bdr:   #2A2927; --bdr2:  #3C3B38;
  --tx:    #F4F3EF; --tx2:   #72716C;  --tx3:   #484742;
  --link:  #60A5FA; --bqbar: #3C3B38;
  --sh-k:  #A78BFA; --sh-s:  #34D399;  --sh-c:  #52525B; --sh-n: #FBBF24;
}

/* Header */
.mde-hd { display:flex; align-items:center; justify-content:space-between; padding:0 8px 0 4px; background:var(--bg); border-bottom:1px solid var(--bdr); min-height:46px; gap:8px; }
.mde-tabs { display:flex; gap:2px; padding:6px 4px; }
.mde-tab { display:flex; align-items:center; gap:5px; padding:5px 13px; border-radius:7px; border:none; background:transparent; color:var(--tx2); font-family:inherit; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; white-space:nowrap; letter-spacing:-.01em; }
.mde-tab:hover { background:var(--surf); color:var(--tx); }
.mde-tab.on { background:var(--surf); color:var(--tx); box-shadow:0 0 0 1px var(--bdr); }
.mde-tab svg { width:13px; height:13px; opacity:.7; flex-shrink:0; }
.mde-tab.on svg { opacity:1; }
.mde-hdr { display:flex; align-items:center; gap:3px; }
.mde-ibtn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:7px; border:none; background:transparent; color:var(--tx2); cursor:pointer; transition:all .15s; }
.mde-ibtn:hover { background:var(--surf); color:var(--tx); }
.mde-ibtn svg { width:14px; height:14px; }

/* Toolbar */
.mde-tb { display:flex; align-items:center; gap:2px; padding:6px 10px; background:var(--surf2); border-bottom:1px solid var(--bdr); flex-wrap:wrap; }
.mde-tbg { display:flex; align-items:center; gap:1px; }
.mde-t { display:flex; align-items:center; justify-content:center; min-width:30px; height:28px; padding:0 7px; border-radius:5px; border:none; background:transparent; color:var(--tx2); font-family:inherit; font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; line-height:1; letter-spacing:-.01em; }
.mde-t:hover { background:var(--surf); color:var(--tx); }
.mde-t:active { transform:scale(.93); }
.mde-t svg { width:13px; height:13px; }
.mde-sep { width:1px; height:16px; background:var(--bdr2); margin:0 4px; flex-shrink:0; }

/* Body */
.mde-body { display:flex; flex:1; overflow:hidden; background:var(--surf); }
.mde-ta { flex:1; min-width:0; padding:22px 26px; border:none; outline:none; resize:none; background:var(--surf); color:var(--tx); font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace; font-size:13.5px; line-height:1.75; tab-size:2; caret-color:var(--tx); transition:background .2s; }
.mde-ta::placeholder { color:var(--tx3); }
.mde-ta::-webkit-scrollbar { width:5px; }
.mde-ta::-webkit-scrollbar-thumb { background:var(--bdr2); border-radius:3px; }
.mde-sdiv { width:1px; background:var(--bdr); flex-shrink:0; }

/* Preview */
.mde-pv { flex:1; min-width:0; padding:22px 28px; overflow-y:auto; color:var(--tx); font-size:15px; line-height:1.75; }
.mde-pv::-webkit-scrollbar { width:5px; }
.mde-pv::-webkit-scrollbar-thumb { background:var(--bdr2); border-radius:3px; }
.mde-pv h1 { font-size:1.85rem; font-weight:700; margin:0 0 14px; padding-bottom:10px; border-bottom:1px solid var(--bdr); letter-spacing:-.03em; line-height:1.2; }
.mde-pv h2 { font-size:1.35rem; font-weight:700; margin:28px 0 10px; letter-spacing:-.02em; line-height:1.3; }
.mde-pv h3 { font-size:1.1rem; font-weight:600; margin:22px 0 8px; letter-spacing:-.01em; }
.mde-pv p { margin:0 0 14px; }
.mde-pv strong { font-weight:600; }
.mde-pv em { font-style:italic; }
.mde-pv del { text-decoration:line-through; color:var(--tx2); }
.mde-pv a { color:var(--link); text-decoration:underline; text-underline-offset:2px; }
.mde-pv ul,.mde-pv ol { margin:0 0 14px; padding-left:24px; }
.mde-pv li { margin:5px 0; }
.mde-pv blockquote { margin:16px 0; padding:12px 18px; border-left:3px solid var(--bqbar); background:var(--surf2); border-radius:0 7px 7px 0; color:var(--tx2); font-style:italic; }
.mde-pv hr { margin:24px 0; border:none; border-top:1px solid var(--bdr); }
.mde-pv img { max-width:100%; border-radius:7px; margin:8px 0; display:block; }
.mde-pv .md-ic { font-family:'JetBrains Mono',monospace; font-size:.83em; padding:2px 5px; background:var(--surf2); border:1px solid var(--bdr); border-radius:4px; color:var(--tx); }
.mde-pv .md-cb { margin:16px 0; background:var(--surf2); border:1px solid var(--bdr); border-radius:9px; overflow:hidden; }
.mde-pv .md-lang { padding:5px 14px; font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--tx3); border-bottom:1px solid var(--bdr); background:var(--bg); letter-spacing:.06em; text-transform:lowercase; }
.mde-pv .md-cb code { display:block; padding:14px 16px; font-family:'JetBrains Mono',monospace; font-size:13px; line-height:1.65; overflow-x:auto; white-space:pre; color:var(--tx); }
.mde-pv .md-cb code::-webkit-scrollbar { height:4px; }
.mde-pv .md-cb code::-webkit-scrollbar-thumb { background:var(--bdr2); border-radius:2px; }
.sh-k { color:var(--sh-k); font-weight:500; }
.sh-s { color:var(--sh-s); }
.sh-c { color:var(--sh-c); font-style:italic; }
.sh-n { color:var(--sh-n); }
.mde-empty { color:var(--tx3); font-style:italic; }

/* Status bar */
.mde-sb { display:flex; align-items:center; justify-content:space-between; padding:5px 14px; background:var(--surf2); border-top:1px solid var(--bdr); font-size:11.5px; color:var(--tx3); transition:background .2s; }
.mde-sb-l,.mde-sb-r { display:flex; align-items:center; gap:6px; }
.mde-sb svg { width:11px; height:11px; }
.dot { opacity:.4; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface TabsProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const TAB_DEFS: Array<{ mode: EditorMode; icon: keyof typeof Icons; label: string }> = [
  { mode: "write",   icon: "pen",   label: "Write"   },
  { mode: "preview", icon: "eye",   label: "Preview" },
  { mode: "split",   icon: "split", label: "Split"   },
];

const Tabs: FC<TabsProps> = ({ mode, onModeChange }) => (
  <div className="mde-tabs">
    {TAB_DEFS.map(({ mode: m, icon, label }) => (
      <button
        key={m}
        className={`mde-tab${mode === m ? " on" : ""}`}
        onClick={() => onModeChange(m)}
        aria-pressed={mode === m}
      >
        {Icons[icon]}
        {label}
      </button>
    ))}
  </div>
);

interface ToolbarGroupsProps {
  onAction: (action: ToolbarAction) => void;
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  [
    { action: "bold",   title: "Bold",          label: <b>B</b>,         style: {} },
    { action: "italic", title: "Italic",         label: "I",              style: { fontStyle: "italic" } },
    { action: "strike", title: "Strikethrough",  label: "S",              style: { textDecoration: "line-through" } },
  ],
  [
    { action: "h1", title: "Heading 1", label: "H1" },
    { action: "h2", title: "Heading 2", label: "H2" },
    { action: "h3", title: "Heading 3", label: "H3" },
  ],
  [
    { action: "code",   title: "Inline code", label: Icons.code },
    { action: "cblock", title: "Code block",  label: Icons.blockCode },
  ],
  [
    { action: "ul", title: "Unordered list", label: Icons.ul },
    { action: "ol", title: "Ordered list",   label: Icons.ol },
  ],
  [
    { action: "bq", title: "Blockquote", label: Icons.quote },
    { action: "hr", title: "Divider",    label: Icons.hr },
  ],
];

const Toolbar: FC<ToolbarGroupsProps> = ({ onAction }) => (
  <div className="mde-tb">
    {TOOLBAR_GROUPS.map((group, gi) => (
      <>
        <div key={`g-${gi}`} className="mde-tbg">
          {group.map((btn) => (
            <button
              key={btn.action}
              className="mde-t"
              title={btn.title}
              style={btn.style}
              onClick={() => onAction(btn.action)}
              aria-label={btn.title}
            >
              {btn.label}
            </button>
          ))}
        </div>
        {gi < TOOLBAR_GROUPS.length - 1 && (
          <div key={`sep-${gi}`} className="mde-sep" role="separator" />
        )}
      </>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const MarkdownEditor: FC<MarkdownEditorProps> = ({
  initialValue = DEFAULT_VALUE,
  placeholder = "Start writing in Markdown...",
  storageKey = "mde-v1",
  height = 500,
  className = "",
  onChange,
  darkMode: controlledDark,
  onDarkModeChange,
  autosaveDelay = 700,
}) => {
  // ── Dark mode ─────────────────────────────────────────────────────────────
  const isControlled = controlledDark !== undefined;

  const [internalDark, setInternalDark] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  const dark = isControlled ? (controlledDark as boolean) : internalDark;

  const toggleDark = useCallback(() => {
    if (isControlled) {
      onDarkModeChange?.(!dark);
    } else {
      setInternalDark((d) => !d);
    }
  }, [isControlled, dark, onDarkModeChange]);

  // ── Editor state ──────────────────────────────────────────────────────────
  const [value, setValue] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  const [mode, setMode] = useState<EditorMode>("write");
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(true);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const taRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Autosave ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setSaved(false);
    if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, value);
        setSaved(true);
      } catch {
        // localStorage unavailable (e.g. SSR or private mode quota hit)
      }
    }, autosaveDelay);

    onChange?.(value);

    return () => {
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    };
  }, [value, storageKey, onChange, autosaveDelay]);

  // ── Toolbar actions ───────────────────────────────────────────────────────
  const handleAction = useCallback((action: ToolbarAction): void => {
    const ta = taRef.current;
    if (!ta) return;

    if (action === "hr") {
      const s = ta.selectionStart;
      setValue((prev) => prev.slice(0, s) + "\n---\n" + prev.slice(s));
      setTimeout(() => {
        if (!taRef.current) return;
        taRef.current.selectionStart = taRef.current.selectionEnd = s + 5;
        taRef.current.focus();
      }, 0);
      return;
    }

    const WRAP_MAP: Partial<Record<ToolbarAction, [string, string, string?]>> = {
      bold:   ["**", "**"],
      italic: ["*",  "*"],
      strike: ["~~", "~~"],
      code:   ["`",  "`"],
      cblock: ["```js\n", "\n```", "code here"],
    };

    const PREFIX_MAP: Partial<Record<ToolbarAction, string>> = {
      h1: "# ",
      h2: "## ",
      h3: "### ",
      ul: "- ",
      ol: "1. ",
      bq: "> ",
    };

    const wrapArgs = WRAP_MAP[action];
    const pfx = PREFIX_MAP[action];

    let result: EditResult | undefined;
    if (wrapArgs) {
      result = wrapSelection(ta, wrapArgs[0], wrapArgs[1], wrapArgs[2]);
    } else if (pfx) {
      result = prefixLine(ta, pfx);
    }

    if (!result) return;

    setValue(result.value);
    setTimeout(() => {
      if (!taRef.current || !result) return;
      taRef.current.selectionStart = result.cur[0];
      taRef.current.selectionEnd = result.cur[1];
      taRef.current.focus();
    }, 0);
  }, []);

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = useCallback((): void => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [value]);

  // ── Textarea change ───────────────────────────────────────────────────────
  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setValue(e.target.value);
  }, []);

  // ── Rendered HTML ─────────────────────────────────────────────────────────
  const previewHtml = parseMarkdown(value);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className={`mde${dark ? " dark" : ""}${className ? ` ${className}` : ""}`}>
      <style>{EDITOR_CSS}</style>

      {/* ── Header ── */}
      <div className="mde-hd">
        <Tabs mode={mode} onModeChange={setMode} />
        <div className="mde-hdr">
          <button
            className="mde-ibtn"
            title={copied ? "Copied!" : "Copy markdown"}
            aria-label={copied ? "Copied!" : "Copy markdown"}
            onClick={handleCopy}
          >
            {copied ? Icons.check : Icons.copy}
          </button>
          <button
            className="mde-ibtn"
            title="Toggle dark mode"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleDark}
          >
            {dark ? Icons.sun : Icons.moon}
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      {mode !== "preview" && <Toolbar onAction={handleAction} />}

      {/* ── Editor body ── */}
      <div className="mde-body" style={{ height }}>
        {(mode === "write" || mode === "split") && (
          <textarea
            ref={taRef}
            className="mde-ta"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            spellCheck={false}
            aria-label="Markdown editor"
            aria-multiline="true"
          />
        )}

        {mode === "split" && <div className="mde-sdiv" aria-hidden="true" />}

        {(mode === "preview" || mode === "split") && (
          <div
            className="mde-pv"
            role="region"
            aria-label="Markdown preview"
            dangerouslySetInnerHTML={{
              __html:
                previewHtml ||
                '<p class="mde-empty">Nothing to preview yet.</p>',
            }}
          />
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="mde-sb" role="status" aria-live="polite">
        <div className="mde-sb-l">
          {Icons.pulse}
          <span>{saved ? "Autosaved" : "Saving…"}</span>
        </div>
        <div className="mde-sb-r">
          <span>{wordCount(value)} words</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>{value.length} chars</span>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

// ─────────────────────────────────────────────────────────────────────────────
// Convenience re-exports for consumers
// ─────────────────────────────────────────────────────────────────────────────

export { parseMarkdown, wordCount, LIGHT_THEME, DARK_THEME };
export type { ThemeTokens, EditResult, ToolbarButton, ToolbarGroup };