import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { getAllServices } from '@/Data/servicesData';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Services() {
  const route = useRoute();
  const page = useTypedPage();
  const settings: any = page.props.settings || {};
  const services = getAllServices();

  const serviceRoutes = {
    'web-development': 'services.web-development',
    'mobile-apps': 'services.mobile-apps',
    'ai-solutions': 'services.ai-solutions',
    'cloud-services': 'services.cloud-services',
  };

  return (
    <GuestLayout title="Services">
      <Head title="Services" />

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
                <span className="mr-2">🛠️</span>
                Our Services
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">Comprehensive Technology</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Solutions for Your Business
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                We provide comprehensive technology solutions to help your business grow and succeed in the digital world.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={route('contact')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={route('portfolio')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Portfolio
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
                  <svg className="w-20 h-20 text-blue-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 01-8 0m8 0a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                  </svg>
                  <blockquote className="text-xl font-medium text-gray-900 dark:text-white mb-4 text-center">
                    "Empowering your business with innovative technology solutions."
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

      {/* Main Services Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">What We Offer</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Comprehensive Technology Solutions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              Our services are designed to help businesses of all sizes leverage technology to achieve their goals.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-lg">{service.shortDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {service.fullDescription}
                  </p>

                  {/* Key Features */}
                  <div className="space-y-3 mb-6">
                    {service.features.slice(0, 3).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{feature.title}</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button className="w-full group-hover:bg-blue-700 transition-colors">
                    <Link
                      href={route(serviceRoutes[service.id as keyof typeof serviceRoutes])}
                      className="flex items-center justify-center w-full"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>




      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today for a free consultation and let's discuss how we can help your business grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href={route('contact')}>Get Free Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href={route('portfolio')}>View Our Work</Link>
            </Button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
