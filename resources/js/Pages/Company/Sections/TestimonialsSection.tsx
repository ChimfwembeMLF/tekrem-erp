import React from 'react';

interface Testimonial {
  name: string;
  role?: string;
  content: string;
  avatar?: string;
}

interface Props {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<Props> = ({ testimonials }) => (
  <section className="testimonials-section py-16 bg-gray-50">
    <div className="container mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Testimonials</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {testimonials.map((t, idx) => (
          <div key={idx} className="p-6 bg-white rounded shadow">
            {t.avatar && <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mb-4 mx-auto" />}
            <p className="italic mb-2">"{t.content}"</p>
            <div className="font-semibold text-primary text-center">{t.name}</div>
            {t.role && <div className="text-xs text-gray-500 text-center">{t.role}</div>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
