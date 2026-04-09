
import { Link, Head, useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { AuthCard, FormInput, FormCheckbox, AuthButton, LinkButton } from '@/Components/Auth';
import ReCaptcha from '@/Components/ReCaptcha';


export default function Register() {
  const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
    company_name: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    password_confirmation: '',
    terms: false,
    recaptcha_token: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState('');

  // Optionally get recaptcha config from props if needed
  // const recaptcha = ...

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setData(name, type === 'checkbox' ? checked : value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Set reCAPTCHA token if enabled
    if (recaptchaToken) {
      setData('recaptcha_token', recaptchaToken);
    }
    post('/register-tenant', {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        router.visit('/dashboard');
      },
    });
  };

  return (
    <AuthCard title="Register" description="Create a new account to get started.">
      <Head title="Register" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Company Name"
          id="company_name"
          name="company_name"
          type="text"
          value={data.company_name}
          onChange={handleChange}
          error={errors.company_name}
          required
        />
        <FormInput
          label="Admin Name"
          id="admin_name"
          name="admin_name"
          type="text"
          value={data.admin_name}
          onChange={handleChange}
          error={errors.admin_name}
          required
        />
        <FormInput
          label="Admin Email"
          id="admin_email"
          name="admin_email"
          type="email"
          value={data.admin_email}
          onChange={handleChange}
          error={errors.admin_email}
          required
        />
        <FormInput
          label="Password"
          id="admin_password"
          name="admin_password"
          type="password"
          value={data.admin_password}
          onChange={handleChange}
          error={errors.admin_password}
          required
        />
        {/* Add password confirmation if needed */}
        <FormInput
          label="Confirm Password"
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          value={data.password_confirmation}
          onChange={handleChange}
          error={errors.password_confirmation}
          required
        />
        {/* Terms checkbox if needed */}
        <FormCheckbox
          id="terms"
          name="terms"
          checked={data.terms}
          onChange={checked => setData('terms', checked)}
          label="I agree to the Terms and Privacy Policy"
          required
        />
        {errors.general && <div className="text-red-500">{errors.general}</div>}
        {Object.entries(errors).map(
          ([field, msg]) =>
            field !== 'general' && (
              <div key={field} className="text-red-500">
                {field}: {msg as string}
              </div>
            )
        )}
        {wasSuccessful && <div className="text-green-600">Registration successful!</div>}
        <AuthButton type="submit" isLoading={processing}>Register</AuthButton>
        <div className="text-center">
          <LinkButton href="/login">Already have an account? Sign in</LinkButton>
        </div>
      </form>
    </AuthCard>
  );
}

