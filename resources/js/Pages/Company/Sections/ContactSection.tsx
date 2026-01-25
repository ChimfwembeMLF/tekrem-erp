import React from 'react';

interface Props {
  company: any;
}

const ContactSection: React.FC<Props> = ({ company }) => (
  <section className="contact-section py-16 bg-gray-50">
    <div className="container mx-auto max-w-xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>
      <div className="bg-white rounded shadow p-8">
        <div className="mb-4">
          <strong>Address:</strong> {company.address || 'N/A'}
        </div>
        <div className="mb-4">
          <strong>Phone:</strong> {company.phone || 'N/A'}
        </div>
        <div className="mb-4">
          <strong>Email:</strong> {company.email || 'N/A'}
        </div>
      </div>
    </div>
  </section>
);

export default ContactSection;
