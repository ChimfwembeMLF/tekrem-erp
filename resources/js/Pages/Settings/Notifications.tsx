import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: string;
  email_from_name: string;
  email_from_address: string;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_username: string | null;
  smtp_password: string;
  smtp_encryption: string | null;
}

interface Props {
  settings: NotificationSettings;
  stats: {
    total_users: number;
    active_users: number;
    system_uptime: string;
    [key: string]: any;
  };
}

export default function Notifications({ settings, stats }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    email_notifications: settings.email_notifications,
    sms_notifications: settings.sms_notifications,
    push_notifications: settings.push_notifications,
    notification_frequency: settings.notification_frequency,
    email_from_name: settings.email_from_name,
    email_from_address: settings.email_from_address,
    smtp_host: settings.smtp_host || '',
    smtp_port: settings.smtp_port || 587,
    smtp_username: settings.smtp_username || '',
    smtp_password: '',
    smtp_encryption: settings.smtp_encryption || 'tls',
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    put(route('settings.notifications.update'));
  };

  const testEmailConnection = () => {
    alert('Test email feature coming soon!');
  };

  return (
    <AppLayout title={t('settings.notifications', 'Notification Settings')}>
      <Head title={t('settings.notifications', 'Notification Settings')} />

      <div className="py-12">
        <div className="sm:px-6 lg:px-8">
          <div className="">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('settings.notification_settings', 'Notification Settings')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t('settings.notification_settings_desc', 'Configure how your system sends notifications to users')}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V6h5v11z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Status</p>
                      <p className="text-lg font-bold text-green-600">
                        {data.email_notifications ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SMS Status</p>
                      <p className="text-lg font-bold text-purple-600">
                        {data.sms_notifications ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</p>
                      <p className="text-lg font-bold text-orange-600">{stats.system_uptime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-8">
                {/* Notification Channels */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Notification Channels
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Enable or disable different notification methods
                  </p>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Send notifications via email to users
                        </p>
                      </div>
                      <Checkbox
                        checked={data.email_notifications}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email_notifications', e.target.checked)}
                      />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          SMS Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Send notifications via SMS messages
                        </p>
                      </div>
                      <Checkbox
                        checked={data.sms_notifications}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('sms_notifications', e.target.checked)}
                      />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V6h5v11z" />
                          </svg>
                          Push Notifications
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Send browser push notifications
                        </p>
                      </div>
                      <Checkbox
                        checked={data.push_notifications}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('push_notifications', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* General Settings */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    General Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Configure general notification behavior
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InputLabel htmlFor="notification_frequency" value="Notification Frequency" />
                      <select
                        id="notification_frequency"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                        value={data.notification_frequency}
                        onChange={(e) => setData('notification_frequency', e.target.value)}
                      >
                        <option value="immediate">Immediate</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                      <InputError message={errors.notification_frequency} className="mt-2" />
                    </div>
                  </div>
                </div>

                {/* Email Configuration */}
                {data.email_notifications && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Email Configuration
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Configure email sending settings
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <InputLabel htmlFor="email_from_name" value="From Name" />
                        <TextInput
                          id="email_from_name"
                          type="text"
                          className="mt-1 block w-full"
                          value={data.email_from_name}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email_from_name', e.target.value)}
                          placeholder="Enter sender name"
                        />
                        <InputError message={errors.email_from_name} className="mt-2" />
                      </div>

                      <div>
                        <InputLabel htmlFor="email_from_address" value="From Email" />
                        <TextInput
                          id="email_from_address"
                          type="email"
                          className="mt-1 block w-full"
                          value={data.email_from_address}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setData('email_from_address', e.target.value)}
                          placeholder="Enter sender email"
                        />
                        <InputError message={errors.email_from_address} className="mt-2" />
                      </div>
                    </div>

                    {showAdvanced && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2 mb-4">
                          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Advanced settings - modify only if you know what you're doing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <InputLabel htmlFor="smtp_host" value="SMTP Host" />
                            <TextInput
                              id="smtp_host"
                              type="text"
                              className="mt-1 block w-full"
                              value={data.smtp_host}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_host', e.target.value)}
                              placeholder="smtp.example.com"
                            />
                            <InputError message={errors.smtp_host} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor="smtp_port" value="SMTP Port" />
                            <TextInput
                              id="smtp_port"
                              type="number"
                              className="mt-1 block w-full"
                              value={data.smtp_port.toString()}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_port', parseInt(e.target.value) || 587)}
                              placeholder="587"
                            />
                            <InputError message={errors.smtp_port} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor="smtp_username" value="SMTP Username" />
                            <TextInput
                              id="smtp_username"
                              type="text"
                              className="mt-1 block w-full"
                              value={data.smtp_username}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_username', e.target.value)}
                              placeholder="Enter username"
                            />
                            <InputError message={errors.smtp_username} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor="smtp_password" value="SMTP Password" />
                            <TextInput
                              id="smtp_password"
                              type="password"
                              className="mt-1 block w-full"
                              value={data.smtp_password}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setData('smtp_password', e.target.value)}
                              placeholder="Enter password"
                            />
                            <InputError message={errors.smtp_password} className="mt-2" />
                          </div>

                          <div>
                            <InputLabel htmlFor="smtp_encryption" value="SMTP Encryption" />
                            <select
                              id="smtp_encryption"
                              className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                              value={data.smtp_encryption}
                              onChange={(e) => setData('smtp_encryption', e.target.value)}
                            >
                              <option value="tls">TLS</option>
                              <option value="ssl">SSL</option>
                              <option value="">None</option>
                            </select>
                            <InputError message={errors.smtp_encryption} className="mt-2" />
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={testEmailConnection}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            Test Connection
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <PrimaryButton disabled={processing}>
                    {processing ? 'Saving...' : 'Save Settings'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}