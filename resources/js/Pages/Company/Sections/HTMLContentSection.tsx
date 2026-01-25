import React from 'react';

interface Props {
  html: string;
  title?: string;
  container?: boolean;
}

const HTMLContentSection: React.FC<Props> = ({ html, title, container = true }) => (
  <section className="html-content-section py-16">
    <div className={container ? 'container mx-auto max-w-3xl' : ''}>
      {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
      <div className="prose mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  </section>
);

export default HTMLContentSection;
