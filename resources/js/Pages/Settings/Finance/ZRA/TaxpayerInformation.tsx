import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Building,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Save,
  Loader2,
  Info,
  Shield,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface TaxpayerInformation {
  taxpayer_tpin: string;
  taxpayer_name: string;
  taxpayer_address: string;
  taxpayer_phone: string;
  taxpayer_email: string;
  business_registration_number: string;
  business_type: string;
  vat_registration_number: string;
  tax_office: string;
  registration_date: string;
  business_description: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  postal_address: string;
  physical_address: string;
  website: string;
  bank_account_number: string;
  bank_name: string;
  bank_branch: string;
  is_vat_registered: boolean;
  is_active_taxpayer: boolean;
}

interface Props {
  taxpayerInfo: TaxpayerInformation;
  businessTypes: string[];
  taxOffices: string[];
}

export default function ZraTaxpayerInformation({ 
  taxpayerInfo, 
  businessTypes, 
  taxOffices 
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isValidatingTpin, setIsValidatingTpin] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    taxpayer_tpin: taxpayerInfo.taxpayer_tpin || '',
    taxpayer_name: taxpayerInfo.taxpayer_name || '',
    taxpayer_address: taxpayerInfo.taxpayer_address || '',
    taxpayer_phone: taxpayerInfo.taxpayer_phone || '',
    taxpayer_email: taxpayerInfo.taxpayer_email || '',
    business_registration_number: taxpayerInfo.business_registration_number || '',
    business_type: taxpayerInfo.business_type || '',
    vat_registration_number: taxpayerInfo.vat_registration_number || '',
    tax_office: taxpayerInfo.tax_office || '',
    registration_date: taxpayerInfo.registration_date || '',
    business_description: taxpayerInfo.business_description || '',
    contact_person_name: taxpayerInfo.contact_person_name || '',
    contact_person_phone: taxpayerInfo.contact_person_phone || '',
    contact_person_email: taxpayerInfo.contact_person_email || '',
    postal_address: taxpayerInfo.postal_address || '',
    physical_address: taxpayerInfo.physical_address || '',
    website: taxpayerInfo.website || '',
    bank_account_number: taxpayerInfo.bank_account_number || '',
    bank_name: taxpayerInfo.bank_name || '',
    bank_branch: taxpayerInfo.bank_branch || '',
    is_vat_registered: taxpayerInfo.is_vat_registered || false,
    is_active_taxpayer: taxpayerInfo.is_active_taxpayer || true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.finance.zra.taxpayer.update'), {
      onSuccess: () => {
        toast.success('Taxpayer information updated successfully');
      },
      onError: () => {
        toast.error('Failed to update taxpayer information');
      },
    });
  };

  const validateTpin = async () => {
    if (!data.taxpayer_tpin || data.taxpayer_tpin.length !== 10) {
      toast.error('TPIN must be exactly 10 characters');
      return;
    }

    setIsValidatingTpin(true);
    
    try {
      const response = await fetch(route('settings.finance.zra.taxpayer.validate-tpin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ tpin: data.taxpayer_tpin }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('TPIN validation successful');
        if (result.taxpayer_info) {
          // Auto-fill taxpayer information from ZRA
          setData({
            ...data,
            taxpayer_name: result.taxpayer_info.name || data.taxpayer_name,
            taxpayer_address: result.taxpayer_info.address || data.taxpayer_address,
            business_type: result.taxpayer_info.business_type || data.business_type,
          });
        }
      } else {
        toast.error(`TPIN validation failed: ${result.message}`);
      }
    } catch (error) {
      toast.error('Failed to validate TPIN');
    } finally {
      setIsValidatingTpin(false);
    }
  };

  return (
    <AppLayout
      title="ZRA Taxpayer Information"
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
                ZRA Taxpayer Information
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="ZRA Taxpayer Information" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Taxpayer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Taxpayer Information
                </CardTitle>
                <CardDescription>
                  Primary taxpayer details as registered with ZRA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxpayer_tpin">
                      Taxpayer TPIN *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="taxpayer_tpin"
                        placeholder="1234567890"
                        maxLength={10}
                        value={data.taxpayer_tpin}
                        onChange={(e) => setData('taxpayer_tpin', e.target.value.toUpperCase())}
                        className={errors.taxpayer_tpin ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={validateTpin}
                        disabled={isValidatingTpin || !data.taxpayer_tpin}
                      >
                        {isValidatingTpin ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.taxpayer_tpin && (
                      <p className="text-sm text-red-600">{errors.taxpayer_tpin}</p>
                    )}
                    <p className="text-sm text-gray-500">10-character taxpayer identification number</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxpayer_name">
                      Taxpayer Name *
                    </Label>
                    <Input
                      id="taxpayer_name"
                      placeholder="Business or Individual Name"
                      value={data.taxpayer_name}
                      onChange={(e) => setData('taxpayer_name', e.target.value)}
                      className={errors.taxpayer_name ? 'border-red-500' : ''}
                    />
                    {errors.taxpayer_name && (
                      <p className="text-sm text-red-600">{errors.taxpayer_name}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_registration_number">
                      Business Registration Number
                    </Label>
                    <Input
                      id="business_registration_number"
                      placeholder="BRN123456789"
                      value={data.business_registration_number}
                      onChange={(e) => setData('business_registration_number', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_type">
                      Business Type
                    </Label>
                    <Select value={data.business_type} onValueChange={(value) => setData('business_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description">
                    Business Description
                  </Label>
                  <Textarea
                    id="business_description"
                    placeholder="Brief description of business activities"
                    value={data.business_description}
                    onChange={(e) => setData('business_description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration_date">
                      Registration Date
                    </Label>
                    <Input
                      id="registration_date"
                      type="date"
                      value={data.registration_date}
                      onChange={(e) => setData('registration_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_office">
                      Tax Office
                    </Label>
                    <Select value={data.tax_office} onValueChange={(value) => setData('tax_office', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tax office" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxOffices.map((office) => (
                          <SelectItem key={office} value={office}>
                            {office}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VAT Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  VAT Registration
                </CardTitle>
                <CardDescription>
                  Value Added Tax registration details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>VAT Registered</Label>
                    <p className="text-sm text-gray-500">Is this taxpayer registered for VAT?</p>
                  </div>
                  <Switch
                    checked={data.is_vat_registered}
                    onCheckedChange={(checked) => setData('is_vat_registered', checked)}
                  />
                </div>

                {data.is_vat_registered && (
                  <div className="space-y-2">
                    <Label htmlFor="vat_registration_number">
                      VAT Registration Number
                    </Label>
                    <Input
                      id="vat_registration_number"
                      placeholder="VAT123456789"
                      value={data.vat_registration_number}
                      onChange={(e) => setData('vat_registration_number', e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Primary contact details for the taxpayer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxpayer_phone">
                      Primary Phone *
                    </Label>
                    <Input
                      id="taxpayer_phone"
                      placeholder="+260 XXX XXX XXX"
                      value={data.taxpayer_phone}
                      onChange={(e) => setData('taxpayer_phone', e.target.value)}
                      className={errors.taxpayer_phone ? 'border-red-500' : ''}
                    />
                    {errors.taxpayer_phone && (
                      <p className="text-sm text-red-600">{errors.taxpayer_phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxpayer_email">
                      Primary Email *
                    </Label>
                    <Input
                      id="taxpayer_email"
                      type="email"
                      placeholder="taxpayer@company.com"
                      value={data.taxpayer_email}
                      onChange={(e) => setData('taxpayer_email', e.target.value)}
                      className={errors.taxpayer_email ? 'border-red-500' : ''}
                    />
                    {errors.taxpayer_email && (
                      <p className="text-sm text-red-600">{errors.taxpayer_email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_name">
                      Contact Person Name
                    </Label>
                    <Input
                      id="contact_person_name"
                      placeholder="John Doe"
                      value={data.contact_person_name}
                      onChange={(e) => setData('contact_person_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person_phone">
                      Contact Person Phone
                    </Label>
                    <Input
                      id="contact_person_phone"
                      placeholder="+260 XXX XXX XXX"
                      value={data.contact_person_phone}
                      onChange={(e) => setData('contact_person_phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_email">
                      Contact Person Email
                    </Label>
                    <Input
                      id="contact_person_email"
                      type="email"
                      placeholder="contact@company.com"
                      value={data.contact_person_email}
                      onChange={(e) => setData('contact_person_email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://www.company.com"
                      value={data.website}
                      onChange={(e) => setData('website', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Physical and postal addresses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="physical_address">
                    Physical Address *
                  </Label>
                  <Textarea
                    id="physical_address"
                    placeholder="Street address, city, province"
                    value={data.physical_address}
                    onChange={(e) => setData('physical_address', e.target.value)}
                    className={errors.taxpayer_address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.taxpayer_address && (
                    <p className="text-sm text-red-600">{errors.taxpayer_address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_address">
                    Postal Address
                  </Label>
                  <Textarea
                    id="postal_address"
                    placeholder="P.O. Box, city, postal code"
                    value={data.postal_address}
                    onChange={(e) => setData('postal_address', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Banking Information
                </CardTitle>
                <CardDescription>
                  Primary bank account details for tax payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">
                      Bank Name
                    </Label>
                    <Input
                      id="bank_name"
                      placeholder="Bank of Zambia"
                      value={data.bank_name}
                      onChange={(e) => setData('bank_name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_branch">
                      Bank Branch
                    </Label>
                    <Input
                      id="bank_branch"
                      placeholder="Main Branch"
                      value={data.bank_branch}
                      onChange={(e) => setData('bank_branch', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">
                    Bank Account Number
                  </Label>
                  <Input
                    id="bank_account_number"
                    placeholder="1234567890"
                    value={data.bank_account_number}
                    onChange={(e) => setData('bank_account_number', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Taxpayer Status
                </CardTitle>
                <CardDescription>
                  Current status and compliance information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Taxpayer</Label>
                    <p className="text-sm text-gray-500">Is this taxpayer currently active with ZRA?</p>
                  </div>
                  <Switch
                    checked={data.is_active_taxpayer}
                    onCheckedChange={(checked) => setData('is_active_taxpayer', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={processing}
              >
                Reset
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Taxpayer Information
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
