export interface ServiceFeature {
  title: string;
  description: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
}

export interface ServicePackage {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export interface ServiceData {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  routeName: 'services.show';
  illustration?: string;
  features: ServiceFeature[];
  benefits: ServiceBenefit[];
  packages: ServicePackage[];
  technologies: string[];
  processSteps: string[];
  faq: Array<{ question: string; answer: string }>;
}

export const serviceIllustrations: Record<string, string> = {
  'website-development': '/assets/illustrations/web-services-illustration.png',
  'mobile-app-development': '/assets/illustrations/services-illustration.png',
  'digital-marketing': '/assets/illustrations/services-illustration.png',
  'graphic-design': '/assets/illustrations/services-illustration.png',
  'software-solutions': '/assets/illustrations/services-illustration.png',
  'ict-consultancy': '/assets/illustrations/cloud-services-illustration.png',
  'computer-network-support': '/assets/illustrations/cloud-services-illustration.png',
  'photography-videography': '/assets/illustrations/services-illustration.png',
  'training-capacity-building': '/assets/illustrations/services-illustration.png',
  'domain-hosting': '/assets/illustrations/cloud-services-illustration.png',
};

function cataloguePackage(
  description: string,
  price: string,
  priceNote: string | undefined,
  features: string[],
): ServicePackage[] {
  return [
    {
      name: 'Price range',
      price,
      priceNote,
      description,
      features,
    },
  ];
}

export const servicesData: Record<string, ServiceData> = {
  'website-development': {
    id: 'website-development',
    title: 'Website Development',
    shortDescription: 'Design and development of custom websites',
    fullDescription:
      'We design and build custom websites — from brochure sites to full web applications — tailored to your brand and business goals.',
    icon: '💻',
    routeName: 'services.show',
    features: [
      { title: 'Custom design', description: 'Layouts that reflect your brand' },
      { title: 'Responsive', description: 'Works on mobile, tablet, and desktop' },
      { title: 'SEO ready', description: 'Structured for search visibility' },
      { title: 'CMS & integrations', description: 'Easy updates and third-party connections' },
    ],
    benefits: [
      { title: 'Professional presence', description: 'Stand out online with a polished site' },
      { title: 'More leads', description: 'Clear calls-to-action that convert visitors' },
      { title: 'Room to grow', description: 'Built to scale as your business expands' },
    ],
    packages: cataloguePackage(
      'Design and development of custom websites',
      'K 5,000 – 25,000+',
      undefined,
      ['Custom design', 'Responsive layout', 'Contact forms', 'Basic SEO', 'Launch support'],
    ),
    technologies: ['React', 'Laravel', 'WordPress', 'Tailwind CSS', 'MySQL'],
    processSteps: ['Discovery', 'Design', 'Development', 'Launch', 'Support'],
    faq: [
      {
        question: 'How long does a website take?',
        answer: 'Typically 2–8 weeks depending on scope and content readiness.',
      },
      {
        question: 'Do you offer maintenance?',
        answer: 'Yes — we offer ongoing maintenance and support after launch.',
      },
    ],
  },
  'mobile-app-development': {
    id: 'mobile-app-development',
    title: 'Mobile App Development',
    shortDescription: 'Android/iOS app design and development',
    fullDescription:
      'Native and cross-platform mobile apps for Android and iOS — designed for performance, usability, and real business outcomes.',
    icon: '📱',
    routeName: 'services.show',
    features: [
      { title: 'iOS & Android', description: 'Reach users on both major platforms' },
      { title: 'Modern UX', description: 'Intuitive interfaces users enjoy' },
      { title: 'API integrations', description: 'Connect to your backend and services' },
      { title: 'Store submission', description: 'Guidance through app store publishing' },
    ],
    benefits: [
      { title: 'Mobile-first audience', description: 'Meet customers on their devices' },
      { title: 'Higher engagement', description: 'A direct channel to your users' },
      { title: 'Competitive edge', description: 'Stand out with a polished app' },
    ],
    packages: cataloguePackage(
      'Android/iOS app design and development',
      'K 15,000 – 50,000+',
      undefined,
      ['UI/UX design', 'Cross-platform or native build', 'Authentication', 'Push notifications', 'Store submission support'],
    ),
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
    processSteps: ['Strategy', 'Design', 'Development', 'Testing', 'Launch'],
    faq: [
      {
        question: 'Native or cross-platform?',
        answer: 'We recommend cross-platform for most businesses; native when maximum performance is critical.',
      },
      {
        question: 'Do you handle app store submission?',
        answer: 'Yes — we guide you through Apple and Google submission.',
      },
    ],
  },
  'digital-marketing': {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    shortDescription: 'Social media management, SEO, Google Ads, content creation',
    fullDescription:
      'Grow your online presence with social media management, SEO, paid ads, and content that reaches the right audience.',
    icon: '📣',
    routeName: 'services.show',
    features: [
      { title: 'Social media', description: 'Consistent posting and community management' },
      { title: 'SEO', description: 'Improve visibility in search results' },
      { title: 'Google Ads', description: 'Targeted paid campaigns' },
      { title: 'Content creation', description: 'Posts, graphics, and copy that resonates' },
    ],
    benefits: [
      { title: 'More visibility', description: 'Get found by customers searching online' },
      { title: 'Qualified leads', description: 'Reach people interested in your offer' },
      { title: 'Measurable results', description: 'Track performance and refine strategy' },
    ],
    packages: cataloguePackage(
      'Social media management, SEO, Google Ads, content creation',
      'K 2,000 – 10,000',
      '/month',
      ['Social media management', 'SEO optimisation', 'Google Ads setup', 'Content creation', 'Monthly reporting'],
    ),
    technologies: ['Google Ads', 'Meta Business', 'Google Analytics', 'Canva', 'SEMrush'],
    processSteps: ['Audit', 'Strategy', 'Setup', 'Execute', 'Report'],
    faq: [
      {
        question: 'Which platforms do you manage?',
        answer: 'Facebook, Instagram, LinkedIn, X, and others based on where your audience is.',
      },
      {
        question: 'Is ad spend included?',
        answer: 'Our fee covers management; ad budgets are separate and agreed with you upfront.',
      },
    ],
  },
  'graphic-design': {
    id: 'graphic-design',
    title: 'Graphic Design',
    shortDescription: 'Logos, brochures, flyers, banners, branding kits',
    fullDescription:
      'Professional graphic design for logos, marketing materials, banners, and complete branding kits.',
    icon: '🎨',
    routeName: 'services.show',
    features: [
      { title: 'Logo design', description: 'Memorable marks for your brand' },
      { title: 'Print materials', description: 'Brochures, flyers, and business cards' },
      { title: 'Digital assets', description: 'Banners and social media graphics' },
      { title: 'Brand kits', description: 'Consistent colours, fonts, and guidelines' },
    ],
    benefits: [
      { title: 'Stronger brand', description: 'Look professional across every touchpoint' },
      { title: 'Faster turnaround', description: 'Quick delivery for campaigns and events' },
      { title: 'Print-ready files', description: 'Formats ready for printers and digital use' },
    ],
    packages: cataloguePackage(
      'Logos, brochures, flyers, banners, branding kits',
      'K 500 – 5,000',
      undefined,
      ['Logo concepts', 'Brochures & flyers', 'Social banners', 'Brand colour palette', 'Source files'],
    ),
    technologies: ['Adobe Illustrator', 'Photoshop', 'Figma', 'Canva'],
    processSteps: ['Brief', 'Concepts', 'Revisions', 'Delivery'],
    faq: [
      {
        question: 'How many revisions are included?',
        answer: 'Typically 2–3 rounds of revisions depending on the package agreed.',
      },
      {
        question: 'Do I get source files?',
        answer: 'Yes — you receive final files and editable sources where applicable.',
      },
    ],
  },
  'software-solutions': {
    id: 'software-solutions',
    title: 'Software Solutions',
    shortDescription: 'Custom software development (POS, inventory, ERP systems, etc.)',
    fullDescription:
      'Custom software built for your workflows — POS, inventory, ERP, and other business systems that fit how you operate.',
    icon: '⚙️',
    routeName: 'services.show',
    features: [
      { title: 'Custom development', description: 'Software shaped around your processes' },
      { title: 'POS & inventory', description: 'Retail and stock management systems' },
      { title: 'ERP modules', description: 'Finance, HR, projects, and more' },
      { title: 'Integrations', description: 'Connect with payment, SMS, and accounting tools' },
    ],
    benefits: [
      { title: 'Efficiency', description: 'Automate manual work and reduce errors' },
      { title: 'Single source of truth', description: 'One system for your operations' },
      { title: 'Scalable', description: 'Grows with your team and locations' },
    ],
    packages: cataloguePackage(
      'Custom software development (POS, inventory, ERP systems, etc.)',
      'K 10,000 – 100,000+',
      undefined,
      ['Requirements analysis', 'Custom development', 'User training', 'Deployment', 'Ongoing support options'],
    ),
    technologies: ['Laravel', 'React', 'MySQL', 'Redis', 'REST APIs'],
    processSteps: ['Discovery', 'Design', 'Build', 'Test', 'Deploy'],
    faq: [
      {
        question: 'Can you extend our existing ERP?',
        answer: 'Yes — we build on and integrate with platforms like this one.',
      },
      {
        question: 'Do you offer hosting?',
        answer: 'Yes — see Domain & Hosting Services or we can deploy to your infrastructure.',
      },
    ],
  },
  'ict-consultancy': {
    id: 'ict-consultancy',
    title: 'ICT Consultancy',
    shortDescription: 'IT infrastructure setup, audits, networking',
    fullDescription:
      'Expert ICT consultancy — infrastructure setup, IT audits, networking, and technology roadmaps for your organisation.',
    icon: '🏢',
    routeName: 'services.show',
    features: [
      { title: 'Infrastructure setup', description: 'Servers, networks, and workstations' },
      { title: 'IT audits', description: 'Assess security, gaps, and compliance' },
      { title: 'Networking', description: 'LAN/WAN design and implementation' },
      { title: 'Technology planning', description: 'Roadmaps aligned to business goals' },
    ],
    benefits: [
      { title: 'Reduced downtime', description: 'Reliable systems that stay online' },
      { title: 'Better security', description: 'Identify and fix vulnerabilities early' },
      { title: 'Smarter spending', description: 'Invest in the right technology' },
    ],
    packages: cataloguePackage(
      'IT infrastructure setup, audits, networking',
      'K 1,500 – 15,000+',
      undefined,
      ['Infrastructure assessment', 'Network design', 'Security review', 'Implementation plan', 'Documentation'],
    ),
    technologies: ['Windows Server', 'Linux', 'Cisco', 'Ubiquiti', 'VMware'],
    processSteps: ['Assessment', 'Plan', 'Implement', 'Document', 'Handover'],
    faq: [
      {
        question: 'Do you work on-site?',
        answer: 'Yes — we provide on-site support across Lusaka and remote consultancy nationwide.',
      },
      {
        question: 'Can you audit our current setup?',
        answer: 'Yes — IT audits are a core part of our consultancy offering.',
      },
    ],
  },
  'computer-network-support': {
    id: 'computer-network-support',
    title: 'Computer & Network Support',
    shortDescription: 'Troubleshooting, maintenance, installation, and repair services',
    fullDescription:
      'Hands-on computer and network support — troubleshooting, repairs, installations, and preventative maintenance.',
    icon: '🖥️',
    routeName: 'services.show',
    features: [
      { title: 'Troubleshooting', description: 'Diagnose and fix hardware and software issues' },
      { title: 'Maintenance', description: 'Regular check-ups to prevent failures' },
      { title: 'Installation', description: 'Set up PCs, printers, and peripherals' },
      { title: 'Repairs', description: 'Component replacement and system recovery' },
    ],
    benefits: [
      { title: 'Less downtime', description: 'Get back to work quickly' },
      { title: 'Extended hardware life', description: 'Maintenance that saves replacement costs' },
      { title: 'Peace of mind', description: 'A team you can call when things break' },
    ],
    packages: cataloguePackage(
      'Troubleshooting, maintenance, installation, and repair services',
      'K 300 – 5,000',
      undefined,
      ['On-site or remote support', 'Virus removal', 'OS reinstall', 'Network troubleshooting', 'Hardware upgrades'],
    ),
    technologies: ['Windows', 'macOS', 'Linux', 'Office 365', 'Active Directory'],
    processSteps: ['Report issue', 'Diagnose', 'Fix', 'Verify', 'Follow-up'],
    faq: [
      {
        question: 'Do you offer SLA contracts?',
        answer: 'Yes — monthly support contracts are available for businesses.',
      },
      {
        question: 'Can you support multiple branches?',
        answer: 'Yes — we support organisations with multiple locations.',
      },
    ],
  },
  'photography-videography': {
    id: 'photography-videography',
    title: 'Photography & Videography',
    shortDescription: 'Corporate events, product shoots, drone footage, and editing',
    fullDescription:
      'Professional photography and videography for corporate events, products, drone footage, and polished post-production editing.',
    icon: '📷',
    routeName: 'services.show',
    features: [
      { title: 'Corporate events', description: 'Conferences, launches, and ceremonies' },
      { title: 'Product shoots', description: 'E-commerce and marketing imagery' },
      { title: 'Drone footage', description: 'Aerial video and photography' },
      { title: 'Editing', description: 'Colour grading, cuts, and deliverables' },
    ],
    benefits: [
      { title: 'Professional quality', description: 'Content that elevates your brand' },
      { title: 'Versatile formats', description: 'Photos and video for web and print' },
      { title: 'Fast delivery', description: 'Edited assets ready for your campaigns' },
    ],
    packages: cataloguePackage(
      'Corporate events, product shoots, drone footage, and editing',
      'K 1,000 – 15,000',
      '/session',
      ['Event coverage', 'Product photography', 'Drone footage', 'Video editing', 'Digital delivery'],
    ),
    technologies: ['Adobe Premiere', 'Lightroom', 'DaVinci Resolve', 'DJI drones'],
    processSteps: ['Brief', 'Shoot', 'Edit', 'Review', 'Deliver'],
    faq: [
      {
        question: 'How long is a session?',
        answer: 'Sessions vary — half-day, full-day, or custom packages depending on your event.',
      },
      {
        question: 'Do you travel outside Lusaka?',
        answer: 'Yes — travel costs are quoted separately for out-of-town shoots.',
      },
    ],
  },
  'training-capacity-building': {
    id: 'training-capacity-building',
    title: 'Training & Capacity Building',
    shortDescription: 'ICT skills training for institutions and individuals',
    fullDescription:
      'Practical ICT training for teams and individuals — from basic computer skills to specialised software and systems training.',
    icon: '🎓',
    routeName: 'services.show',
    features: [
      { title: 'Corporate training', description: 'Tailored programmes for your staff' },
      { title: 'Individual courses', description: 'Skills development for professionals' },
      { title: 'Hands-on labs', description: 'Learn by doing, not just watching' },
      { title: 'Certificates', description: 'Completion certificates for participants' },
    ],
    benefits: [
      { title: 'Skilled workforce', description: 'Teams that use technology confidently' },
      { title: 'Higher productivity', description: 'Less time lost to basic IT issues' },
      { title: 'Custom curriculum', description: 'Content matched to your tools and goals' },
    ],
    packages: cataloguePackage(
      'ICT skills training for institutions and individuals',
      'K 500 – 10,000+',
      '/session',
      ['Custom curriculum', 'Hands-on exercises', 'Training materials', 'Q&A sessions', 'Certificates of completion'],
    ),
    technologies: ['Microsoft Office', 'Google Workspace', 'Web development basics', 'Cybersecurity awareness'],
    processSteps: ['Needs analysis', 'Curriculum', 'Delivery', 'Assessment', 'Feedback'],
    faq: [
      {
        question: 'On-site or virtual?',
        answer: 'Both — we deliver in-person at your premises or online via video.',
      },
      {
        question: 'Minimum group size?',
        answer: 'We train groups of any size; pricing scales with participants and duration.',
      },
    ],
  },
  'domain-hosting': {
    id: 'domain-hosting',
    title: 'Domain & Hosting Services',
    shortDescription: 'Domain registration, shared/VPS hosting, email setup',
    fullDescription:
      'Domain registration, reliable shared or VPS hosting, and professional email setup for your business.',
    icon: '🌐',
    routeName: 'services.show',
    features: [
      { title: 'Domain registration', description: '.com, .co.zm, and more' },
      { title: 'Shared hosting', description: 'Affordable hosting for small sites' },
      { title: 'VPS hosting', description: 'More power for growing applications' },
      { title: 'Email setup', description: 'Professional addresses on your domain' },
    ],
    benefits: [
      { title: 'Reliable uptime', description: 'Hosting you can depend on' },
      { title: 'Local support', description: 'Zambian team when you need help' },
      { title: 'All-in-one', description: 'Domain, hosting, and email in one place' },
    ],
    packages: cataloguePackage(
      'Domain registration, shared/VPS hosting, email setup',
      'K 600 – 3,000+',
      '/year',
      ['Domain registration', 'SSL certificate', 'Email accounts', 'Backups', 'Technical support'],
    ),
    technologies: ['cPanel', 'LiteSpeed', 'CloudLinux', "Let's Encrypt"],
    processSteps: ['Choose plan', 'Register domain', 'Configure', 'Go live', 'Support'],
    faq: [
      {
        question: 'Can I transfer an existing domain?',
        answer: 'Yes — we help you transfer domains and point them to our hosting.',
      },
      {
        question: 'Is email included?',
        answer: 'Professional email on your domain is included in our hosting packages.',
      },
    ],
  },
};

export const getAllServices = () => Object.values(servicesData);

export const getServiceBySlug = (slug: string) => servicesData[slug] ?? null;

export const getStartingPrice = (service: ServiceData): string => {
  const pkg = service.packages[0];
  if (!pkg) return 'Custom quote';
  return pkg.priceNote ? `${pkg.price}${pkg.priceNote}` : pkg.price;
};
