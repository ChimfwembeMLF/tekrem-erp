#!/usr/bin/env node
/**
 * Migrates Create/Edit pages: AppLayout outer shell -> ModuleFormShell.
 * Preserves inner Card/form field structure.
 */
import fs from 'fs';
import { globSync } from 'glob';

const MODULE_MAP = [
  { match: '/CRM/', shell: 'CrmFormShell' },
  { match: '/Finance/', shell: 'FinanceFormShell' },
  { match: '/Projects/', shell: 'ProjectsFormShell' },
  { match: '/Support/', shell: 'SupportFormShell' },
  { match: '/AI/', shell: 'AIFormShell' },
  { match: '/Inventory/', shell: 'InventoryFormShell' },
  { match: '/Sales/', shell: 'SalesFormShell' },
  { match: '/Procurement/', shell: 'ProcurementFormShell' },
  { match: '/Admin/', shell: 'AdminFormShell' },
  { match: '/Staff/', shell: 'StaffFormShell' },
];

const SKIP = new Set([
  'resources/js/Pages/Staff/Leave/Create.tsx',
  'resources/js/Pages/CRM/Leads/Create.tsx',
  'resources/js/Pages/AI/Conversations/Edit.tsx',
]);

function getModule(file) {
  return MODULE_MAP.find((m) => file.includes(m.match));
}

function extractBackRoute(content) {
  const routes = [...content.matchAll(/route\(['"]([a-z0-9_.]+)['"]/g)].map((m) => m[1]);
  const index = routes.find((r) => r.endsWith('.index'));
  if (index) return index;
  const show = routes.find((r) => r.endsWith('.show'));
  if (show) return show;
  const store = routes.find((r) => r.endsWith('.store'));
  if (store) return store.replace('.store', '.index');
  return routes[0] || '';
}

function extractTitle(content) {
  const patterns = [
    /title=\{t\([^,]+,\s*['"]([^'"]+)['"]\)\}/,
    /<CardTitle[^>]*>\{t\([^,]+,\s*['"]([^'"]+)['"]\)\}<\/CardTitle>/,
    /title=["']([^"']+)["']/,
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return 'Form';
}

function stripAppLayoutOpen(content) {
  const idx = content.indexOf('<AppLayout');
  if (idx === -1) return content;

  let end = -1;
  const renderIdx = content.indexOf('renderHeader', idx);
  if (renderIdx !== -1) {
    const arrowIdx = content.indexOf('=>', renderIdx);
    const openIdx = content.indexOf('(', arrowIdx);
    if (openIdx !== -1) {
      let depth = 0;
      for (let i = openIdx; i < content.length; i++) {
        const ch = content[i];
        if (ch === '(') depth++;
        else if (ch === ')') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            if (content[end] === '}') end++;
            while (end < content.length && /[\s\n]/.test(content[end])) end++;
            if (content[end] === '>') end++;
            break;
          }
        }
      }
    }
  }
  if (end === -1) end = content.indexOf('>', idx) + 1;

  let rest = content.slice(end);
  rest = rest.replace(/^\s*<Head[\s\S]*?<\/Head>\s*/m, '');
  rest = rest.replace(/^\s*<Head[^/]*\/>\s*/m, '');
  rest = rest.replace(/^\s*<div className="(?:py-\d+|space-y-6)"[^>]*>\s*/m, '');
  rest = rest.replace(/^\s*<div className="max-w-[^"]+"[^>]*>\s*/m, '');

  return content.slice(0, idx) + '<!--SHELL-->\n' + rest;
}

function migrateFile(file) {
  if (SKIP.has(file)) return 'skip';
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('AppLayout')) return content.includes('FormShell') ? 'already' : 'no-applayout';
  if (!content.includes('handleSubmit')) return 'no-handleSubmit';

  const mod = getModule(file);
  if (!mod) return 'no-module';

  const backRoute = extractBackRoute(content);
  const title = extractTitle(content);

  content = content.replace(/import AppLayout from '@\/Layouts\/AppLayout';\n?/g, '');
  content = content.replace(/,\s*Head\b|\bHead\s*,/g, '');
  content = content.replace(/import \{\s*\} from '@inertiajs\/react';\n?/g, '');
  content = content.replace(/^\s*<Head[^/]*\/>\s*\n/gm, '');
  content = content.replace(/^\s*<Head[\s\S]*?<\/Head>\s*\n/gm, '');

  const importLine = `import { ${mod.shell} } from '@/Components/Module/moduleFormWrappers';`;
  if (!content.includes('moduleFormWrappers')) {
    const idx = content.lastIndexOf("from '@/");
    const lineEnd = content.indexOf('\n', idx);
    content = content.slice(0, lineEnd + 1) + importLine + '\n' + content.slice(lineEnd + 1);
  }

  content = stripAppLayoutOpen(content);

  // Move form submit to shell; unwrap only the outermost form if it wraps everything
  const hasOuterForm = /<!--SHELL-->\s*<form\s+onSubmit=\{handleSubmit\}/.test(content);
  if (hasOuterForm) {
    content = content.replace(/<!--SHELL-->\s*<form\s+onSubmit=\{handleSubmit\}[^>]*>\s*/,'<!--SHELL-->\n');
    content = content.replace(/<\/form>\s*(?=<!--\/SHELL-->)/, '');
    content = content.replace(/<CardFooter[\s\S]*?<\/CardFooter>\s*/g, '');
  }

  content = content.replace(/<\/AppLayout>\s*$/m, '<!--/SHELL-->');
  content = content.replace(/(\s*<\/div>\s*){1,4}<!--\/SHELL-->/m, '\n<!--/SHELL-->');

  const shellOpen = `<${mod.shell}
      title={${JSON.stringify(title)}}
      backHref={route('${backRoute}')}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Save"
      maxWidth="4xl"
    >\n`;

  content = content.replace('<!--SHELL-->', shellOpen);
  content = content.replace('<!--/SHELL-->', `</${mod.shell}>`);

  if (content.includes('<AppLayout') || content.includes('<!--SHELL')) return 'failed';

  fs.writeFileSync(file, content);
  return 'ok';
}

const files = globSync('resources/js/Pages/**/{Create,Edit}.tsx');
let ok = 0;
const failed = [];
for (const file of files) {
  if (file.includes('/HR/')) continue;
  const r = migrateFile(file);
  if (r === 'ok') ok++;
  else if (r === 'failed' || r === 'no-handleSubmit') failed.push(`${file}: ${r}`);
}
console.log('Migrated:', ok, 'Failed:', failed.length);
failed.forEach((f) => console.log(' ', f));
