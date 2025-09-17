import React from 'react';

interface Technology {
  name: string;
  logo: string;
  color: string;
}

const technologies: Technology[] = [
  // Backend
  { name: 'Laravel', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg', color: 'from-red-500 to-red-600' },
  { name: 'Inertia.js', logo: 'https://avatars.githubusercontent.com/u/47703742?s=200&v=4', color: 'from-purple-500 to-purple-600' },
  { name: 'PHPUnit', logo: 'https://phpunit.de/img/phpunit.svg', color: 'from-green-500 to-green-600' },
  
  // Frontend
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: 'from-blue-500 to-cyan-500' },
  { name: 'TypeScript', logo: 'https://www.typescriptlang.org/static/play-03b12a3d83a6a50a7fde7a2b663f482d.png', color: 'from-blue-600 to-blue-700' },
  { name: 'Vite', logo: 'https://vitejs.dev/logo.svg', color: 'from-yellow-500 to-orange-500' },
  { name: 'Tailwind CSS', logo: 'https://tailwindcss.com/_next/static/media/tailwindcss-logotype.a1069bda.svg', color: 'from-teal-500 to-blue-500' },
  { name: 'Lucide React', logo: 'https://lucide.dev/logo.light.svg', color: 'from-indigo-500 to-purple-500' },
  { name: 'PostCSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postcss/postcss-original.svg', color: 'from-gray-600 to-gray-700' },
  
  // DevOps
  { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: 'from-blue-600 to-blue-800' },
  { name: 'Nginx', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: 'from-green-600 to-green-700' },
  { name: 'Composer', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/composer/composer-original.svg', color: 'from-orange-600 to-red-600' },
  { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', color: 'from-blue-700 to-indigo-700' },
  
  // Testing & CI/CD
  { name: 'Cypress', logo: 'https://avatars.githubusercontent.com/u/8908513?s=200&v=4', color: 'from-gray-700 to-gray-800' },
  { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', color: 'from-orange-500 to-red-500' },
  { name: 'GitHub Actions', logo: 'https://avatars.githubusercontent.com/u/44036562?s=200&v=4', color: 'from-gray-800 to-black' }
];

const TechnologiesSection: React.FC = () => {
  // Split technologies into two rows for alternating scroll directions
  const firstRow = technologies.slice(0, Math.ceil(technologies.length / 2));
  const secondRow = technologies.slice(Math.ceil(technologies.length / 2));

  const renderTechCard = (tech: Technology, index: number, keyPrefix: string = '') => {
    return (
      <div key={`${keyPrefix}${index}`} className="flex-shrink-0 group">
        <div className={`transition-all duration-300 transform hover:scale-105 min-w-[200px]`}>
          <div className="flex items-center justify-center space-x-3">
            <img 
              src={tech.logo} 
              alt={`${tech.name} logo`}
              className="w-20 h-20 object-contain filter brightness-0 invert"
              onError={(e) => {
                // Fallback to a simple colored circle if logo fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback && fallback.classList.contains('fallback-icon')) {
                  fallback.style.display = 'block';
                }
              }}
            />
            <div className="w-6 h-6 bg-white rounded-full fallback-icon" style={{ display: 'none' }} />
            <span className="text-white font-bold text-lg">{tech.name}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="lg:text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
            Our Technology Stack
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Built with Modern Technologies
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Leveraging cutting-edge tools and frameworks to deliver scalable, maintainable solutions.
          </p>
        </div>

        {/* Infinite Carousel Container */}
        <div className="relative">
          {/* First Row - Left to Right */}
          <div className="flex overflow-hidden mb-8">
            <div className="flex animate-scroll-left space-x-8 min-w-full">
              {firstRow.map((tech, i) => renderTechCard(tech, i))}
              {/* Duplicate for seamless loop */}
              {firstRow.map((tech, i) => renderTechCard(tech, i, 'dup1-'))}
            </div>
          </div>

          {/* Second Row - Right to Left */}
          <div className="flex overflow-hidden">
            <div className="flex animate-scroll-right space-x-8 min-w-full">
              {secondRow.map((tech, i) => renderTechCard(tech, i))}
              {/* Duplicate for seamless loop */}
              {secondRow.map((tech, i) => renderTechCard(tech, i, 'dup2-'))}
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 font-medium">
            Continuously evolving with the latest industry standards
          </p>
        </div>
      </div>
    </section>
  );
};

export default TechnologiesSection;