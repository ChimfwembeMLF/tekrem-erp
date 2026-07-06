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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  Key,
  FileText,
  Eye,
  Link2,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface PawaPayStatus {
  env: string;
  configured: boolean;
  provider_label: string;
  base_url: string;
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
  pawapay: PawaPayStatus;
  zraConfiguration?: ZraConfiguration;
  systemStats: {
    total_momo_transactions: number;
    total_zra_submissions: number;
    payments_configured: boolean;
    pending_reconciliations: number;
  };
}

export default function FinanceSettings({ pawapay, zraConfiguration, systemStats }: Props) {
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
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Admin Only
          </Badge>
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
              <TabsTrigger value="payments">
                <Smartphone className="h-4 w-4 mr-2" />
                Payments
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
                    <CardTitle className="text-sm font-medium">Payments</CardTitle>
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {systemStats.payments_configured ? 'PawaPay' : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {systemStats.payments_configured ? 'Ready for collections' : 'Not configured'}
                    </p>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={pawapay.configured ? 'border-green-500/30' : 'border-amber-500/30'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      {pawapay.provider_label}
                    </CardTitle>
                    <CardDescription>
                      Mobile money collections and payouts via PawaPay (MTN, Airtel, Zamtel)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{pawapay.env}</p>
                        <p className="text-sm text-gray-500 font-mono text-xs">{pawapay.base_url}</p>
                      </div>
                      <Badge variant="outline" className={pawapay.configured ? 'text-green-600 border-green-600' : 'text-amber-600 border-amber-600'}>
                        {pawapay.configured ? 'Configured' : 'Not configured'}
                      </Badge>
                    </div>
                    {!pawapay.configured && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.visit(route('settings.finance.payments.pawapay'))}
                      >
                        Configure PawaPay
                      </Button>
                    )}
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

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Payments (PawaPay)
                  </CardTitle>
                  <CardDescription>
                    Configure PawaPay and manage mobile money transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.payments.pawapay'))}
                    >
                      <Settings className="h-6 w-6" />
                      <span>PawaPay Configuration</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.momo.dashboard'))}
                    >
                      <Activity className="h-6 w-6" />
                      <span>Payments Dashboard</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.momo.index'))}
                    >
                      <Eye className="h-6 w-6" />
                      <span>Transactions</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('settings.finance.commerce'))}
                    >
                      <Link2 className="h-6 w-6" />
                      <span>Commerce → Finance</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.visit(route('finance.momo.reconciliation'))}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Reconciliation</span>
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
                      <Shield className="h-6 w-6" />
                      <span>Taxpayer Information</span>
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
