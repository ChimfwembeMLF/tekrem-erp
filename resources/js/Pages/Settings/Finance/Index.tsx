import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import {
  ArrowLeft,
  Settings,
  Smartphone,
  Shield,
  CreditCard,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  Key,
  Server,
  Database,
  Webhook,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MomoProvider {
  id: number;
  display_name: string;
  provider_code: string;
  is_active: boolean;
  health_status?: 'healthy' | 'degraded' | 'down';
  last_health_check?: string;
  supported_currencies: string[];
  fee_structure: {
    fixed_fee?: number;
    percentage_fee?: number;
  };
}

interface ZraConfiguration {
  id: number;
  environment: 'sandbox' | 'production';
  taxpayer_tpin: string;
  taxpayer_name: string;
  is_active: boolean;
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check?: string;
  last_token_refresh?: string;
}

interface Props {
  momoProviders: MomoProvider[];
  zraConfiguration?: ZraConfiguration;
  systemStats: {
    total_momo_transactions: number;
    total_zra_submissions: number;
    active_providers: number;
    pending_reconciliations: number;
  };
}

export default function FinanceSettings({ momoProviders, zraConfiguration, systemStats }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="outline" className="text-green-600 border-green-600">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Degraded</Badge>;
      case 'down':
        return <Badge variant="outline" className="text-red-600 border-red-600">Down</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600 border-gray-600">Unknown</Badge>;
    }
  };

  return (
    <AppLayout
      title="Finance Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('settings.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Finance Settings
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
      <Head title="Finance Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="momo">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Money
              </TabsTrigger>
              <TabsTrigger value="momo-providers">
                <Building className="h-4 w-4 mr-2" />
                Mobile Money Providers
              </TabsTrigger>
              <TabsTrigger value="zra">
                <Shield className="h-4 w-4 mr-2" />
                ZRA Smart Invoice
              </TabsTrigger>
              <TabsTrigger value="security">
                <Key className="h-4 w-4 mr-2" />
                Security & API
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">MoMo Transactions</CardTitle>
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.total_momo_transactions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total processed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">ZRA Submissions</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.total_zra_submissions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Invoices submitted</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.active_providers}</div>
                    <p className="text-xs text-muted-foreground">MoMo providers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Reconciliations</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{systemStats.pending_reconciliations}</div>
                    <p className="text-xs text-muted-foreground">Require attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* System Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      Mobile Money Status
                    </CardTitle>
                    <CardDescription>
                      Current status of MoMo providers and integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {momoProviders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No MoMo providers configured</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => router.visit(route('finance.momo.providers'))}
                          >
                            Configure Providers
                          </Button>
                        </div>
                      ) : (
                        momoProviders.map((provider) => (
                          <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(provider.health_status)}
                              <div>
                                <p className="font-medium">{provider.display_name}</p>
                                <p className="text-sm text-gray-500">{provider.provider_code}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(provider.health_status)}
                              {provider.is_active ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                              ) : (
                                <Badge variant="outline" className="text-gray-600 border-gray-600">Inactive</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      ZRA Smart Invoice Status
                    </CardTitle>
                    <CardDescription>
                      Current status of ZRA integration and compliance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!zraConfiguration ? (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>ZRA Smart Invoice not configured</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.visit(route('finance.zra.configuration'))}
                        >
                          Configure ZRA
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(zraConfiguration.health_status)}
                            <div>
                              <p className="font-medium">{zraConfiguration.taxpayer_name}</p>
                              <p className="text-sm text-gray-500">TPIN: {zraConfiguration.taxpayer_tpin}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(zraConfiguration.health_status)}
                            <Badge variant="outline" className={
                              zraConfiguration.environment === 'production' 
                                ? 'text-green-600 border-green-600' 
                                : 'text-yellow-600 border-yellow-600'
                            }>
                              {zraConfiguration.environment}
                            </Badge>
                          </div>
                        </div>
                        
                        {zraConfiguration.last_health_check && (
                          <p className="text-sm text-gray-500">
                            Last health check: {new Date(zraConfiguration.last_health_check).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Mobile Money Tab */}
            <TabsContent value="momo">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile Money Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage MoMo providers, API settings, and transaction processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.momo.providers'))}
                    >
                      <Building className="h-6 w-6" />
                      <span>Provider Management</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.momo.api'))}
                    >
                      <Server className="h-6 w-6" />
                      <span>API Configuration</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.momo.webhooks'))}
                    >
                      <Webhook className="h-6 w-6" />
                      <span>Webhook Settings</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.momo.reconciliation'))}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Reconciliation</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.momo.accounts'))}
                    >
                      <Database className="h-6 w-6" />
                      <span>Account Mapping</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.momo.audit'))}
                    >
                      <Activity className="h-6 w-6" />
                      <span>Audit & Monitoring</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mobile Money Providers Tab */}
            <TabsContent value="momo-providers">
              <div className="space-y-6">
                {/* Provider Management Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Mobile Money Providers
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.visit(route('finance.momo.providers'))}
                      >
                        Manage Providers
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Configure and manage mobile money service providers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {momoProviders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">No providers configured</p>
                          <p className="text-sm mb-4">Add your first mobile money provider to start processing payments</p>
                          <Button
                            onClick={() => router.visit(route('finance.momo.providers'))}
                          >
                            <Building className="h-4 w-4 mr-2" />
                            Add Provider
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {momoProviders.map((provider) => (
                            <Card key={provider.id} className="relative">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                      <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                      <CardTitle className="text-base">{provider.display_name}</CardTitle>
                                      <p className="text-sm text-muted-foreground">{provider.provider_code}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(provider.health_status)}
                                    {provider.is_active ? (
                                      <Badge variant="outline" className="text-green-600 border-green-600">
                                        Active
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-600 border-gray-600">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Supported Currencies</p>
                                    <div className="flex gap-1 mt-1">
                                      {provider.supported_currencies.map((currency) => (
                                        <Badge key={currency} variant="secondary" className="text-xs">
                                          {currency}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Fee Structure</p>
                                    <div className="text-sm mt-1">
                                      {provider.fee_structure.percentage_fee && (
                                        <span>{provider.fee_structure.percentage_fee}% + </span>
                                      )}
                                      {provider.fee_structure.fixed_fee && (
                                        <span>{provider.fee_structure.fixed_fee} fixed</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {provider.last_health_check && (
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground">Last Health Check</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(provider.last_health_check).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.visit(route('finance.momo.providers'))}
                  >
                    <Building className="h-6 w-6" />
                    <span className="text-sm">Add New Provider</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.visit(route('settings.finance.momo.api'))}
                  >
                    <Server className="h-6 w-6" />
                    <span className="text-sm">API Settings</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => router.visit(route('finance.momo.index'))}
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">View Transactions</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => {
                      // Test all provider connections
                      toast.promise(
                        fetch('/api/finance/momo/test-all-connections', { method: 'POST' }),
                        {
                          loading: 'Testing provider connections...',
                          success: 'All provider connections tested successfully',
                          error: 'Failed to test provider connections'
                        }
                      );
                    }}
                  >
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-sm">Test All Providers</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* ZRA Tab */}
            <TabsContent value="zra">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    ZRA Smart Invoice Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage ZRA integration, taxpayer settings, and compliance features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.zra.configuration'))}
                    >
                      <Settings className="h-6 w-6" />
                      <span>Basic Configuration</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.zra.taxpayer'))}
                    >
                      <Building className="h-6 w-6" />
                      <span>Taxpayer Information</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.zra.api'))}
                    >
                      <Server className="h-6 w-6" />
                      <span>API Settings</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.zra.tax-rates'))}
                    >
                      <DollarSign className="h-6 w-6" />
                      <span>Tax Rates</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.zra.automation'))}
                    >
                      <Activity className="h-6 w-6" />
                      <span>Automation Rules</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.zra.audit'))}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Audit & Compliance</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security & API Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Security & API Management
                  </CardTitle>
                  <CardDescription>
                    Manage API credentials, security settings, and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.api'))}
                    >
                      <Key className="h-6 w-6" />
                      <span>API Management</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.encryption'))}
                    >
                      <Shield className="h-6 w-6" />
                      <span>Encryption Settings</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.access'))}
                    >
                      <Eye className="h-6 w-6" />
                      <span>Access Control</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.audit'))}
                    >
                      <Activity className="h-6 w-6" />
                      <span>Security Audit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.backup'))}
                    >
                      <Database className="h-6 w-6" />
                      <span>Backup & Recovery</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.security.monitoring'))}
                    >
                      <Activity className="h-6 w-6" />
                      <span>Security Monitoring</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
