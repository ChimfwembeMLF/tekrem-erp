import React from 'react'

export default function PartnerSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="lg:text-center mb-12">
      <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Partners</h2>
      <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        Trusted by Leading Organizations
      </p>
      <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
        We collaborate with industry leaders to deliver cutting-edge solutions.
      </p>
    </div>

    {/* Infinite Carousel Container */}
    <div className="relative">
      {/* First Row - Left to Right */}
      <div className="flex overflow-hidden mb-8">
        <div className="flex animate-scroll-left space-x-8 min-w-full">
          {[
            { name: "Google", logo: "🔍"},
            { name: "Microsoft", logo: "🪟"},
            { name: "Amazon", logo: "📦"},
            { name: "Apple", logo: "🍎"},
            { name: "IBM", logo: "💼"},
            { name: "Salesforce", logo: "☁️"},
            { name: "Oracle", logo: "🔴"},
            { name: "Meta", logo: "📘"},
            { name: "Adobe", logo: "🎨"},
            { name: "Intel", logo: "💻"}
          ].map((partner, i) => (
            <div key={i} className="flex-shrink-0 group">
              <div className={`bg-gray-900 border-2 border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-95 min-w-[200px]`}>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{partner.logo}</span>
                  <span className="text-white font-bold text-lg">{partner.name}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            { name: "Google", logo: "🔍", color: "from-blue-500 to-green-500" },
            { name: "Microsoft", logo: "🪟", color: "from-blue-600 to-cyan-500" },
            { name: "Amazon", logo: "📦", color: "from-orange-500 to-yellow-500" },
            { name: "Apple", logo: "🍎", color: "from-gray-700 to-gray-900" },
            { name: "IBM", logo: "💼", color: "from-blue-700 to-indigo-600" }
          ].map((partner, i) => (
            <div key={`dup1-${i}`} className="flex-shrink-0 group">
              <div className={`bg-gradient-to-r ${partner.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]`}>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{partner.logo}</span>
                  <span className="text-white font-bold text-lg">{partner.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Right to Left */}
      {/* <div className="flex overflow-hidden">
        <div className="flex animate-scroll-right space-x-8 min-w-full">
          {[
            { name: "Netflix", logo: "🎬", color: "from-red-600 to-red-800" },
            { name: "Cisco", logo: "🌐", color: "from-blue-600 to-blue-800" },
            { name: "Tesla", logo: "⚡", color: "from-red-500 to-gray-800" },
            { name: "Spotify", logo: "🎵", color: "from-green-500 to-green-700" },
            { name: "NVIDIA", logo: "🎮", color: "from-green-600 to-black" },
            { name: "Shopify", logo: "🛒", color: "from-green-500 to-teal-600" },
            { name: "Zoom", logo: "📹", color: "from-blue-500 to-blue-700" },
            { name: "Slack", logo: "💬", color: "from-purple-500 to-pink-500" },
            { name: "Dropbox", logo: "📁", color: "from-blue-500 to-blue-600" },
            { name: "Atlassian", logo: "🔧", color: "from-blue-600 to-indigo-700" }
          ].map((partner, i) => (
            <div key={i} className="flex-shrink-0 group">
              <div className={`bg-gradient-to-r ${partner.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]`}>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{partner.logo}</span>
                  <span className="text-white font-bold text-lg">{partner.name}</span>
                </div>
              </div>
            </div>
          ))}
          Duplicate for seamless loop
          {[
            { name: "Netflix", logo: "🎬", color: "from-red-600 to-red-800" },
            { name: "Cisco", logo: "🌐", color: "from-blue-600 to-blue-800" },
            { name: "Tesla", logo: "⚡", color: "from-red-500 to-gray-800" },
            { name: "Spotify", logo: "🎵", color: "from-green-500 to-green-700" },
            { name: "NVIDIA", logo: "🎮", color: "from-green-600 to-black" }
          ].map((partner, i) => (
            <div key={`dup2-${i}`} className="flex-shrink-0 group">
              <div className={`bg-gradient-to-r ${partner.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[200px]`}>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl">{partner.logo}</span>
                  <span className="text-white font-bold text-lg">{partner.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  </div>
  )
}
