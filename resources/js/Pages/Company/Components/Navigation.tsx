import React from 'react';

import type { Menu, Company } from '../Landing';

interface Props {
  menu: Menu;
  company: Company;
}

const Navigation: React.FC<Props> = ({ menu, company }) => (
  <nav className="navigation py-4 bg-white shadow">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        {company.logo && <img src={company.logo} alt={company.name} className="h-8 w-8 object-contain" />}
        <span className="font-bold text-lg text-primary">{company.name}</span>
      </div>
      <ul className="flex gap-6">
        {menu.items.map((item) => (
          <li key={item.id}>
            <a href={item.url} target={item.target || '_self'} className="hover:text-secondary font-medium transition">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);

export default Navigation;
