import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import portfolioIllustration from '../../../../public/assets/illustrations/portfolio-illustration.png';

// Define project categories
const categories = [
  { id: 'all', name: 'All Projects' },
  { id: 'web', name: 'Web Development' },
  { id: 'mobile', name: 'Mobile Apps' },
  { id: 'desktop', name: 'Desktop Software' },
  { id: 'ai', name: 'AI Solutions' },
];

// Define projects
type Project = {
  id: number;
  title: string;
  category: string;
  image: string;
  client: string;
  year: string;
  description: string;
  technologies: string[];
  outcome: string;
};

const projects: Project[] = [
  {
    id: 1,
    title: 'Zambia Bank Online Banking Platform',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    client: 'Zambia Bank',
    year: '2023',
    description: 'A comprehensive online banking platform that allows customers to manage accounts, transfer funds, pay bills, and apply for loans online. The platform includes a responsive web interface and admin dashboard.',
    technologies: ['React', 'Laravel', 'MySQL', 'Tailwind CSS'],
    outcome: 'Increased online transactions by 40% and reduced customer service calls by 25%.'
  },
  {
    id: 2,
    title: 'Lusaka Retail Inventory Management System',
    category: 'desktop',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    client: 'Lusaka Retail',
    year: '2022',
    description: 'A desktop application for inventory management, point of sale, and reporting. The system includes barcode scanning, stock alerts, and sales analytics.',
    technologies: ['Electron', 'React', 'Node.js', 'SQLite'],
    outcome: 'Reduced stockouts by 60% and improved inventory turnover by 35%.'
  },
  {
    id: 3,
    title: 'Zambia Healthcare Patient Portal',
    category: 'mobile',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    client: 'Zambia Healthcare',
    year: '2023',
    description: 'A mobile application that allows patients to book appointments, view medical records, receive test results, and communicate with healthcare providers.',
    technologies: ['React Native', 'Firebase', 'Node.js'],
    outcome: 'Reduced appointment no-shows by 45% and improved patient satisfaction scores by 30%.'
  },
  {
    id: 4,
    title: 'Copperbelt Mining Equipment Monitoring System',
    category: 'ai',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df7d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    client: 'Copperbelt Mining',
    year: '2024',
    description: 'An AI-powered system that monitors mining equipment to predict maintenance needs and prevent failures. The system uses sensors and machine learning to analyze equipment performance.',
    technologies: ['Python', 'TensorFlow', 'AWS IoT', 'React'],
    outcome: 'Reduced equipment downtime by 35% and maintenance costs by 20%.'
  },
  {
    id: 5,
    title: 'Zambia Tourism Mobile Guide',
    category: 'mobile',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80',
    client: 'Zambia Tourism Board',
    year: '2022',
    description: 'A mobile app that serves as a comprehensive guide for tourists visiting Zambia. The app includes information about attractions, accommodations, transportation, and local customs.',
    technologies: ['Flutter', 'Firebase', 'Google Maps API'],
    outcome: 'Downloaded by over 50,000 tourists, contributing to a 15% increase in tourism engagement.'
  },
  {
    id: 6,
    title: 'Lusaka University E-Learning Platform',
    category: 'web',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80',
    client: 'Lusaka University',
    year: '2023',
    description: 'A comprehensive e-learning platform that allows students to access course materials, submit assignments, take quizzes, and interact with instructors and peers.',
    technologies: ['Laravel', 'Vue.js', 'MySQL', 'WebRTC'],
    outcome: 'Enabled remote learning for 15,000+ students during the pandemic, with 95% course completion rate.'
  },
];

export default function Portfolio() {
  const route = useRoute();
  const page = useTypedPage();
  const settings: any = page.props.settings || {};

  // State for filtering projects
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects based on active category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <GuestLayout title="Portfolio">
      <Head title="Portfolio" />

      {/* Modern Hero Section with Animated Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="lg:col-span-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 text-sm font-medium text-blue-800 dark:text-blue-300 mb-8">
                <span className="mr-2">📁</span>
                Our Work
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">Portfolio</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Real Results, Real Impact
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Explore our recent projects and see how we've helped businesses across various industries leverage technology to achieve their goals.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={route('contact')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Start Your Project
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={route('services')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Services
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by leading companies</p>
                <div className="flex items-center space-x-6 opacity-60">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">Zambia Bank</div>
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">MTN Zambia</div>
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">Airtel</div>
                </div>
              </div>
            </div>

            {/* Hero Image or Icon */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-500"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center">
                  <div className="h-96 w-full">
                    <img src={portfolioIllustration} alt='Portfolio illustration' />
                  </div>
                  <blockquote className="text-xl font-medium text-gray-900 dark:text-white mb-4 text-center">
                    "We deliver results that matter."
                  </blockquote>
                  <cite className="text-blue-600 font-semibold">
                    {settings.company_name || 'TekRem'}
                  </cite>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs and Projects Grid */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="px-4 py-2 rounded-md text-sm font-medium">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-4">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {(category.id === 'all' ? projects : projects.filter(project => project.category === category.id)).map((project) => (
                    <Card key={project.id} className="group cursor-pointer hover:shadow-2xl transition-shadow duration-300" onClick={() => setSelectedProject(project)}>
                      <CardHeader className='p-0'>
                        <div className="relative h-48 w-full overflow-hidden rounded-t-xl mb-4">
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-11o"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60 rounded-t-xl"></div>
                          <div className="absolute bottom-0 left-0 p-4">
                            <span className="inline-block bg-blue-600 rounded-full px-3 py-1 text-xs font-semibold text-white mb-2">
                              {categories.find(cat => cat.id === project.category)?.name}
                            </span>
                            <CardTitle className="text-white text-lg font-bold">{project.title}</CardTitle>
                            <CardDescription className="text-gray-300 text-sm">{project.client} • {project.year}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                          {project.description}
                        </p>
                        <button 
                          className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          onClick={() => setSelectedProject(project)}
                        >
                          View Details →
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedProject(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 dark:text-white" id="modal-title">
                        {selectedProject.title}
                      </h3>
                      <button 
                        type="button" 
                        className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setSelectedProject(null)}
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-4">
                      <img 
                        src={selectedProject.image} 
                        alt={selectedProject.title} 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Project Details</h4>
                        <div className="mt-2 space-y-3">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Client:</span> {selectedProject.client}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Year:</span> {selectedProject.year}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {categories.find(cat => cat.id === selectedProject.category)?.name}
                          </p>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Technologies:</span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {selectedProject.technologies.map((tech, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Description</h4>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {selectedProject.description}
                        </p>
                        <h4 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Outcome</h4>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {selectedProject.outcome}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>
                <Link
                  href={route('contact')}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start your project?</span>
            <span className="block text-blue-200">Let's discuss how we can help you achieve your goals.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href={route('contact')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
