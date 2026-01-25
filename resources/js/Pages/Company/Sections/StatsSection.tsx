import React from 'react';

interface Stat {
  label: string;
  value: string | number;
}

interface Props {
  stats: Stat[];
}

const StatsSection: React.FC<Props> = ({ stats }) => (
  <section className="stats-section py-16 bg-gray-50">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-white rounded shadow">
            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
