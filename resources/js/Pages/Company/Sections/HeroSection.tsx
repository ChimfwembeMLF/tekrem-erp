import React from 'react';

interface Props {
  company?: {
    name?: string;
    primary_color?: string;
  };
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

const HeroSection: React.FC<Props> = ({
  company,
  title,
  subtitle,
  backgroundImage,
}) => {
  const primaryColor = company?.primary_color || '#2563eb';
  const displayTitle = title || company?.name || 'Welcome';

  return (
    <section
      className="hero-section"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-5xl font-bold mb-4" style={{ color: primaryColor }}>
          {displayTitle}
        </h1>
        {subtitle && <p className="text-xl mb-6">{subtitle}</p>}
      </div>
    </section>
  );
};

export default HeroSection;
