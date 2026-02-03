import React from 'react';
import { Head } from '@inertiajs/react';
import DOMPurify from 'dompurify';

interface Company {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  favicon?: string;
}

interface CMSPage {
  id: number;
  title: string;
  slug: string;
  html_content?: string;
  content?: string;
  use_html_content?: boolean;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  css?: string; // Custom CSS for the page
}

interface Props {
  company: Company;
  page: CMSPage;
}

/**
 * Pure HTML Landing Page
 * Renders CMS content as raw HTML without React components
 * Ideal for custom, full-control landing pages with no framework constraints
 */
export default function HTMLLanding({ company, page }: Props) {
  const metaTitle = page.meta_title || page.title;
  const metaDescription = page.meta_description || '';

  const htmlContent = page.use_html_content && page.html_content
    ? page.html_content
    : page.content || '';

  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'p','br','strong','em','u','h1','h2','h3','h4','h5','h6','ul','ol','li','a','img','blockquote','code','pre','table','thead','tbody','tr','th','td','div','span','section','header','footer','main','article'
    ],
    ALLOWED_ATTR: ['href','src','alt','title','target','class','id','style']
  });
  return (
    <>
      <Head title={metaTitle}>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {page.og_image && <meta property="og:image" content={page.og_image} />}
        {company.favicon && <link rel="icon" href={company.favicon} />}
      </Head>

      {/* Pure HTML Content - No React components, just raw HTML */}
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </>
  );
}
