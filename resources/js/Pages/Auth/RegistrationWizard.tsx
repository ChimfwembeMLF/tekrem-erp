import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import CollapsibleModules from '@/Components/CollapsibleModules';
import { 
  CheckCircle2, 
  Plus, 
  X, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Package as PackageIcon,
  Zap,
  Shield,
  HelpCircle,
  Loader2,
  Check,
  DollarSign
} from 'lucide-react';
import axios from 'axios';
import tekremLogo from '../../../../public/tekrem-logo.png';
// Types
interface Addon { 
  id: number; 
  name: string; 
  price: number; 
  description?: string; 
}

interface Module { 
  id: number; 
  name: string; 
  price: number; 
  description?: string; 
  addons?: Addon[]; 
}

interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  user_limit?: number;
  storage_limit_gb?: number;
  email_limit?: number;
  modules?: Module[];
  features?: string[];
}

interface RegistrationWizardProps {
  packages: Package[];
  preselectedPackage?: Package | null;
  trialDays?: number | null;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  company_name?: string;
  phone?: string;
  package?: string;
}

const steps = [
  { id: 0, name: 'Account Info', icon: User, description: 'Personal details' },
  { id: 1, name: 'Select Package', icon: PackageIcon, description: 'Choose your plan' },
  { id: 2, name: 'Customize Limits', icon: Zap, description: 'Adjust resources' },
  { id: 3, name: 'Review & Submit', icon: CheckCircle2, description: 'Confirm details' },
];

const RegistrationWizard: React.FC<RegistrationWizardProps> = ({ packages, preselectedPackage, trialDays }) => {
  const [step, setStep] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(preselectedPackage || null);
  const [selectedModules, setSelectedModules] = useState<Module[]>(preselectedPackage?.modules || []);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [upgrades, setUpgrades] = useState({ users: 0, storage: 0, emails: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');
  // Add missing state for trial/coupon/discount
  const [trialSelected, setTrialSelected] = useState(!!trialDays);
  const [trialPeriod, setTrialPeriod] = useState<number>(trialDays || 0);
  const [discountAmount, setDiscountAmount] = useState(0);
  // Coupon state for coupon UI
  const [coupon, setCoupon] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    company_name: '',
    company_type: '',
    phone: '',
    address: '',
  });

  // Validation rules
  const validateField = useCallback((field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name should only contain letters';
        return undefined;
      
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain a lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain an uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain a number';
        return undefined;
      
      case 'password_confirmation':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return undefined;
      
      case 'company_name':
        if (!value.trim()) return 'Company name is required';
        if (value.trim().length < 2) return 'Company name must be at least 2 characters';
        return undefined;
      
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) return 'Invalid phone number format';
        return undefined;
      
      default:
        return undefined;
    }
  }, [form.password]);

  // Real-time validation
  useEffect(() => {
    const newErrors: FormErrors = {};
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        const error = validateField(field, form[field as keyof typeof form]);
        if (error) newErrors[field as keyof FormErrors] = error;
      }
    });
    setErrors(newErrors);
  }, [form, touched, validateField]);

  // Calculate total price
  const calculateTotal = useCallback(() => {
    if (trialSelected) return 0;
    const basePrice = Number(selectedPackage?.price) || 0;
    const modulesPrice = selectedModules.reduce((sum, mod) => sum + (Number(mod.price) || 0), 0);
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
    const upgradesPrice = (Number(upgrades.users) * 50) + (Number(upgrades.storage) * 10) + (Number(upgrades.emails) * 5);
    const subtotal = basePrice + modulesPrice + addonsPrice + upgradesPrice;
    const discount = Number(discountAmount) || 0;
    const total = Math.max(0, subtotal - discount);
    return isNaN(total) ? 0 : total;
  }, [selectedPackage, selectedModules, selectedAddons, upgrades, trialSelected, discountAmount]);

  // Calculate progress
  const calculateProgress = useCallback(() => {
    return ((step + 1) / steps.length) * 100;
  }, [step]);

  // Step validation
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 0) {
      const requiredFields = ['name', 'email', 'password', 'password_confirmation', 'company_name'];
      const stepErrors: FormErrors = {};
      let isValid = true;

      requiredFields.forEach(field => {
        const error = validateField(field, form[field as keyof typeof form]);
        if (error) {
          stepErrors[field as keyof FormErrors] = error;
          isValid = false;
        }
      });

      setErrors(stepErrors);
      setTouched(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
      
      if (!isValid) {
        toast.error('Please fix the errors before continuing');
      }
      return isValid;
    }

    if (currentStep === 1) {
      if (!selectedPackage) {
        toast.error('Please select a package to continue');
        return false;
      }
    }

    return true;
  };

  // Step navigation with validation
  const nextStep = () => {
    if (validateStep(step)) {
      setAnimationDirection('forward');
      setStep(s => Math.min(s + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setAnimationDirection('backward');
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setAnimationDirection('backward');
      setStep(targetStep);
    } else if (targetStep > step) {
      if (validateStep(step)) {
        setAnimationDirection('forward');
        setStep(targetStep);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle field changes
  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched(t => ({ ...t, [field]: true }));
  };

  // Addon toggle
  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.some(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  // Handle package selection
  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setSelectedModules(pkg.modules || []);
    setSelectedAddons([]);
    setUpgrades({ users: 0, storage: 0, emails: 0 });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...form,
        package_id: selectedPackage?.id,
        modules: selectedModules.map(m => m.id),
        addons: selectedAddons.map(a => a.id),
        upgrades,
        total: calculateTotal(),
        coupon: coupon || undefined,
        trial: trialSelected,
        trial_days: trialSelected ? trialPeriod : undefined,
      };
        // Coupon input UI (add to step 1 or summary sidebar as needed)
        // Example: Add to summary sidebar before Total

      // Send to backend
      const response = await axios?.post
        ? await axios.post('/register', payload)
        : await (await import('axios')).default.post('/api/register', payload);
      toast.success('Registration submitted successfully!', {
        description: 'Check your email for confirmation.',
      });
      // Redirect to dashboard after registration (SPA)
      router.visit('/dashboard');
    } catch (error) {
      let message = 'Please try again or contact support.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error('Registration failed', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Account Info
  const renderAccountInfo = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
              <p className="text-sm opacity-90 mt-1">Tell us about yourself</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <User className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={e => handleFieldChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              className={errors.name && touched.name ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={!!errors.name && touched.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && touched.name && (
              <p id="name-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={e => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              className={errors.email && touched.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={!!errors.email && touched.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && touched.email && (
              <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                className={errors.password && touched.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                aria-invalid={!!errors.password && touched.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && touched.password && (
              <p id="password-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password_confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password_confirmation}
                onChange={e => handleFieldChange('password_confirmation', e.target.value)}
                onBlur={() => handleFieldBlur('password_confirmation')}
                className={errors.password_confirmation && touched.password_confirmation ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
                aria-invalid={!!errors.password_confirmation && touched.password_confirmation}
                aria-describedby={errors.password_confirmation ? 'password-confirmation-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password_confirmation && touched.password_confirmation && (
              <p id="password-confirmation-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password_confirmation}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Company Information</CardTitle>
              <p className="text-sm opacity-90 mt-1">Your business details</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company_name"
              placeholder="Acme Corporation"
              value={form.company_name}
              onChange={e => handleFieldChange('company_name', e.target.value)}
              onBlur={() => handleFieldBlur('company_name')}
              className={errors.company_name && touched.company_name ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={!!errors.company_name && touched.company_name}
              aria-describedby={errors.company_name ? 'company-name-error' : undefined}
            />
            {errors.company_name && touched.company_name && (
              <p id="company-name-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.company_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_type">Company Type</Label>
            <Select
              value={form.company_type}
              onValueChange={value => handleFieldChange('company_type', value)}
            >
              <SelectTrigger id="company_type">
                <SelectValue placeholder="Select company type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small Business</SelectItem>
                <SelectItem value="medium">Medium Enterprise</SelectItem>
                <SelectItem value="large">Large Enterprise</SelectItem>
                <SelectItem value="nonprofit">Non-Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+260 XXX XXX XXX"
              value={form.phone}
              onChange={e => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleFieldBlur('phone')}
              className={errors.phone && touched.phone ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-invalid={!!errors.phone && touched.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && touched.phone && (
              <p id="phone-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </Label>
            <Input
              id="address"
              placeholder="123 Main St, Lusaka"
              value={form.address}
              onChange={e => handleFieldChange('address', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your information is encrypted and secure. We never share your data with third parties.
        </AlertDescription>
      </Alert>
    </div>
  );

  // Step 2: Select Package
  const renderSelectPackage = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Choose Your Package</CardTitle>
              <p className="text-sm opacity-90 mt-1">Select the perfect plan for your needs</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <PackageIcon className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <Card
                key={pkg.id}
                className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-xl bg-card text-card-foreground ${
                  selectedPackage?.id === pkg.id 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]' 
                    : 'border-secondary/40 hover:border-primary/50'
                }`}
                onClick={() => handlePackageSelect(pkg)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePackageSelect(pkg);
                  }
                }}
                aria-pressed={selectedPackage?.id === pkg.id}
              >
                <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground relative overflow-hidden">
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-white text-primary rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    {pkg.name}
                    {pkg.slug === 'premium' && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-100 border-amber-500/30">
                        Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm opacity-90 mt-1">{pkg.description}</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {pkg.price === 0 ? 'Free' : `ZMW ${pkg.price.toLocaleString()}`}
                    </span>
                    {pkg.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span><strong>{pkg.user_limit}</strong> users included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <PackageIcon className="w-4 h-4 text-muted-foreground" />
                      <span><strong>{pkg.storage_limit_gb}</strong> GB storage</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span><strong>{pkg.email_limit?.toLocaleString()}</strong> emails/month</span>
                    </div>
                  </div>

                  {pkg.modules && pkg.modules.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Included Modules
                        </h4>
                        <CollapsibleModules modules={pkg.modules} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {!selectedPackage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a package to continue
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Step 3: Customize Limits
  const renderSelectLimits = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Customize Your Limits</CardTitle>
              <p className="text-sm opacity-90 mt-1">Scale your resources as needed</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {selectedPackage ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Users */}
                <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Users</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Additional users: ZMW 50/user/month</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Included:</span>
                        <span className="font-medium">{selectedPackage.user_limit}</span>
                      </div>
                      <Label htmlFor="additional-users">Additional Users</Label>
                      <Input
                        id="additional-users"
                        type="number"
                        min={0}
                        max={1000}
                        value={upgrades.users}
                        onChange={e => setUpgrades(u => ({ ...u, users: Math.max(0, Number(e.target.value)) }))}
                        className="text-center font-semibold"
                      />
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-primary">{(selectedPackage.user_limit || 0) + upgrades.users}</span>
                      </div>
                      {upgrades.users > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +ZMW {upgrades.users * 50}/month
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Storage */}
                <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageIcon className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Storage</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Additional storage: ZMW 10/GB/month</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Included:</span>
                        <span className="font-medium">{selectedPackage.storage_limit_gb} GB</span>
                      </div>
                      <Label htmlFor="additional-storage">Additional Storage (GB)</Label>
                      <Input
                        id="additional-storage"
                        type="number"
                        min={0}
                        max={10000}
                        value={upgrades.storage}
                        onChange={e => setUpgrades(u => ({ ...u, storage: Math.max(0, Number(e.target.value)) }))}
                        className="text-center font-semibold"
                      />
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-primary">{(selectedPackage.storage_limit_gb || 0) + upgrades.storage} GB</span>
                      </div>
                      {upgrades.storage > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +ZMW {upgrades.storage * 10}/month
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Emails */}
                <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-br from-background to-muted/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Emails</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Additional emails: ZMW 5/1000 emails/month</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Included:</span>
                        <span className="font-medium">{selectedPackage.email_limit?.toLocaleString()}</span>
                      </div>
                      <Label htmlFor="additional-emails">Additional Emails (x1000)</Label>
                      <Input
                        id="additional-emails"
                        type="number"
                        min={0}
                        max={1000}
                        value={upgrades.emails}
                        onChange={e => setUpgrades(u => ({ ...u, emails: Math.max(0, Number(e.target.value)) }))}
                        className="text-center font-semibold"
                      />
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-primary">{((selectedPackage.email_limit || 0) + (upgrades.emails * 1000)).toLocaleString()}</span>
                      </div>
                      {upgrades.emails > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +ZMW {upgrades.emails * 5}/month
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can adjust these limits at any time from your account settings. Changes will be reflected in your next billing cycle.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a package first
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Step 4: Review & Submit
  const renderReview = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
        <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Review Your Information</CardTitle>
              <p className="text-sm opacity-90 mt-1">Verify everything before submitting</p>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">Full Name</span>
                <p className="font-medium">{form.name || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p className="font-medium">{form.email || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p className="font-medium">{form.phone || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Address</span>
                <p className="font-medium">{form.address || '—'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">Company Name</span>
                <p className="font-medium">{form.company_name || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Company Type</span>
                <p className="font-medium capitalize">{form.company_type || '—'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Package & Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <PackageIcon className="w-5 h-5 text-primary" />
              Package & Resources
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Selected Package</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {selectedPackage?.name || 'None'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPackage?.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Users</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {(selectedPackage?.user_limit || 0) + upgrades.users}
                  </p>
                  {upgrades.users > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{upgrades.users} additional
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PackageIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Storage</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {(selectedPackage?.storage_limit_gb || 0) + upgrades.storage} GB
                  </p>
                  {upgrades.storage > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{upgrades.storage} GB additional
                    </p>
                  )}
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Total Emails</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {((selectedPackage?.email_limit || 0) + (upgrades.emails * 1000)).toLocaleString()}
                  </p>
                  {upgrades.emails > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +{(upgrades.emails * 1000).toLocaleString()} additional
                    </p>
                  )}
                </div>
              </div>

              {selectedModules.length > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground mb-2 block">Included Modules</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedModules.map(mod => (
                      <Badge key={mod.id} variant="outline">
                        {mod.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAddons.length > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground mb-2 block">Selected Add-ons</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedAddons.map(addon => (
                      <Badge key={addon.id} variant="outline">
                        {addon.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Pricing Summary */}
          <Card className="border-secondary/40 shadow-sm bg-card text-card-foreground">
            <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Pricing Summary</CardTitle>
                </div>
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Package ({selectedPackage?.name})</span>
                  <span className="font-medium">ZMW {selectedPackage?.price.toLocaleString() || 0}</span>
                </div>
                {upgrades.users > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Additional Users ({upgrades.users})</span>
                    <span className="font-medium">ZMW {(upgrades.users * 50).toLocaleString()}</span>
                  </div>
                )}
                {upgrades.storage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Additional Storage ({upgrades.storage} GB)</span>
                    <span className="font-medium">ZMW {(upgrades.storage * 10).toLocaleString()}</span>
                  </div>
                )}
                {upgrades.emails > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Additional Emails ({upgrades.emails * 1000} emails)</span>
                    <span className="font-medium">ZMW {(upgrades.emails * 5).toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount Applied</span>
                    <span className="font-medium">-ZMW {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {trialSelected && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Free Trial ({trialPeriod} days)</span>
                    <span className="font-medium">-100%</span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Monthly Cost</span>
                  <span className="text-primary">
                    {trialSelected ? (
                      <span className="text-green-600">ZMW 0</span>
                    ) : (
                      <>ZMW {calculateTotal().toLocaleString()}</>
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full h-12 text-base font-semibold" 
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Registration...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete Registration
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By completing registration, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <img src={tekremLogo} className='w-64' alt="Tekrem Logo" />
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Head title="Register - Complete Your Account" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main wizard content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Create Your Account</h1>
                <span className="text-sm text-muted-foreground">
                  Step {step + 1} of {steps.length}
                </span>
              </div>
              <Progress value={calculateProgress()} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex justify-between items-center overflow-x-auto pb-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const isCompleted = i < step;
                const isCurrent = i === step;
                
                return (
                  <div key={s.id} className="flex items-center flex-1">
                    <button
                      onClick={() => goToStep(i)}
                      disabled={i > step}
                      className={`flex flex-col items-center gap-2 transition-all duration-200 ${
                        i <= step ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isCompleted ? 'bg-primary text-primary-foreground shadow-lg' : ''}
                        ${isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110' : ''}
                        ${!isCompleted && !isCurrent ? 'bg-muted text-muted-foreground' : ''}
                      `}>
                        {isCompleted ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className={`text-xs font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                          {s.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground hidden sm:block">
                          {s.description}
                        </div>
                      </div>
                    </button>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step content */}
            <div>
              {step === 0 && renderAccountInfo()}
              {step === 1 && renderSelectPackage()}
              {step === 2 && renderSelectLimits()}
              {step === 3 && renderReview()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 0}
                className="min-w-[120px]"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  className="min-w-[120px]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="w-[120px]" /> // Spacer for alignment
              )}
            </div>
          </div>

          {/* Sticky summary sidebar (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
                <CardHeader className="border rounded-t-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                    </div>
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <Info className="w-4 h-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {form.name && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <User className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">Account Holder</div>
                        <div className="font-medium truncate">{form.name}</div>
                        {form.email && (
                          <div className="text-xs text-muted-foreground truncate">{form.email}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {form.company_name && (
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Building2 className="w-4 h-4 text-primary mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">Company</div>
                        <div className="font-medium truncate">{form.company_name}</div>
                        {form.company_type && (
                          <div className="text-xs text-muted-foreground capitalize">{form.company_type}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPackage && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <PackageIcon className="w-4 h-4 text-primary" />
                          <span className="font-semibold">Package Details</span>
                        </div>
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="font-medium text-primary">{selectedPackage.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {selectedPackage.description}
                          </div>
                          <div className="text-lg font-bold mt-2">
                            ZMW {selectedPackage.price.toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground">/month</span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Users</span>
                            <span className="font-medium">
                              {(selectedPackage.user_limit || 0) + upgrades.users}
                              {upgrades.users > 0 && (
                                <span className="text-primary ml-1">(+{upgrades.users})</span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Storage</span>
                            <span className="font-medium">
                              {(selectedPackage.storage_limit_gb || 0) + upgrades.storage} GB
                              {upgrades.storage > 0 && (
                                <span className="text-primary ml-1">(+{upgrades.storage} GB)</span>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Emails</span>
                            <span className="font-medium">
                              {((selectedPackage.email_limit || 0) + (upgrades.emails * 1000)).toLocaleString()}
                              {upgrades.emails > 0 && (
                                <span className="text-primary ml-1">(+{upgrades.emails * 1000})</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {(upgrades.users > 0 || upgrades.storage > 0 || upgrades.emails > 0) && (
                          <>
                            <Separator />
                            <div className="text-sm space-y-1">
                              {upgrades.users > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>+ Users upgrade</span>
                                  <span>ZMW {(upgrades.users * 50).toLocaleString()}</span>
                                </div>
                              )}
                              {upgrades.storage > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>+ Storage upgrade</span>
                                  <span>ZMW {(upgrades.storage * 10).toLocaleString()}</span>
                                </div>
                              )}
                              {upgrades.emails > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                  <span>+ Email upgrade</span>
                                  <span>ZMW {(upgrades.emails * 5).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        <Separator />
                        {/* Coupon input */}
                        <div className="flex flex-col gap-2 pb-2">
                          <Label htmlFor="coupon" className="text-sm font-medium">Coupon Code</Label>
                          <div className="flex gap-2">
                            <Input
                              id="coupon"
                              placeholder="Enter coupon code"
                              value={coupon}
                              onChange={e => setCoupon(e.target.value)}
                              className="flex-1"
                            />
                            {/* Optionally, add a button to validate coupon */}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">ZMW {calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                          Billed monthly
                        </div>
                      </div>
                    </>
                  )}

                  {!selectedPackage && step > 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Select a package to see pricing details
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">Need Help?</div>
                      <p className="text-xs text-muted-foreground">
                        Our support team is available 24/7 to assist you with your registration.
                      </p>
                      <Button variant="link" className="h-auto p-0 text-xs" asChild>
                        <a href="mailto:support@example.com">Contact Support</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">Money-Back Guarantee</div>
                      <p className="text-xs text-muted-foreground">
                        Not satisfied? Get a full refund within 30 days, no questions asked.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;