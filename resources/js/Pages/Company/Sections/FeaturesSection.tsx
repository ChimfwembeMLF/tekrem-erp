import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface Props {
  features: Feature[];
}

const FeaturesSection: React.FC<Props> = ({ features }) => (
  <section className="features-section py-16">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div key={idx} className="p-6 bg-white rounded shadow text-center">
            {feature.icon && <div className="mb-4">{feature.icon}</div>}
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
