import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PagePreview from '@/Components/CMS/PagePreview';

interface Template {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  slug: string;
  is_active: boolean;
  updated_at: string;
}

interface Props {
  template: Template;
  renderedContent: string;
  sampleData: Record<string, any>;
}

export default function Preview({ template, renderedContent, sampleData }: Props) {
  const [showPreview, setShowPreview] = useState(true);

  // Map template data to page-like structure for preview
  const page = {
    title: template.name,
    slug: template.slug,
    content: renderedContent,
    excerpt: template.description || '',
    meta_title: template.name,
    meta_description: template.description || '',
    template: template.category || 'custom',
    status: template.is_active ? 'published' : 'draft',
    published_at: template.updated_at,
  };

  return (
    <AppLayout title={`Preview: ${template.name}`}>
      <Head title={`Preview: ${template.name}`} />
      {showPreview && (
        <PagePreview
          page={page}
          onClose={() => setShowPreview(false)}
        />
      )}
    </AppLayout>
  );
}
