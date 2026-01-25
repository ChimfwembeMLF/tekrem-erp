import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
}

const CTASection: React.FC<Props> = ({ title, subtitle, buttonText, buttonLink }) => (
  <section className="cta-section py-16 text-center bg-primary text-white">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      {subtitle && <p className="mb-6 text-lg">{subtitle}</p>}
      <a href={buttonLink} className="inline-block px-8 py-3 bg-secondary text-white font-semibold rounded shadow hover:bg-secondary-dark transition">
        {buttonText}
      </a>
    </div>
  </section>
);

export default CTASection;
