import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useForm } from '@inertiajs/react';
import useTypedPage from '@/Hooks/useTypedPage';
import { toast } from 'sonner';

export default function Contact() {
  const page = useTypedPage();
  const settings: any = page.props.settings || {};
  
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real application, you would submit the form data to the server
    // post(route('contact.submit'));
    
    // For now, we'll just show a success message
    toast.success('Your message has been sent! We will get back to you soon.');
    reset();
  };

  return (
    <GuestLayout title="Contact Us">
      <Head title="Contact Us" />

      {/* Modern Hero Section with Gradient Background */}
      <div className="relative overflow-hidden py-20 bg-white dark:bg-gray-900 -mt-32">
        {/* Animated background elements */}
        {/* <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div> */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="lg:col-span-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 text-sm font-medium text-blue-800 dark:text-blue-300 mb-8">
                <span className="mr-2">✉️</span>
                Get in Touch
              </div>

              {/* Main heading */}
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                <span className="block">Contact</span>
                <span className="block bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  {settings.company_name || 'Technology Remedies Innovations'}
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                Have a question or want to discuss a project? We'd love to hear from you. Fill out the form below or use our contact information.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:info@tekrem.com"
                  className="inline-flex items-center justify-center px-8 py-4  bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary text-white font-semibold rounded-xl  transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Email Us
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a
                  href="tel:+260211123456"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Call Us
                </a>
              </div>

              {/* Trust indicators */}
              {/* <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by leading companies</p>
                <div className="flex items-center space-x-6 opacity-60">
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">Zambia Bank</div>
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">MTN Zambia</div>
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded text-sm font-medium">Airtel</div>
                </div>
              </div> */}
            </div>

            {/* Hero Image or Icon */}
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-24 h-24 blur-3xl bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 blur-3xl bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-500"></div>
                <div className="relative flex flex-col items-center justify-center">
                  <svg className="w-20 h-20 text-blue-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 01-8 0m8 0a4 4 0 01-8 0m8 0a4 4 0 01-8 0" />
                  </svg>
                  <blockquote className="text-xl font-medium text-gray-900 dark:text-white mb-4 text-center">
                    "We're here to help you with your technology needs. Reach out and let's build something great together!"
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

      {/* Contact Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="relative bg-white dark:bg-gray-800 shadow-xl">
            <h2 className="sr-only">Contact us</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Contact information */}
              <div className="relative overflow-hidden py-10 px-6 bg-gradient-to-br from-secondary to-primary sm:px-10 xl:p-12">
                <div className="absolute inset-0 pointer-events-none sm:hidden" aria-hidden="true">
                  <svg
                    className="absolute inset-0 w-full h-full"
                    width={343}
                    height={388}
                    viewBox="0 0 343 388"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-99 461.107L608.107-246l707.103 707.107-707.103 707.103L-99 461.107z"
                      fill="url(#linear1)"
                      fillOpacity=".1"
                    />
                    <defs>
                      <linearGradient
                        id="linear1"
                        x1="254.553"
                        y1="107.554"
                        x2="961.66"
                        y2="814.66"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#fff" />
                        <stop offset={1} stopColor="#fff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div
                  className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none sm:block lg:hidden"
                  aria-hidden="true"
                >
                  <svg
                    className="absolute inset-0 w-full h-full"
                    width={359}
                    height={339}
                    viewBox="0 0 359 339"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-161 382.107L546.107-325l707.103 707.107-707.103 707.103L-161 382.107z"
                      fill="url(#linear2)"
                      fillOpacity=".1"
                    />
                    <defs>
                      <linearGradient
                        id="linear2"
                        x1="192.553"
                        y1="28.553"
                        x2="899.66"
                        y2="735.66"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#fff" />
                        <stop offset={1} stopColor="#fff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>  
                <div
                  className="hidden absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none lg:block"
                  aria-hidden="true"
                >
                  <svg
                    className="absolute inset-0 w-full h-full"
                    width={160}
                    height={678}
                    viewBox="0 0 160 678"
                    fill="none"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-161 679.107L546.107-28l707.103 707.107-707.103 707.103L-161 679.107z"
                      fill="url(#linear3)"
                      fillOpacity=".1"
                    />
                    <defs>
                      <linearGradient
                        id="linear3"
                        x1="192.553"
                        y1="325.553"
                        x2="899.66"
                        y2="1032.66"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#fff" />
                        <stop offset={1} stopColor="#fff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Contact information</h3>
                <p className="mt-6 text-base text-blue-50 max-w-3xl">
                  {settings.company_name || 'Technology Remedies Innovations'} is here to help you with your technology needs. Reach out to us using the contact information below.
                </p>
                <dl className="mt-8 space-y-6">
                  <dt>
                    <span className="sr-only">Address</span>
                  </dt>
                  <dd className="flex text-base text-blue-50">
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-blue-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="ml-3">{settings.company_address || 'Lusaka, Zambia'}</span>
                  </dd>
                  <dt>
                    <span className="sr-only">Phone number</span>
                  </dt>
                  <dd className="flex text-base text-blue-50">
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-blue-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="ml-3">{settings.company_phone || '+260 976607840'}</span>
                  </dd>
                  <dt>
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd className="flex text-base text-blue-50">
                    <svg
                      className="flex-shrink-0 w-6 h-6 text-blue-200"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="ml-3">{settings.company_email || 'tekremsolutions@gmail.com'}</span>
                  </dd>
                </dl>
                <ul className="mt-8 flex space-x-12">
                  <li>
                    <a className="text-blue-200 hover:text-blue-100" href="#">
                      <span className="sr-only">Facebook</span>
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a className="text-blue-200 hover:text-blue-100" href="#">
                      <span className="sr-only">Twitter</span>
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a className="text-blue-200 hover:text-blue-100" href="#">
                      <span className="sr-only">LinkedIn</span>
                      <svg
                        className="w-7 h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact form */}
              <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send us a message</h3>
                <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Full name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Phone
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        autoComplete="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Subject
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {errors.subject && <p className="mt-2 text-sm text-red-600">{errors.subject}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900 dark:text-gray-200">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    {errors.message && <p className="mt-2 text-sm text-red-600">{errors.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={processing}
                      className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-secondary to-primary hover:from-primary hover hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {processing ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Our Location</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Visit Our Office
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
              We are located in the heart of Lusaka, Zambia. Feel free to visit us during business hours.
            </p>
          </div>
          <div className="mt-10">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                className="w-full h-96 rounded-lg shadow-lg"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122151.99297841864!2d28.24973755!3d-15.4114289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19408b6f8ed39b57%3A0x82e23ce2b3f9ccae!2sLusaka%2C%20Zambia!5e0!3m2!1sen!2sus!4v1651234567890!5m2!1sen!2sus"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
