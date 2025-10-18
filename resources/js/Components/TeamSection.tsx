import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';

export default function TeamSection() {
  const route = useRoute();
  
  // Team Carousel State
  const [currentTeamMember, setCurrentTeamMember] = useState(0);

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

  // Auto-advance team members
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTeamMember((prev) => (prev + 1) % orgData.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Large Background Image with Blur */}
      <div className="absolute inset-0">
        {orgData[currentTeamMember]?.image ? (
          <img
            src={orgData[currentTeamMember].image}
            alt={orgData[currentTeamMember].name}
            className="w-full h-full object-cover object-center"
            style={{
              filter: 'grayscale(10%) blur(4px) brightness(0.3)'
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
                <Link
                  href={route('contact')}
                  className="w-full inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Connect
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
            <button
              onClick={() => setCurrentTeamMember((prev) => (prev - 1 + orgData.length) % orgData.length)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
            <button
              onClick={() => setCurrentTeamMember((prev) => (prev + 1) % orgData.length)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Circular Team Member Thumbnails - Positioned Around */}
          <div className="absolute inset-0 pointer-events-none">
            {orgData.map((member, index) => {
              // Position thumbnails around the screen
              const positions = [
                { top: '15%', left: '8%' },    // Top-left
                { top: '15%', right: '8%' },   // Top-right  
                { top: '45%', left: '2%' },    // Middle-left
                { top: '45%', right: '2%' },   // Middle-right
                { bottom: '15%', left: '8%' }, // Bottom-left
                { bottom: '15%', right: '8%' }, // Bottom-right
              ];

              const position = positions[index];
              if (!position) return null;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentTeamMember(index)}
                  className="absolute pointer-events-auto group"
                  style={position}
                >
                  <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${index === currentTeamMember ? 'ring-4 ring-blue-400 ring-opacity-80 scale-110' : 'hover:ring-2 hover:ring-white/50'
                    }`}>
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className={`w-full h-full object-cover transition-all duration-300 ${index === currentTeamMember ? 'grayscale-0' : 'grayscale hover:grayscale-0'
                          }`}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">
                          {member.initials}
                        </span>
                      </div>
                    )}

                    {/* Active indicator dot */}
                    {index === currentTeamMember && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom indicator dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {orgData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTeamMember(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTeamMember
                  ? 'bg-blue-500 scale-125'
                  : 'bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}