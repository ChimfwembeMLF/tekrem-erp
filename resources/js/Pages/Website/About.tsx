import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import useTypedPage from '@/Hooks/useTypedPage';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

export default function About() {
  const page = useTypedPage();
  const route = useRoute();
  const settings: any = page.props.settings || {};

  const orgData = [
    {
      name: "Chimfwembe Kangwa",
      initials: "CK",
      role: "CTO / Developer",
      bio: "Passionate about scalable systems and modern development practices.",
      color: "from-teal-500 to-cyan-600",
      image: "/assets/team/chimfwembe-kangwa.png",
      experience: "5+ years experience",
      expertise: "Full-stack Development, System Architecture",
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
      experience: "4+ years experience",
      expertise: "Operations Management, Backend Development",
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
      experience: "3+ years experience",
      expertise: "UI/UX Design, Frontend Development",
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
      experience: "4+ years experience",
      expertise: "Digital Marketing, Financial Analysis",
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
      experience: "3+ years experience",
      expertise: "Sales Strategy, Client Relations",
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
      experience: "4+ years experience",
      expertise: "Project Management, Agile Methodologies",
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
      color: "from-sky-500 to-blue-600",
      image: "/assets/team/savior-banda.png",
      experience: "3+ years experience",
      expertise: "Graphic Design, Brand Identity",
      socials: [
        { platform: "linkedin", url: "#" },
        { platform: "github", url: "#" },
        { platform: "website", url: "https://www.footprintsgraphixx.com" },
      ],
    },
  ];

  return (
    <GuestLayout title="About Us">
      <Head title="About Us" />

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
                <span className="mr-2">🏢</span>
                Leading Technology Solutions Provider
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">About</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {settings.company_name || 'Technology Remedies Innovations'}
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Founded in 2020, we've quickly established ourselves as a leading technology solutions provider in Zambia, specializing in innovative digital transformation.
              </p>

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  100+ Projects Delivered
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  98% Client Satisfaction
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Expert Team
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Innovation Focused
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={route('services')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Our Services
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={route('contact')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Get In Touch
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-500"></div>
                
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <blockquote className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                      "Our mission is to empower businesses with innovative technology solutions that drive growth and success."
                    </blockquote>
                    <cite className="text-blue-600 font-semibold">
                      Leadership Team, {settings.company_name || 'TekRem'}
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gray-800/20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-300 font-semibold tracking-wide uppercase mb-4">Our Journey</h2>
            <p className="text-4xl md:text-5xl font-bold text-white mb-6">
              Delivering Excellence Since 2020
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-2">
                  5+
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Years of Excellence</div>
              <div className="text-sm text-gray-300">Continuous innovation</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text mb-2">
                  100+
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Projects Delivered</div>
              <div className="text-sm text-gray-300">Successful implementations</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                  7
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Team Members</div>
              <div className="text-sm text-gray-300">Expert professionals</div>
            </div>
            
            <div className="text-center group">
              <div className="relative">
                <div className="text-5xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text mb-2">
                  98%
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              <div className="text-lg font-semibold text-white mb-2">Client Satisfaction</div>
              <div className="text-sm text-gray-300">Proven track record</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">Our Foundation</h2>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Mission, Vision & Values
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission */}
            <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">To empower businesses with innovative technology solutions that drive growth, efficiency, and competitive advantage in the digital age.</p>
              </div>
            </div>

            {/* Vision */}
            <div className="group relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">To be the leading technology partner for businesses in Africa, known for our innovation, quality, and commitment to client success.</p>
              </div>
            </div>

            {/* Values */}
            <div className="group relative bg-gradient-to-br from-purple-50 to-violet-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Innovation & Excellence</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Integrity & Transparency</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Client-First Approach</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Continuous Learning</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">Our Team</h2>
            <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet the Experts Behind Our Success
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our diverse team of professionals brings together expertise in software development, design, business analysis, and project management.
            </p>
          </div>

          {/* Masonry Layout for Team */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {orgData.map((member, index) => {
              // Create varying heights for masonry effect
              const cardVariants = [
                "min-h-[420px]", // Short card
                "min-h-[480px]", // Medium card
                "min-h-[520px]", // Tall card
                "min-h-[460px]", // Medium-short card
              ];
              const cardHeight = cardVariants[index % cardVariants.length];
              
              return (
                <div 
                  key={index} 
                  className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 break-inside-avoid mb-8 ${cardHeight}`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Gradient top border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${member.color} rounded-t-2xl`}></div>
                  
                  <div className="relative">
                    {/* Team Member Photo */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-20 h-20 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                            <span className="text-white font-bold text-xl">
                              {member.initials}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Team Member Info */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-2">
                        {member.role}
                      </p>
                      
                      {/* Experience Badge */}
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {member.experience}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                        {member.bio}
                      </p>

                      {/* Expertise Tags */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">EXPERTISE</p>
                        <div className="flex flex-wrap justify-center gap-1">
                          {member.expertise.split(', ').map((skill, skillIndex) => (
                            <span 
                              key={skillIndex}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-2 mt-auto pt-4">
                      {member.socials.map((social, socialIndex) => (
                        <a
                          key={socialIndex}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-300 group/social"
                        >
                          {social.platform === 'linkedin' && (
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover/social:text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                            </svg>
                          )}
                          {social.platform === 'github' && (
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover/social:text-gray-900 dark:group-hover/social:text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {social.platform === 'website' && (
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover/social:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9" />
                            </svg>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={route('contact')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Work With Our Team
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href={route('services')}
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl shadow-lg hover:shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                View Our Services
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
              Ready to Work Together?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Let's discuss how our team can help transform your business with innovative technology solutions. Get in touch for a free consultation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href={route('contact')}
                className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                Get Started Today
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href={route('services')}
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-6m-2-5a3 3 0 01-6 0m6 0a3 3 0 016 0m-6 0H3" />
                </svg>
                View Services
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-gray-300 mb-4">Why choose us?</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-white font-semibold">Expert Team</div>
                <div className="text-white font-semibold">Proven Results</div>
                <div className="text-white font-semibold">24/7 Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
