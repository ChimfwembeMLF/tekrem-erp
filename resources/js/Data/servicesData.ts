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
  routeName: string;
  illustration?: string;
  features: ServiceFeature[];
  benefits: ServiceBenefit[];
  packages: ServicePackage[];
  technologies: string[];
  processSteps: string[];
  faq: Array<{ question: string; answer: string }>;
}

export const serviceIllustrations: Record<string, string> = {
  'web-development': '/assets/illustrations/web-services-illustration.png',
  'mobile-apps': '/assets/illustrations/services-illustration.png',
  'ai-solutions': '/assets/illustrations/services-illustration.png',
  'cloud-services': '/assets/illustrations/cloud-services-illustration.png',
};

export const servicesData: Record<string, ServiceData> = {
  'web-development': {
    id: 'web-development',
    title: 'Web Development',
    shortDescription: 'Custom websites and web applications',
    fullDescription:
      'We create modern, responsive, and scalable web solutions tailored to your business needs — from marketing sites to full web applications.',
    icon: '💻',
    routeName: 'services.web-development',
    features: [
      { title: 'Responsive Design', description: 'Mobile-first layouts that work on every device' },
      { title: 'Modern Stack', description: 'React, Laravel, and proven frameworks' },
      { title: 'SEO Ready', description: 'Structured for search visibility from day one' },
      { title: 'Fast Performance', description: 'Optimized assets, caching, and clean architecture' },
    ],
    benefits: [
      { title: 'Stronger Online Presence', description: 'A professional site that represents your brand' },
      { title: 'Better Conversions', description: 'Clear UX that turns visitors into customers' },
      { title: 'Room to Grow', description: 'Built to scale as your business expands' },
    ],
    packages: [
      {
        name: 'Starter',
        price: 'K 75,000',
        description: 'For small businesses and startups',
        features: ['Up to 5 pages', 'Responsive design', 'Contact form', 'Basic SEO', '3 months support'],
      },
      {
        name: 'Professional',
        price: 'K 150,000',
        description: 'For growing businesses',
        features: [
          'Up to 15 pages',
          'Custom design',
          'CMS integration',
          'Advanced SEO',
          'E-commerce ready',
          '6 months support',
        ],
        popular: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom quote',
        description: 'For complex or large-scale projects',
        features: [
          'Unlimited pages',
          'Custom functionality',
          'API integrations',
          'Advanced security',
          'Performance tuning',
          '12 months support',
        ],
      },
    ],
    technologies: ['React', 'Laravel', 'TypeScript', 'Tailwind CSS', 'MySQL', 'Redis'],
    processSteps: ['Discovery', 'Design', 'Development', 'Launch', 'Support'],
    faq: [
      {
        question: 'How long does a website take?',
        answer: 'Typically 4–12 weeks depending on scope and content readiness.',
      },
      {
        question: 'Do you offer maintenance?',
        answer: 'Yes — we offer ongoing maintenance and support packages.',
      },
    ],
  },
  'mobile-apps': {
    id: 'mobile-apps',
    title: 'Mobile Apps',
    shortDescription: 'Native and cross-platform mobile solutions',
    fullDescription:
      'High-performance mobile apps for iOS and Android — native or cross-platform — designed for real users and real business outcomes.',
    icon: '📱',
    routeName: 'services.mobile-apps',
    features: [
      { title: 'Cross-Platform', description: 'One codebase for iOS and Android where it makes sense' },
      { title: 'Native Performance', description: 'Smooth, responsive experiences' },
      { title: 'Offline Support', description: 'Core flows that work without connectivity' },
      { title: 'Push Notifications', description: 'Re-engage users with timely updates' },
    ],
    benefits: [
      { title: 'Reach More Customers', description: 'Meet users on the devices they use daily' },
      { title: 'Higher Engagement', description: 'A direct channel to your audience' },
      { title: 'Competitive Edge', description: 'Stand out with a polished mobile product' },
    ],
    packages: [
      {
        name: 'Basic App',
        price: 'K 225,000',
        description: 'Core functionality for MVPs',
        features: ['Cross-platform build', 'UI/UX design', 'Authentication', 'Push notifications', 'Store submission'],
      },
      {
        name: 'Advanced App',
        price: 'K 400,000',
        description: 'Feature-rich apps with integrations',
        features: [
          'Custom design',
          'API integrations',
          'Offline mode',
          'In-app purchases',
          'Analytics',
          'Admin dashboard',
        ],
        popular: true,
      },
      {
        name: 'Enterprise App',
        price: 'Custom quote',
        description: 'Complex apps with enterprise requirements',
        features: [
          'Advanced security',
          'Multi-language',
          'Custom backend',
          'Third-party integrations',
          'Performance optimization',
          'Ongoing maintenance',
        ],
      },
    ],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Node.js'],
    processSteps: ['Strategy', 'Design', 'Development', 'Store Launch', 'Iteration'],
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
  'ai-solutions': {
    id: 'ai-solutions',
    title: 'AI Solutions',
    shortDescription: 'Intelligent automation and data analysis',
    fullDescription:
      'Practical AI — chatbots, automation, and analytics — built around your data and workflows, not hype.',
    icon: '🤖',
    routeName: 'services.ai-solutions',
    features: [
      { title: 'Custom Models', description: 'ML tailored to your data and use cases' },
      { title: 'NLP & Chatbots', description: 'Support and sales assistants grounded in your content' },
      { title: 'Automation', description: 'Reduce manual work with smart workflows' },
      { title: 'Analytics', description: 'Forecast trends and surface actionable insights' },
    ],
    benefits: [
      { title: 'Higher Efficiency', description: 'Automate repetitive tasks' },
      { title: 'Smarter Decisions', description: 'Data-backed recommendations' },
      { title: 'Better CX', description: '24/7 intelligent assistance for customers' },
    ],
    packages: [
      {
        name: 'AI Starter',
        price: 'K 325,000',
        description: 'First AI use cases for SMEs',
        features: ['Chatbot', 'Basic analytics', 'Simple automation', 'Integration support', '3 months training'],
      },
      {
        name: 'AI Professional',
        price: 'K 650,000',
        description: 'Advanced AI for growing teams',
        features: [
          'Custom ML models',
          'Advanced analytics',
          'Process automation',
          'API integrations',
          'Monitoring',
          '6 months support',
        ],
        popular: true,
      },
      {
        name: 'AI Enterprise',
        price: 'Custom quote',
        description: 'Full AI transformation programs',
        features: [
          'AI strategy',
          'Multiple models',
          'Enterprise integrations',
          'Custom training',
          'Optimization',
          'Dedicated support',
        ],
      },
    ],
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'OpenAI', 'Mistral AI', 'AWS'],
    processSteps: ['Assessment', 'Data Prep', 'Build', 'Validate', 'Deploy'],
    faq: [
      {
        question: 'What data do I need?',
        answer: 'It depends on the use case — we assess readiness in discovery.',
      },
      {
        question: 'Can AI plug into our ERP?',
        answer: 'Yes — we integrate with existing systems including this platform.',
      },
    ],
  },
  'cloud-services': {
    id: 'cloud-services',
    title: 'Cloud Services',
    shortDescription: 'Scalable and secure cloud infrastructure',
    fullDescription:
      'Migrate, host, and operate on cloud infrastructure that scales with demand — secure, monitored, and cost-aware.',
    icon: '☁️',
    routeName: 'services.cloud-services',
    features: [
      { title: 'Cloud Migration', description: 'Move legacy systems with minimal downtime' },
      { title: 'Auto Scaling', description: 'Resources that grow and shrink with traffic' },
      { title: 'Security', description: 'Hardening, backups, and compliance-aware setup' },
      { title: 'Monitoring', description: 'Proactive alerts and performance visibility' },
    ],
    benefits: [
      { title: 'Lower Costs', description: 'Pay for what you use' },
      { title: 'Reliability', description: 'HA and disaster recovery options' },
      { title: 'Peace of Mind', description: 'Managed operations and support' },
    ],
    packages: [
      {
        name: 'Cloud Starter',
        price: 'K 25,000',
        priceNote: '/month',
        description: 'Essential cloud for small teams',
        features: ['Migration assessment', 'Basic setup', 'Security baseline', 'Monthly monitoring', 'Email support'],
      },
      {
        name: 'Cloud Professional',
        price: 'K 75,000',
        priceNote: '/month',
        description: 'Production-grade cloud operations',
        features: [
          'Full migration',
          'Auto-scaling',
          'Advanced monitoring',
          'Backup & DR',
          'Priority support',
          'Optimization',
        ],
        popular: true,
      },
      {
        name: 'Cloud Enterprise',
        price: 'Custom quote',
        description: 'Multi-cloud and enterprise SLAs',
        features: [
          'Multi-cloud strategy',
          'Custom architecture',
          'Advanced security',
          'Compliance',
          'Dedicated team',
          'SLA guarantees',
        ],
      },
    ],
    technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
    processSteps: ['Assessment', 'Plan', 'Setup', 'Migrate', 'Optimize'],
    faq: [
      {
        question: 'Which cloud provider?',
        answer: 'We help you choose based on workload, budget, and compliance needs.',
      },
      {
        question: 'How long is migration?',
        answer: 'Usually 2–8 weeks depending on complexity.',
      },
    ],
  },
};

export const getAllServices = () => Object.values(servicesData);

export const getServiceBySlug = (slug: string) => servicesData[slug] ?? null;

export const getStartingPrice = (service: ServiceData): string => {
  const starter = service.packages[0];
  if (!starter) return 'Custom quote';
  return starter.priceNote ? `${starter.price}${starter.priceNote}` : starter.price;
};
