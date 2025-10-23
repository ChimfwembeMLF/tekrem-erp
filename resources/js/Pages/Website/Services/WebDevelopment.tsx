import React from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Link } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { getServiceBySlug } from '@/Data/servicesData';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';
import webServiceIllustration from '../../../../../public/assets/illustrations/web-services-illustration.png'
import useTypedPage from '@/Hooks/useTypedPage';
export default function WebDevelopment() {
  const route = useRoute();
  const service = getServiceBySlug('web-development');
  const page = useTypedPage();
  const settings: any = page.props.settings || {};

  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <GuestLayout title={service.title}>
      <Head title={service.title} />

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
                <span className="mr-2">💻</span>
                Web Development
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">{service.title}</span>
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Build, Launch, Grow
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                {service.fullDescription}
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
                  <img src={webServiceIllustration} alt="" />
                  <blockquote className="text-xl font-medium text-gray-900 dark:text-white mb-4 text-center">
                    "We build scalable, modern web solutions for your business."
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

      {/* Features Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our web development services include everything you need to succeed online
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Web Development Services?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {service.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Package
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Flexible pricing options to fit your budget and requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {service.packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{pkg.price}</div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                    <Link href={route('contact')} className="flex items-center justify-center">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Technologies We Use
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We work with the latest and most reliable technologies
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {service.technologies.map((tech, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Development Process
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A proven methodology that delivers results
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {service.processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {step}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {service.faq.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
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
            Ready to Start Your Web Development Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let's discuss your requirements and create something amazing together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href={route('contact')}>Get Free Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href={route('services')}>View All Services</Link>
            </Button>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
