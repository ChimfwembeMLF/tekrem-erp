import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ArrowRight,
  DollarSign,
  Code,
  Users,
  Zap
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import WebsiteHero from '@/Components/Website/WebsiteHero';

export default function FAQ() {
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expanded, setExpanded] = useState<number[]>([]);

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: 1,
      question: "What services does Tekrem offer?",
      answer:
        "Tekrem offers comprehensive technology solutions including web development, mobile app development, AI solutions, cloud services, and custom software development. We specialize in creating scalable, modern applications for businesses of all sizes.",
      category: "general",
      popular: true,
    },
    {
      id: 2,
      question: "How do I get started with a project?",
      answer:
        "Getting started is easy! Simply request a quote through our website, and our team will contact you within 24 hours to discuss your project requirements, timeline, and budget. We'll provide a detailed proposal tailored to your needs.",
      category: "general",
      popular: true,
    },
    {
      id: 3,
      question: "Do you work with small businesses or only large enterprises?",
      answer:
        "We work with businesses of all sizes, from startups and small businesses to large enterprises. Our solutions are scalable and can be tailored to fit any budget and requirement.",
      category: "general",
      popular: false,
    },
  
    // Pricing Questions
    {
      id: 4,
      question: "How much does a typical web development project cost?",
      answer:
        "Starter web projects from K 75,000; mobile apps from K 225,000; AI from K 325,000; managed cloud from K 25,000/month. See our pricing page for full packages — custom quotes follow discovery.",
      category: "pricing",
      popular: true,
    },
    {
      id: 5,
      question: "Do you offer payment plans or financing options?",
      answer:
        "Yes — for projects over K 250,000 we typically structure payments in milestones (e.g. 30% upfront, 40% at midpoint, 30% on completion). Custom arrangements are available for larger engagements.",
      category: "pricing",
      popular: false,
    },
    {
      id: 6,
      question: "Are there any hidden fees or additional costs?",
      answer:
        "No, we believe in transparent pricing. All costs are outlined in our initial proposal. Any additional work outside the original scope will be discussed and approved before implementation.",
      category: "pricing",
      popular: false,
    },
  
    // Technical Questions
    {
      id: 7,
      question: "What technologies do you use for development?",
      answer:
        "We use modern, industry-standard technologies including React, Laravel, Node.js, Python, React Native, Flutter, AWS, and more. We choose the best technology stack based on your project requirements and long-term goals.",
      category: "technical",
      popular: true,
    },
    {
      id: 8,
      question: "Do you provide ongoing maintenance and support?",
      answer:
        "Yes — maintenance from K 5,000/month depending on scope, including security updates, fixes, and performance monitoring.",
      category: "technical",
      popular: true,
    },
    {
      id: 9,
      question: "Can you integrate with our existing systems?",
      answer:
        "Absolutely! We have extensive experience integrating with various third-party systems, APIs, databases, and legacy applications. We'll assess your current infrastructure and provide seamless integration solutions.",
      category: "technical",
      popular: false,
    },
  
    // Process Questions
    {
      id: 10,
      question: "What is your typical project timeline?",
      answer:
        "Timelines vary by project complexity. Simple websites take 4–6 weeks, while complex applications can take 3–6 months. We provide detailed project timelines with milestones during the planning phase.",
      category: "process",
      popular: true,
    },
    {
      id: 11,
      question: "How do you handle project communication?",
      answer:
        "We use modern project management tools and provide regular updates through weekly reports, milestone reviews, and dedicated project managers. You'll have access to our project portal to track progress in real-time.",
      category: "process",
      popular: false,
    },
    {
      id: 12,
      question: "What happens if I need changes during development?",
      answer:
        "Minor changes within the original scope are included. For significant changes, we'll provide a change request with time and cost implications. We're flexible and work with you to accommodate necessary modifications.",
      category: "process",
      popular: false,
    },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: <HelpCircle className="h-4 w-4" /> },
    { id: 'general', name: 'General', icon: <Users className="h-4 w-4" /> },
    { id: 'pricing', name: 'Pricing', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical', icon: <Code className="h-4 w-4" /> },
    { id: 'process', name: 'Process', icon: <Zap className="h-4 w-4" /> }
  ];

  const filtered = faqData.filter(f => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || f.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggle = (id: number) =>
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );

  return (
    <GuestLayout title="FAQ">
      <Head title="FAQ" />

      {/* Clean system hero */}
      <WebsiteHero
        badge="Support"
        badgeIcon="❓"
        title="Frequently Asked Questions"
        description="Quick answers about our services, pricing, and process."
        primaryCta={{ label: 'Contact Support', href: route('contact') }}
      />

      <div className="bg-background py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search questions..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map(c => (
              <Button
                key={c.id}
                variant={selectedCategory === c.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(c.id)}
                className="flex items-center gap-2"
              >
                {c.icon}
                {c.name}
              </Button>
            ))}
          </div>

          {/* FAQ list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No results found
                </CardContent>
              </Card>
            ) : (
              filtered.map(faq => (
                <Card key={faq.id} className="border-border">
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => toggle(faq.id)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-medium">
                        {faq.question}
                        {faq.popular && (
                          <Badge className="ml-2" variant="secondary">
                            Popular
                          </Badge>
                        )}
                      </CardTitle>

                      {expanded.includes(faq.id) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <CardDescription className="capitalize">
                      {faq.category}
                    </CardDescription>
                  </CardHeader>

                  {expanded.includes(faq.id) && (
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="mt-12 text-center">
            <Card>
              <CardContent className="py-10">
                <h3 className="text-lg font-medium mb-2">
                  Still need help?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Talk to our support team directly.
                </p>

                <Button asChild>
                  <Link href={route('contact')}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </GuestLayout>
  );
}