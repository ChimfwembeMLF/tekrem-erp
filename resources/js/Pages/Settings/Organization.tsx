import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Globe, Building, Mail, Phone, MapPin, ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { toast } from 'sonner';

interface Organization {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  custom_domain: string | null;
}

interface Props {
  organization: Organization;
  canUseCustomDomain: boolean;
  hasAiModule: boolean;
  aiSettings: {
    openai_api_key: string | null;
    anthropic_api_key: string | null;
  };
}

export default function OrganizationSettings({ organization, canUseCustomDomain, hasAiModule, aiSettings }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: organization.name || '',
    email: organization.email || '',
    phone: organization.phone || '',
    website: organization.website || '',
    address: organization.address || '',
    custom_domain: organization.custom_domain || '',
    openai_api_key: aiSettings?.openai_api_key || '',
    anthropic_api_key: aiSettings?.anthropic_api_key || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('settings.organization.update'), {
      onSuccess: () => {
        toast.success('Settings updated!', {
          description: 'Organization settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  return (
    <AppLayout
      title="Organization Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Organization Settings
              </h2>
            </div>
          </div>
          <Button 
            onClick={submit}
            disabled={processing}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    >
      <Head title="Organization Settings" />
      
      <div className="mx-auto max-w-4xl space-y-6 pb-12 mt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your workspace details and custom domain configuration.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Profile
              </CardTitle>
              <CardDescription>
                Basic information about your organization. This information may be visible on your invoices and portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Acme Corp"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Support Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      className="pl-9"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-9"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={data.website}
                  onChange={(e) => setData('website', e.target.value)}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-9"
                    value={data.address}
                    onChange={(e) => setData('address', e.target.value)}
                    placeholder="123 Business Rd, Suite 100"
                  />
                </div>
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Custom Domain
                </div>
                {canUseCustomDomain ? (
                  <Badge variant="default" className="bg-green-600">Enabled</Badge>
                ) : (
                  <Badge variant="secondary">Upgrade Required</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure a custom domain (e.g., erp.yourcompany.com) so your staff and clients can access your workspace securely without using our default domain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canUseCustomDomain && (
                <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTitle className="font-semibold">Custom Domain Not Available</AlertTitle>
                  <AlertDescription>
                    Your current billing plan does not support custom domains. Please upgrade your plan or purchase the Custom Domain add-on to configure a custom domain for your organization.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="custom_domain">Your Custom Domain</Label>
                <Input
                  id="custom_domain"
                  value={data.custom_domain}
                  onChange={(e) => setData('custom_domain', e.target.value)}
                  placeholder="portal.yourcompany.com"
                  disabled={!canUseCustomDomain}
                />
                {errors.custom_domain && <p className="text-sm text-destructive">{errors.custom_domain}</p>}
                
                {canUseCustomDomain && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Note: You will need to create a CNAME record with your DNS provider pointing <strong>{data.custom_domain || 'your domain'}</strong> to our servers.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {hasAiModule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  AI Settings (Bring Your Own Key)
                </CardTitle>
                <CardDescription>
                  Enter your own API keys to utilize the AI features without platform quotas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                  <Input
                    id="openai_api_key"
                    type="password"
                    value={data.openai_api_key}
                    onChange={(e) => setData('openai_api_key', e.target.value)}
                    placeholder="sk-..."
                  />
                  {errors.openai_api_key && <p className="text-sm text-destructive">{errors.openai_api_key}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic_api_key">Anthropic API Key</Label>
                  <Input
                    id="anthropic_api_key"
                    type="password"
                    value={data.anthropic_api_key}
                    onChange={(e) => setData('anthropic_api_key', e.target.value)}
                    placeholder="sk-ant-..."
                  />
                  {errors.anthropic_api_key && <p className="text-sm text-destructive">{errors.anthropic_api_key}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={processing} size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
