import React from 'react';

interface Props {
  title?: string;
  content: string;
}

const ContentSection: React.FC<Props> = ({ title, content }) => (
  <section className="content-section py-16">
    <div className="container mx-auto max-w-3xl">
      {title && <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>}
      <div className="prose mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  </section>
);

export default ContentSection;
