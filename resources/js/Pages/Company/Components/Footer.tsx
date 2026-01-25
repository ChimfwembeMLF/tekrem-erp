import React from 'react';

import type { Footer as FooterType, Company } from '../Landing';

interface Props extends FooterType {
  company: Company;
}

const Footer: React.FC<Props> = ({ company, menu, social, copyright }) => (
  <footer className="footer py-8 bg-gray-900 text-white mt-12">
    <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        {company.logo && <img src={company.logo} alt={company.name} className="h-8 w-8 object-contain" />}
        <span className="font-bold text-lg">{company.name}</span>
      </div>
      {menu && (
        <ul className="flex gap-6 mb-4 md:mb-0">
          {menu.map((item) => (
            <li key={item.id}>
              <a href={item.url} className="hover:text-secondary transition">
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-4">
        {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>}
        {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>}
        {social?.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
        {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
      </div>
    </div>
    <div className="text-center text-xs text-gray-400 mt-4">{copyright}</div>
  </footer>
);

export default Footer;
