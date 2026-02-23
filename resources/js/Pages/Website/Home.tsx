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
import TeamCarousel from '@/Components/TeamCarousel';
import TechnologyStack from '@/Components/TechnologyStack';
import FAQ from '@/Components/FAQ';
import { Check } from 'lucide-react';



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
      name: "Kangwa Chimfwembe",
      initials: "CK",
      role: "CTO / Developer",
      bio: "Passionate about scalable systems and modern development practices.",
      color: "from-teal-500 to-cyan-600",
      image: "/assets/team/chimfwembe-kangwa1.png",
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
      <div
        className="relative flex items-center overflow-hidden min-h-screen -mt-24 bg-white/10 dark:bg-gray-900/10"
        style={{
          backgroundImage: "url('/assets/illustrations/tekrem-hero-section-image.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br  backdrop-blur-sm from-primary/90 via-black/50 to-transparent" />

        <div className="relative z-10 container mx-auto px-6 pt-24 pb-16">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="lg:col-span-6">

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block text-white dark:text-gray-300 ">Technology Solutions for</span>
                <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  Modern Businesses
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-xl tracking-tight text-white max-w-2xl">
                {settings.company_name || 'Technology Remedies Innovations'} provides cutting-edge technology solutions to help businesses in Zambia and beyond thrive in the digital age.
              </p>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-lg text-white">
                <div className="flex items-center">
                  <Check className='text-green-500 h-4' />
                  24/7 Support
                </div>
                <div className="flex items-center">
                  <Check className='text-green-500 h-4' />
                  99.9% Uptime
                </div>
                <div className="flex items-center">
                  <Check className='text-green-500 h-4' />
                  Secure & Compliant
                </div>
                <div className="flex items-center">
                  <Check className='text-green-500 h-4' />
                  Scalable Solutions
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={route('services')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
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
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section with Modern Design */}


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


      <TeamCarousel orgData={orgData} />




      {/* Creative Technology Stack Section */}
      {/* <TechnologyStack /> */}


      {/* FAQ Section */}
      <FAQ />

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


    </GuestLayout>
  );
}
