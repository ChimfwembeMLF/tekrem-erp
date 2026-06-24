import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import WebsiteHero from '@/Components/Website/WebsiteHero';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Mail, MapPin, Phone, MessageSquare, FileText } from 'lucide-react';

export default function Contact() {
  const route = useRoute();
  const page = useTypedPage();
  const settings: Record<string, string> = page.props.settings || {};

  const email = settings.company_email || 'Tekremsolutions@gmail.com';
  const phone = settings.company_phone || '+260 976 607 840';
  const address = settings.company_address || 'Lusaka, Zambia';

  return (
    <GuestLayout title="Contact Us">
      <Head title="Contact Us" />

      <WebsiteHero
        badge="Contact"
        badgeIcon="✉️"
        title="Let's talk about"
        highlight="your next project"
        description="Reach out for quotes, partnerships, or general questions. We typically respond within one business day."
        primaryCta={{ label: 'Send an Inquiry', href: route('guest.inquiry.create') }}
        secondaryCta={{ label: 'Request a Quote', href: route('guest.quote.create') }}
      />

      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Mail className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`mailto:${email}`} className="text-sm text-primary hover:underline">{email}</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Phone className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-sm text-primary hover:underline">{phone}</a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Office</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{address}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MessageSquare className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Use the chat widget on any page for instant help.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <FileText className="mb-2 h-6 w-6 text-primary" />
                <CardTitle>General inquiry</CardTitle>
                <CardDescription>Questions about our company, services, or partnerships.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={route('guest.inquiry.create')}>Open inquiry form</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="mb-2 h-6 w-6 text-primary" />
                <CardTitle>Project quote</CardTitle>
                <CardDescription>Share your requirements and get a tailored ZMW quote.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-gradient-to-r from-secondary to-primary hover:from-primary hover:to-secondary">
                  <Link href={route('guest.quote.create')}>Request a quote</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </GuestLayout>
  );
}
