import React from 'react';

interface Service {
  title: string;
  description: string;
  icon?: string;
}

interface Props {
  services: Service[];
}

const ServicesSection: React.FC<Props> = ({ services }) => (
  <section className="services-section py-16 bg-gray-50">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Our Services</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, idx) => (
          <div key={idx} className="p-6 bg-white rounded shadow text-center">
            {service.icon && <div className="mb-4">{service.icon}</div>}
            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
