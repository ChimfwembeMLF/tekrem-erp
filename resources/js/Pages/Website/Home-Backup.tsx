import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import OrgChart from '@/Components/OrgChart';
import PartnerSection from '@/Components/PartnerSection';
import HeroImage from '../../../../public/hero-illustration.png'
import TechnologiesSection from '@/Components/TechnologiesSection';



interface Props {
  canLogin: boolean;
  canRegister: boolean;
}

export default function Home({ canLogin, canRegister }: Props) {
  const route = useRoute();
  const page = useTypedPage();
  const settings: any = page.props.settings || {};

  // Testimonials Carousel State
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Team Carousel State
  const [currentTeamMember, setCurrentTeamMember] = useState(0);
  const testimonials = [
    {
      id: 1,
      company: "Zambia Bank",
      industry: "Financial Services",
      logo: "ZB",
      gradient: "from-blue-500 to-blue-600",
      color: "blue",
      rating: 5,
      quote: "TekRem transformed our entire digital banking infrastructure. The new platform resulted in a 40% increase in online transactions, dramatically improved customer satisfaction scores, and positioned us as a leader in digital financial services across Zambia.",
      author: "Michael Banda",
      position: "IT Director",
      metrics: [
        { label: "Increase in Transactions", value: "40%" },
        { label: "Customer Satisfaction", value: "95%" },
        { label: "Reduced Processing Time", value: "60%" }
      ],
      featured: true
    },
    {
      id: 2,
      company: "Lusaka Retail",
      industry: "Retail Chain",
      logo: "LR",
      gradient: "from-green-500 to-emerald-600",
      color: "green",
      rating: 5,
      quote: "The inventory management system has streamlined our operations and reduced stockouts by 60%. Professional team, delivered on time and exceeded our expectations.",
      author: "Grace Mulenga",
      position: "Operations Manager",
      metrics: [
        { label: "Reduced Stockouts", value: "60%" },
        { label: "Efficiency Gain", value: "45%" },
        { label: "Cost Savings", value: "30%" }
      ]
    },
    {
      id: 3,
      company: "Zambia Healthcare",
      industry: "Healthcare Provider",
      logo: "ZH",
      gradient: "from-purple-500 to-violet-600",
      color: "purple",
      rating: 5,
      quote: "The patient management system revolutionized our care delivery. The mobile app for patients has been particularly well-received by our community and improved patient engagement significantly.",
      author: "Dr. James Tembo",
      position: "Chief Medical Officer",
      metrics: [
        { label: "Patient Engagement", value: "80%" },
        { label: "Appointment Efficiency", value: "65%" },
        { label: "Patient Satisfaction", value: "92%" }
      ]
    },
    {
      id: 4,
      company: "Mining Enterprise",
      industry: "Mining Industry",
      logo: "ME",
      gradient: "from-orange-500 to-red-600",
      color: "orange",
      rating: 5,
      quote: "TekRem's IoT monitoring system improved our operational efficiency by 45% and significantly enhanced workplace safety protocols. The real-time data analytics have been game-changing.",
      author: "Sarah Phiri",
      position: "Operations Director",
      metrics: [
        { label: "Operational Efficiency", value: "45%" },
        { label: "Safety Incidents Reduced", value: "70%" },
        { label: "Cost Optimization", value: "35%" }
      ]
    },
    {
      id: 5,
      company: "AgriTech Solutions",
      industry: "Agriculture Technology",
      logo: "AS",
      gradient: "from-emerald-500 to-green-600",
      color: "emerald",
      rating: 5,
      quote: "The farm management platform developed by TekRem has revolutionized how we track crop yields and manage resources. Our productivity has increased by 55% in just one growing season.",
      author: "Joseph Mwanza",
      position: "Farm Operations Manager",
      metrics: [
        { label: "Productivity Increase", value: "55%" },
        { label: "Resource Optimization", value: "40%" },
        { label: "Yield Improvement", value: "35%" }
      ]
    }
  ];

  // Blog Carousel State
  const [currentBlog, setCurrentBlog] = useState(0);
  const blogPosts = [
    {
      id: 1,
      title: "The Future of AI in Business Applications",
      excerpt: "Explore how artificial intelligence is transforming business operations, enhancing customer experiences, and creating new opportunities for growth across industries.",
      category: "AI & Technology",
      categoryColor: "blue",
      date: "October 15, 2025",
      author: {
        name: "Chimfwembe Kangwa",
        role: "CTO & Lead Developer",
        avatar: "CK"
      },
      gradient: "from-blue-500 to-purple-600",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      featured: true
    },
    {
      id: 2,
      title: "Cybersecurity Best Practices for SMEs",
      excerpt: "Essential security measures that small and medium enterprises should implement to protect their digital assets and maintain customer trust.",
      category: "Security",
      categoryColor: "green",
      date: "October 10, 2025",
      author: {
        name: "Joseph Banda",
        role: "Security Specialist",
        avatar: "JB"
      },
      gradient: "from-green-500 to-emerald-600",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    },
    {
      id: 3,
      title: "Digital Transformation in Zambia's Financial Sector",
      excerpt: "How local financial institutions are leveraging technology to improve services and reach more customers across urban and rural areas.",
      category: "Digital Transformation",
      categoryColor: "purple",
      date: "October 5, 2025",
      author: {
        name: "Fackson Kangwa",
        role: "UI/UX Designer",
        avatar: "FK"
      },
      gradient: "from-purple-500 to-pink-600",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    },
    {
      id: 4,
      title: "Cloud Migration Strategies for African Businesses",
      excerpt: "A comprehensive guide to successfully migrating your business operations to the cloud while considering local infrastructure and regulatory requirements.",
      category: "Cloud Computing",
      categoryColor: "orange",
      date: "September 28, 2025",
      author: {
        name: "Joel Chamana",
        role: "Cloud Architect",
        avatar: "JC"
      },
      gradient: "from-orange-500 to-red-600",
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
    },
    {
      id: 5,
      title: "Building Mobile Apps for the African Market",
      excerpt: "Key considerations for developing mobile applications that work well in African markets, including offline capabilities and data optimization.",
      category: "Mobile Development",
      categoryColor: "cyan",
      date: "September 20, 2025",
      author: {
        name: "Temwani Tembo",
        role: "Mobile Developer",
        avatar: "TT"
      },
      gradient: "from-cyan-500 to-blue-600",
      icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
    }
  ];

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  // Auto-advance blog posts
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBlog((prev) => (prev + 1) % blogPosts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [blogPosts.length]);

  // Auto-advance team members
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTeamMember((prev) => (prev + 1) % orgData.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextBlog = () => {
    setCurrentBlog((prev) => (prev + 1) % blogPosts.length);
  };

  const prevBlog = () => {
    setCurrentBlog((prev) => (prev - 1 + blogPosts.length) % blogPosts.length);
  };

  const orgData = [
    {
      name: "Chimfwembe Kangwa",
      initials: "CK",
      role: "CTO / Developer",
      bio: "Passionate about scalable systems and modern development practices.",
      color: "from-teal-500 to-cyan-600",
      image: "/assets/team/chimfwembe-kangwa.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://chimfwembe-kangwa.vercel.app/" },
      ],
    },
    {
      name: "Joseph Banda",
      initials: "JB",
      role: "Operations Manager / Developer",
      bio: "Focused on process optimization and reliable software delivery.",
      color: "from-emerald-500 to-green-600",
      image: "/assets/team/joseph-H-banda.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://josephbanda.com" },
      ],
    },
    {
      name: "Fackson Kangwa",
      initials: "FK",
      role: "UI/UX Designer / Developer",
      bio: "Designing intuitive user experiences and modern interfaces.",
      color: "from-indigo-500 to-violet-600",
      image: "/assets/team/fackson-kangwa.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "https://github.com/Kangwajr" },
        { platform: "website", url: "https://kangwafackson.vercel.app" },
      ],
    },
    {
      name: "Joel B. Chamana",
      initials: "JB.C",
      role: "Marketing Manager / Finance",
      bio: "Blending finance knowledge with creative marketing strategies.",
      color: "from-pink-500 to-rose-600",
      image: "/assets/team/joel-B-chamana.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://joelchamanab.com" },
      ],
    },
    {
      name: "Joseph Banda",
      initials: "JB",
      role: "Sales Representative / Finance",
      bio: "Driving growth through client relationships and financial insight.",
      color: "from-yellow-500 to-orange-600",
      image: "/assets/team/joseph-L-banda.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://josephbanda.com" },
      ],
    },
    {
      name: "Temwani Tembo",
      initials: "TT",
      role: "Project Manager",
      bio: "Ensuring projects are delivered on time with high quality.",
      color: "from-fuchsia-500 to-purple-600",
      image: "/assets/team/temwani-tembo.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://temwanitembo.com" },
      ],
    },
    {
      name: "Sevier Banda",
      initials: "SB",
      role: "Creative / Graphic Designer",
      bio: "Crafting unique visuals and brand identities that stand out.",
      color: "from-sky-500 to-primary",
      image: "/assets/team/savior-banda.png",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://www.footprintsgraphixx.com" },
      ],
    },
  ];

  return (
    <GuestLayout title="Home">
      <Head title="Home" />

      {/* Modern Hero Section with Gradient Background */}
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
                <span className="mr-2">🚀</span>
                Trusted by 100+ companies across Africa
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">Technology Solutions for</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Modern Businesses
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                {settings.company_name || 'Technology Remedies Innovations'} provides cutting-edge technology solutions to help businesses in Zambia and beyond thrive in the digital age.
              </p>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 Support
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  99.9% Uptime
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Secure & Compliant
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Scalable Solutions
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={route('services')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started Today
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={route('contact')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule Demo
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

            {/* Hero Image */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-500"></div>
                
                <div className="relative">
                  <img
                    src={HeroImage}
                    alt="Team working on software development"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section with Modern Design */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gray-800/20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-300 font-semibold tracking-wide uppercase mb-4">Our Impact</h2>
            <p className="text-4xl md:text-5xl font-bold text-white mb-6">
              Delivering Results That Matter
            </p>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Trusted by organizations across Africa to transform their digital landscape
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">
                  100+
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Clients Served</div>
              <div className="text-sm text-gray-300">Across 15+ countries</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text mb-2">
                  250+
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Projects Completed</div>
              <div className="text-sm text-gray-300">With 100% success rate</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                  10+
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Years Experience</div>
              <div className="text-sm text-gray-300">Industry expertise</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text mb-2">
                  98%
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Client Satisfaction</div>
              <div className="text-sm text-gray-300">Rated satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">Our Services</h2>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Comprehensive Technology Solutions
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From web development to AI solutions, we provide end-to-end technology services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Web Development */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Web Development</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Custom websites and web applications tailored to your business needs, from simple brochure sites to complex enterprise platforms.</p>
                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Mobile Apps */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mobile Apps</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Native and cross-platform mobile applications for iOS and Android that help you reach customers wherever they are.</p>
                <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Solutions */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-violet-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Solutions</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Leverage the power of artificial intelligence to automate processes, enhance customer experiences, and gain competitive advantages.</p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cloud Infrastructure */}
            <div className="group relative bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-sky-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cloud Infrastructure</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Scalable cloud solutions that grow with your business, ensuring reliability, security, and optimal performance.</p>
                <div className="flex items-center text-cyan-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Data Analytics */}
            <div className="group relative bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Turn your data into actionable insights with our analytics solutions, helping you make informed business decisions.</p>
                <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Cybersecurity */}
            <div className="group relative bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cybersecurity</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Protect your digital assets with comprehensive security solutions designed to keep your business safe from threats.</p>
                <div className="flex items-center text-red-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              href={route('services')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Services
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 dark:bg-secondary/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to build your business
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              Our comprehensive suite of technology solutions helps you streamline operations, enhance customer experiences, and drive growth.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Web Development</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Custom websites and web applications tailored to your business needs, from simple brochure sites to complex enterprise platforms.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Mobile App Development</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Native and cross-platform mobile applications for iOS and Android that help you reach customers wherever they are.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Data Analytics</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Turn your data into actionable insights with our analytics solutions, helping you make informed business decisions.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">AI Solutions</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Leverage the power of artificial intelligence to automate processes, enhance customer experiences, and gain competitive advantages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Why Choose Us Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">Why Choose Us</h2>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Your Trusted Technology Partner
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We combine technical expertise with business acumen to deliver solutions that drive real results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Proven Expertise */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Proven Expertise</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Our team brings years of experience across various industries and technologies, ensuring high-quality solutions that exceed expectations.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span className="mr-2">10+ Years</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Innovative Solutions */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Innovative Solutions</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  We stay at the forefront of technology trends to deliver cutting-edge solutions that give you a competitive edge.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  <span className="mr-2">Latest Tech</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Client-Focused Approach */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Client-Focused Approach</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  We prioritize understanding your business needs and goals to deliver tailored solutions that drive real value.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <span className="mr-2">98% Satisfaction</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-[98%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Benefits Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">ISO</div>
              <div className="text-gray-600 dark:text-gray-400">Certified Security</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100+</div>
              <div className="text-gray-600 dark:text-gray-400">Happy Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section - Like Reference Image */}
      <section className="relative h-screen min-h-[600px] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {/* Large Background Image with Blur */}
        <div className="absolute inset-0">
          {orgData[currentTeamMember]?.image ? (
            <img
              src={orgData[currentTeamMember].image}
              alt={orgData[currentTeamMember].name}
              className="w-full h-full object-cover object-center"
              style={{ 
                filter: 'grayscale(100%) blur(8px) brightness(0.3)',
                transform: 'scale(1.1)' 
              }}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${orgData[currentTeamMember]?.color} opacity-20 blur-sm`}></div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content Container */}
        <div className="relative h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            
            {/* Top Left - Team Members Label */}
            <div className="absolute top-8 left-8">
              <h2 className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                Team members
              </h2>
            </div>

            {/* Center - Main Team Member Card */}
            <div className="flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl max-w-lg w-full mx-4 relative">
                {/* Team Member Photo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    {orgData[currentTeamMember]?.image ? (
                      <img
                        src={orgData[currentTeamMember].image}
                        alt={orgData[currentTeamMember].name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${orgData[currentTeamMember]?.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-2xl">
                          {orgData[currentTeamMember]?.initials}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Member Info */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {orgData[currentTeamMember]?.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                    {orgData[currentTeamMember]?.role}
                  </p>
                  
                  {/* Star Rating */}
                  <div className="flex justify-center items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  {/* Bio Description */}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {orgData[currentTeamMember]?.bio} Our team member brings exceptional skills and 
                    dedication to every project, ensuring high-quality results and innovative solutions.
                  </p>

                  {/* Connect Button */}
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200">
                    Connect
                  </button>
                </div>
              </div>
            </div>

            {/* Circular Team Member Thumbnails - Positioned Around */}
            <div className="absolute inset-0 pointer-events-none">
              {orgData.map((member, index) => {
                if (index === currentTeamMember) return null;
                
                // Position thumbnails around the screen
                const positions = [
                  { top: '15%', left: '8%' },    // Top-left
                  { top: '15%', right: '8%' },   // Top-right  
                  { top: '45%', left: '2%' },    // Middle-left
                  { top: '45%', right: '2%' },   // Middle-right
                  { bottom: '15%', left: '8%' }, // Bottom-left
                  { bottom: '15%', right: '8%' }, // Bottom-right
                ];
                
                const position = positions[index > currentTeamMember ? index - 1 : index];
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentTeamMember(index)}
                    className="absolute pointer-events-auto group"
                    style={position}
                  >
                    <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
                      index === currentTeamMember ? 'ring-4 ring-blue-400' : ''
                    }`}>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">
                            {member.initials}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Modern Testimonials Carousel Section */}
            {orgData.map((member, index) => (
              <div key={index} className="group relative">
                {/* Main Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  {/* Background Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                  
                  {/* Profile Image */}
                  <div className="relative mb-6">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-2xl transform group-hover:scale-110 transition-transform duration-500 shadow-lg`}></div>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="relative w-full h-full object-cover rounded-2xl border-4 border-white dark:border-gray-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`relative w-full h-full bg-gradient-to-br ${member.color} rounded-2xl flex items-center justify-center border-4 border-white dark:border-gray-700 ${member.image ? 'hidden' : 'flex'}`}>
                        <span className="text-white font-bold text-xl">{member.initials}</span>
                      </div>
                    </div>
                    
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-3">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                      {member.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center justify-center space-x-3">
                      {member.socials?.map((social, socialIndex) => (
                        <a
                          key={socialIndex}
                          href={social.url}
                          className={`w-10 h-10 bg-gradient-to-br ${member.color} rounded-xl flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.platform === 'linkedin' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          )}
                          {social.platform === 'github' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          )}
                          {social.platform === 'website' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Hover Card Extension */}
                  <div className="absolute inset-x-0 -bottom-2 h-2 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Learn More About Us
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                Join Our Team
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>
     
      {/* Modern Testimonials Carousel Section */}
      <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 text-sm font-medium text-blue-800 dark:text-blue-300 mb-6">
              <span className="mr-2">💬</span>
              Client Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients about their transformational journey with us
            </p>
            
            {/* Carousel Controls */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <button
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-10 mx-4 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 dark:border-gray-700/50">
                      <div className={`absolute inset-0 bg-gradient-to-br from-${testimonial.color}-600/5 to-${testimonial.color}-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      {/* Quote Icon */}
                      <div className="relative mb-8">
                        <div className={`w-16 h-16 bg-gradient-to-br ${testimonial.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                          </svg>
                        </div>
                      </div>

                      {/* Testimonial Content */}
                      <blockquote className="relative text-2xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Client Info */}
                      <div className="flex items-center mb-8">
                        <div className="relative">
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold text-2xl">{testimonial.logo}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-6">
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{testimonial.company}</h4>
                          <p className={`text-${testimonial.color}-600 dark:text-${testimonial.color}-400 font-semibold text-lg`}>{testimonial.industry}</p>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{testimonial.author} • {testimonial.position}</p>
                          <div className="flex mt-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Results Metrics */}
                      {testimonial.metrics && (
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          {testimonial.metrics.map((metric, metricIndex) => (
                            <div key={metricIndex} className="text-center">
                              <div className={`text-3xl font-bold text-${testimonial.color}-600 mb-1`}>{metric.value}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 mb-8">
              <div className="flex items-center space-x-6 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100+ Satisfied Clients
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  98% Success Rate
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  5 Star Average Rating
                </div>
              </div>
            </div>
            
            <Link
              href={route('contact')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Your Success Story
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Creative Technology Stack Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-sm font-medium text-blue-300 mb-6 backdrop-blur border border-blue-500/20">
              <span className="mr-2">⚡</span>
              Powered by Industry Leaders
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Technology Stack
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We leverage cutting-edge technologies to build robust, scalable, and secure solutions
            </p>
          </div>

          {/* Technology Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            {/* React */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.95-1.44C13.17 9 12.6 9 12 9s-1.17 0-1.67.06c-.33.44-.65.91-.95 1.44l-.81 1.5.81 1.5c.3.53.62 1 .95 1.44.5.06 1.07.06 1.67.06s1.17 0 1.67-.06c.33-.44.65-.91.95-1.44M16.63 4c-.63-.38-2.01.2-3.6 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.31-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.37 1.95-1.47-.84-1.63-3.05-1.01-5.63C2.17 14.93.34 13.69.34 12s1.83-2.93 4.37-3.68C4.09 5.74 4.25 3.53 5.72 2.69 7.18 1.85 9.17 2.81 11.09 4.64c1.92-1.83 3.91-2.79 5.37-1.95"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">React</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Frontend Framework</p>
            </div>

            {/* Laravel */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.642 5.43a.364.364 0 01.014.1v5.149c0 .135-.073.26-.189.326l-4.323 2.49v4.934a.378.378 0 01-.188.326L9.93 23.949a.316.316 0 01-.066.027c-.008.002-.016.008-.024.01a.348.348 0 01-.192 0c-.011-.002-.02-.008-.03-.012-.02-.008-.042-.014-.062-.025L.533 18.755a.376.376 0 01-.189-.326V2.974c0-.033.005-.066.014-.098.003-.012.01-.02.014-.032a.369.369 0 01.023-.058c.004-.013.015-.022.023-.033l.033-.045c.012-.01.025-.018.037-.027.014-.012.027-.024.041-.034H.53L5.043.05a.375.375 0 01.375 0L9.93 2.647h.002c.015.01.027.021.04.033.012.009.025.018.036.027.014.011.026.023.037.036.05.047.082.108.095.175.003.013.01.025.013.039.005.030.01.061.01.093v9.652l3.618-2.09V4.465c0-.033.004-.066.013-.097.003-.013.01-.025.015-.036.006-.02.014-.04.023-.058.007-.013.015-.021.025-.033.007-.013.018-.025.025-.036.013-.014.024-.027.038-.039.013-.01.026-.02.041-.03h.001l4.513-2.598a.375.375 0 01.375 0l4.513 2.598c.016.01.031.021.044.032.012.009.023.019.034.03.01.011.021.024.028.036.010.014.019.027.027.041.006.015.014.029.018.045.007.017.01.035.013.054.002.014.006.027.006.041z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">Laravel</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Backend Framework</p>
            </div>

            {/* Node.js */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.080-0.383 c0.585-0.203,0.703-0.250,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.990,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.511,0.256-0.511h1.116c0.139,0,0.255,0.112,0.255,0.256v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.conjugated-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.256 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">Node.js</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Runtime Environment</p>
            </div>

            {/* AWS */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.763 10.036c0 .296.032.535.088.719.064.184.144.336.256.456.112.12.248.2.408.256.16.048.336.080.528.080.8 0 1.415-.624 1.415-1.511v-.447c0-.832-.615-1.455-1.415-1.455-.192 0-.368.024-.528.072-.16.056-.296.128-.408.24-.112.112-.192.256-.256.432-.056.184-.088.416-.088.704v.454zm4.618 3.271c-.319.128-.703.224-1.135.288-.432.064-.896.104-1.391.104-.279 0-.551-.024-.815-.064-.272-.048-.512-.12-.735-.224-.224-.112-.416-.248-.576-.415-.16-.160-.279-.352-.367-.576-.088-.224-.128-.464-.128-.735 0-.231.032-.44.104-.615.064-.184.16-.336.279-.471.12-.136.256-.248.415-.336.16-.096.336-.168.527-.224.192-.048.391-.080.608-.104.216-.016.434-.024.646-.024v-.735c0-.256-.064-.44-.207-.559-.136-.12-.328-.184-.568-.184-.2 0-.383.032-.551.104-.168.064-.26.168-.26.284 0 .048.016.088.056.12.032.04.072.056.12.056.056 0 .104-.016.151-.056.040-.032.08-.080.12-.12.04-.048.088-.08.151-.112.056-.024.127-.040.207-.040.12 0 .215.024.295.08.072.048.111.128.111.240v.22c-.215.016-.415.040-.607.08-.184.032-.359.080-.524.151-.168.064-.31.16-.431.279-.12.12-.215.271-.279.440-.072.184-.104.407-.104.671 0 .56.183.984.543 1.279.368.296.896.440 1.583.440.279 0 .528-.016.735-.056.215-.032.4-.080.559-.151.127-.056.191-.12.191-.2 0-.047-.015-.111-.047-.175-.04-.056-.08-.104-.12-.151-.047-.040-.087-.080-.127-.104-.048-.016-.080-.016-.111-.016-.040 0-.080.016-.112.032-.04.024-.087.048-.135.080zm12.455-3.271c0 .296.040.535.104.719.056.184.144.336.248.456.112.12.248.2.415.256.16.048.328.080.52.080.807 0 1.423-.624 1.423-1.511v-.447c0-.832-.616-1.455-1.423-1.455-.192 0-.36.024-.52.072-.167.056-.303.128-.415.24-.104.112-.192.256-.248.432-.064.184-.104.416-.104.704v.454zm4.618 3.271c-.319.128-.711.224-1.143.288-.432.064-.904.104-1.399.104-.271 0-.543-.024-.807-.064-.272-.048-.52-.12-.743-.224-.224-.112-.416-.248-.576-.415-.159-.16-.271-.352-.359-.576-.096-.224-.136-.464-.136-.735 0-.231.032-.44.104-.615.072-.184.168-.336.287-.471.112-.136.248-.248.407-.336.167-.096.344-.168.535-.224.192-.048.391-.080.607-.104.216-.016.432-.024.647-.024v-.735c0-.256-.063-.44-.199-.559-.144-.12-.336-.184-.575-.184-.2 0-.384.032-.552.104-.167.064-.247.168-.247.284 0 .048.007.088.047.12.04.04.08.056.128.056.048 0 .104-.016.144-.056.047-.032.087-.080.127-.12.04-.048.088-.08.144-.112.063-.024.135-.040.207-.040.127 0 .215.024.295.08.08.048.119.128.119.240v.22c-.215.016-.423.040-.615.08-.184.032-.36.080-.524.151-.159.064-.303.16-.423.279-.127.12-.215.271-.287.440-.064.184-.096.407-.096.671 0 .56.183.984.551 1.279.359.296.888.440 1.575.440.287 0 .536-.016.743-.056.207-.032.392-.080.551-.151.135-.056.199-.12.199-.2 0-.047-.023-.111-.055-.175-.04-.056-.088-.104-.128-.151-.04-.040-.079-.080-.119-.104-.048-.016-.088-.016-.119-.016-.032 0-.072.016-.104.032-.04.024-.087.048-.143.080z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">AWS</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Cloud Platform</p>
            </div>

            {/* Docker */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-sky-500 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.983 11.078h2.119c.186 0 .336-.054.451-.16.114-.106.171-.243.171-.411 0-.168-.057-.305-.171-.411-.115-.106-.265-.16-.451-.16h-2.119V8.142c0-.168-.057-.305-.172-.411-.114-.106-.264-.16-.45-.16-.186 0-.336.054-.45.16-.115.106-.173.243-.173.411v1.794H10.89c-.186 0-.335.054-.45.16-.114.106-.171.243-.171.411 0 .168.057.305.171.411.115.106.264.16.45.16h2.119v1.794c0 .168.058.305.173.411.114.106.264.16.45.16.186 0 .336-.054.45-.16.115-.106.172-.243.172-.411V11.078zm5.435.911c0 .186-.054.336-.16.45-.106.115-.243.173-.411.173H16.78c-.168 0-.305-.058-.411-.173-.106-.114-.16-.264-.16-.45V9.869c0-.186.054-.335.16-.45.106-.114.243-.171.411-.171h2.067c.168 0 .305.057.411.171.106.115.16.264.16.45v2.12zm-5.435-2.12c0-.186-.057-.335-.172-.45-.114-.114-.264-.171-.45-.171-.186 0-.336.057-.45.171-.115.115-.173.264-.173.45v2.12c0 .186.058.336.173.45.114.115.264.173.45.173.186 0 .336-.058.45-.173.115-.114.172-.264.172-.45V9.869zm-2.564 0c0-.186-.054-.335-.16-.45-.106-.114-.243-.171-.411-.171H8.78c-.168 0-.305.057-.411.171-.106.115-.16.264-.16.45v2.12c0 .186.054.336.16.45.106.115.243.173.411.173h2.068c.168 0 .305-.058.411-.173.106-.114.16-.264.16-.45V9.869zm-2.564 0c0-.186-.054-.335-.16-.45-.106-.114-.243-.171-.411-.171H6.216c-.168 0-.304.057-.41.171-.107.115-.161.264-.161.45v2.12c0 .186.054.336.16.45.107.115.243.173.411.173h2.068c.168 0 .305-.058.411-.173.106-.114.16-.264.16-.45V9.869z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">Docker</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Containerization</p>
            </div>

            {/* TypeScript */}
            <div className="group flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500"></div>
                <div className="relative w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-white font-semibold text-center">TypeScript</h3>
              <p className="text-gray-400 text-xs text-center mt-1">Programming Language</p>
            </div>
          </div>

          {/* Additional Technologies Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {/* MySQL */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-orange-400 font-bold text-xs">MySQL</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Database</p>
            </div>

            {/* MongoDB */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-green-400 font-bold text-xs">Mongo</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">NoSQL DB</p>
            </div>

            {/* Redis */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-400 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-red-400 font-bold text-xs">Redis</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Cache</p>
            </div>

            {/* Git */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-500 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-orange-400 font-bold text-xs">Git</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Version Control</p>
            </div>

            {/* Nginx */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-400 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-green-400 font-bold text-xs">Nginx</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Web Server</p>
            </div>

            {/* Tailwind */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-cyan-400 font-bold text-xs">Tailwind</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">CSS Framework</p>
            </div>

            {/* Figma */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-purple-400 font-bold text-xs">Figma</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">Design Tool</p>
            </div>

            {/* Postman */}
            <div className="group flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl transform rotate-45 group-hover:rotate-12 transition-transform duration-500 opacity-20"></div>
                <div className="relative w-full h-full bg-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-700">
                  <span className="text-orange-400 font-bold text-xs">Postman</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center">API Testing</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-2">15+</div>
                <div className="text-gray-400 text-sm">Technologies Mastered</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">5+</div>
                <div className="text-gray-400 text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-gray-400 text-sm">Modern Stack</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Performance Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">FAQ</h2>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get answers to common questions about our services and processes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How long does a typical project take?</h3>
                <p className="text-gray-600 dark:text-gray-300">Project timelines vary based on complexity and scope. Simple websites typically take 2-4 weeks, while complex applications can take 3-6 months. We provide detailed timelines during our initial consultation.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Do you provide ongoing support?</h3>
                <p className="text-gray-600 dark:text-gray-300">Yes! We offer comprehensive support and maintenance packages to ensure your systems run smoothly. This includes updates, security patches, backups, and 24/7 monitoring.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What technologies do you work with?</h3>
                <p className="text-gray-600 dark:text-gray-300">We work with modern technologies including React, Laravel, Node.js, Python, AWS, Azure, and many more. We choose the best technology stack for each project's specific requirements.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How do you ensure project success?</h3>
                <p className="text-gray-600 dark:text-gray-300">We follow agile development methodologies with regular client communication, milestone reviews, and iterative development. This ensures transparency and allows for adjustments throughout the project.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What are your pricing models?</h3>
                <p className="text-gray-600 dark:text-gray-300">We offer flexible pricing models including fixed-price projects, hourly rates, and retainer agreements. Pricing depends on project scope, complexity, and timeline requirements.</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Do you work with international clients?</h3>
                <p className="text-gray-600 dark:text-gray-300">Absolutely! While based in Zambia, we serve clients across Africa and internationally. We're experienced in working across different time zones and cultural contexts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Join hundreds of satisfied clients who have transformed their operations with our technology solutions. Get started with a free consultation today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href={route('contact')}
                className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                Start Your Project
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href={route('services')}
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Watch Demo
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-gray-300 mb-4">Trusted by leading organizations</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-white font-semibold">Enterprise Security</div>
                <div className="text-white font-semibold">99.9% Uptime</div>
                <div className="text-white font-semibold">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Blog Carousel Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 text-sm font-medium text-blue-800 dark:text-blue-300 mb-6">
              <span className="mr-2">📖</span>
              Latest Insights & Resources
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Stay Updated with Our Blog
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover the latest trends, insights, and best practices in technology from our expert team
            </p>
            
            {/* Blog Carousel Controls */}
            <div className="flex items-center justify-center mt-8 space-x-4">
              <button
                onClick={prevBlog}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex space-x-2">
                {blogPosts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBlog(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentBlog
                        ? 'bg-purple-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={nextBlog}
                className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Blog Posts Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentBlog * 100}%)` }}
              >
                {blogPosts.map((post, index) => (
                  <div key={post.id} className="w-full flex-shrink-0">
                    <div className="mx-4">
                      {post.featured ? (
                        // Featured Blog Post Layout
                        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                          <div className={`absolute inset-0 bg-gradient-to-br from-${post.categoryColor}-600/5 to-${post.categoryColor}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="relative">
                            <div className={`h-64 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                              <div className="text-center text-white">
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={post.icon} />
                                </svg>
                                <span className="text-sm opacity-80">Featured Article</span>
                              </div>
                            </div>
                            <div className="p-8">
                              <div className="flex items-center mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${post.categoryColor}-100 text-${post.categoryColor}-800 dark:bg-${post.categoryColor}-900 dark:text-${post.categoryColor}-300`}>
                                  {post.category}
                                </span>
                                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                              </div>
                              <h3 className={`text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-${post.categoryColor}-600 transition-colors duration-300`}>
                                {post.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${post.gradient} flex items-center justify-center`}>
                                    <span className="text-white text-sm font-medium">{post.author.avatar}</span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.author.role}</p>
                                  </div>
                                </div>
                                <Link href="#" className={`inline-flex items-center text-${post.categoryColor}-600 font-semibold group-hover:translate-x-2 transition-transform duration-300`}>
                                  Read More
                                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Regular Blog Post Layout
                        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                          <div className={`absolute inset-0 bg-gradient-to-br from-${post.categoryColor}-600/5 to-${post.categoryColor}-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="relative">
                            <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                              <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={post.icon} />
                              </svg>
                            </div>
                            <div className="p-6">
                              <div className="flex items-center mb-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${post.categoryColor}-100 text-${post.categoryColor}-800 dark:bg-${post.categoryColor}-900 dark:text-${post.categoryColor}-300`}>
                                  {post.category}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                              </div>
                              <h3 className={`text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-${post.categoryColor}-600 transition-colors duration-300`}>
                                {post.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${post.gradient} flex items-center justify-center`}>
                                    <span className="text-white text-xs font-medium">{post.author.avatar}</span>
                                  </div>
                                  <div className="ml-2">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">{post.author.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.author.role}</p>
                                  </div>
                                </div>
                              </div>
                              <Link href="#" className={`inline-flex items-center text-${post.categoryColor}-600 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300`}>
                                Read More
                                <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center mt-8 space-x-4">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentBlog(currentBlog === 0 ? blogPosts.length - 1 : currentBlog - 1)}
              className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {blogPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBlog(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentBlog === index
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentBlog(currentBlog === blogPosts.length - 1 ? 0 : currentBlog + 1)}
              className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center mt-16">
            <Link 
              href="#" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Articles
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
