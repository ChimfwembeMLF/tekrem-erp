import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "How long does a typical project take?",
    answer:
      "Project timelines vary based on complexity and scope. Simple websites typically take 2-4 weeks, while complex applications can take 3-6 months. We provide detailed timelines during our initial consultation."
  },
  {
    question: "Do you provide ongoing support?",
    answer:
      "Yes! We offer comprehensive support and maintenance packages to ensure your systems run smoothly. This includes updates, security patches, backups, and 24/7 monitoring."
  },
  {
    question: "What technologies do you work with?",
    answer:
      "We work with modern technologies including React, Laravel, Node.js, Python, AWS, Azure, and many more. We choose the best technology stack for each project's specific requirements."
  },
  {
    question: "How do you ensure project success?",
    answer:
      "We follow agile development methodologies with regular client communication, milestone reviews, and iterative development. This ensures transparency and allows for adjustments throughout the project."
  },
  {
    question: "What are your pricing models?",
    answer:
      "We offer flexible pricing models including fixed-price projects, hourly rates, and retainer agreements. Pricing depends on project scope, complexity, and timeline requirements."
  },
  {
    question: "Do you work with international clients?",
    answer:
      "Absolutely! While based in Zambia, we serve clients across Africa and internationally. We're experienced in working across different time zones and cultural contexts."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-4">FAQ</h2>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-300 mx-auto">
            Get answers to common questions about our services and processes
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{faq.question}</h3>
                <span className="ml-2 text-gray-500 dark:text-gray-400 text-2xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 text-gray-600 dark:text-gray-300 overflow-hidden"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
