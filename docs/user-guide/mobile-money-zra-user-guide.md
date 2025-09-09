# TekRem ERP - Mobile Money & ZRA Smart Invoice User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Mobile Money Features](#mobile-money-features)
4. [ZRA Smart Invoice Features](#zra-smart-invoice-features)
5. [Settings & Configuration](#settings--configuration)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

## Introduction

TekRem ERP now includes comprehensive Mobile Money (MoMo) integration and ZRA Smart Invoice compliance features designed specifically for Zambian businesses. These features enable:

- **Mobile Money Integration**: Accept payments and process payouts through MTN MoMo, Airtel Money, and Zamtel Money
- **ZRA Smart Invoice Compliance**: Automatically submit invoices to ZRA and maintain tax compliance
- **Automated Reconciliation**: Match transactions and maintain accurate financial records
- **Real-time Notifications**: Stay informed about transaction status and compliance updates

## Getting Started

### Prerequisites

Before using these features, ensure you have:

1. **Admin Access**: You need admin permissions to configure the integrations
2. **Provider Accounts**: Active accounts with mobile money providers (MTN, Airtel, Zamtel)
3. **ZRA Registration**: Valid ZRA taxpayer registration with TPIN
4. **API Credentials**: Obtained from respective service providers

### Initial Setup

1. **Navigate to Settings**: Go to Settings → Finance in the main navigation
2. **Configure Providers**: Set up your mobile money provider credentials
3. **Setup ZRA**: Configure your taxpayer information and API credentials
4. **Test Connections**: Verify all integrations are working correctly

## Mobile Money Features

### Dashboard Overview

The Mobile Money dashboard provides:
- **Transaction Statistics**: Total, completed, pending, and failed transactions
- **Success Rates**: Performance metrics for each provider
- **Recent Activity**: Latest transaction updates
- **Provider Status**: Real-time status of each mobile money provider

### Processing Payments

#### Creating a Payment Request

1. **Navigate to Finance → Mobile Money → Transactions**
2. **Click "New Payment"**
3. **Fill in the details**:
   - Provider: Select MTN, Airtel, or Zamtel
   - Amount: Enter payment amount in ZMW
   - Customer Phone: Use format 260XXXXXXXXX
   - Description: Brief payment description
   - Reference: Optional external reference

4. **Submit the request**
5. **Monitor status**: Track payment progress in real-time

#### Payment Status Flow

```
Pending → Processing → Completed
                   ↘ Failed
```

- **Pending**: Payment request created, awaiting customer action
- **Processing**: Customer has approved, payment being processed
- **Completed**: Payment successfully processed
- **Failed**: Payment failed (insufficient funds, timeout, etc.)

### Processing Payouts

#### Creating a Payout

1. **Navigate to Finance → Mobile Money → Payouts**
2. **Click "New Payout"**
3. **Enter recipient details**:
   - Provider: Select appropriate mobile money provider
   - Amount: Payout amount in ZMW
   - Recipient Phone: Customer's mobile number
   - Reason: Purpose of the payout (refund, payment, etc.)

4. **Review and confirm**
5. **Track payout status**

### Transaction Management

#### Viewing Transaction Details

- **Transaction List**: View all transactions with filtering options
- **Status Filtering**: Filter by pending, completed, or failed
- **Provider Filtering**: View transactions by specific provider
- **Date Range**: Filter transactions by date range
- **Search**: Search by phone number, reference, or description

#### Transaction Actions

- **View Details**: See complete transaction information
- **Check Status**: Manually refresh transaction status
- **Download Receipt**: Generate transaction receipt
- **Add Notes**: Add internal notes to transactions

### Reconciliation

#### Auto Reconciliation

The system automatically reconciles completed transactions with your chart of accounts:

- **Revenue Recognition**: Payments are posted to appropriate revenue accounts
- **Fee Tracking**: Provider fees are automatically calculated and recorded
- **GL Integration**: All transactions create corresponding general ledger entries

#### Manual Reconciliation

For transactions requiring manual review:

1. **Navigate to Finance → Mobile Money → Reconciliation**
2. **Review unreconciled transactions**
3. **Match with bank statements**
4. **Confirm reconciliation**
5. **Add reconciliation notes**

## ZRA Smart Invoice Features

### Dashboard Overview

The ZRA dashboard shows:
- **Submission Statistics**: Total, submitted, approved, and failed invoices
- **Compliance Status**: Current compliance standing with ZRA
- **Recent Submissions**: Latest invoice submissions
- **Approval Rates**: Success rates for ZRA submissions

### Invoice Submission

#### Automatic Submission

When enabled, invoices are automatically submitted to ZRA when:
- Invoice is marked as final
- All required tax information is complete
- Customer details include valid TPIN (for B2B transactions)

#### Manual Submission

1. **Navigate to Finance → Invoices**
2. **Select an invoice**
3. **Click "Submit to ZRA"**
4. **Review submission details**
5. **Confirm submission**
6. **Monitor approval status**

### ZRA Invoice Status Flow

```
Draft → Submitted → Approved
              ↘ Rejected
```

- **Draft**: Invoice created but not yet submitted
- **Submitted**: Invoice sent to ZRA, awaiting approval
- **Approved**: ZRA has approved the invoice
- **Rejected**: ZRA has rejected the invoice (requires correction)

### QR Code Management

#### Viewing QR Codes

1. **Navigate to Finance → ZRA Smart Invoices**
2. **Select an approved invoice**
3. **View QR code in invoice details**
4. **Download QR code image**

#### Using QR Codes

- **Customer Verification**: Customers can scan QR codes to verify invoice authenticity
- **Tax Compliance**: QR codes prove ZRA approval
- **Audit Trail**: QR codes provide complete audit trail

### Compliance Reporting

#### Monthly Compliance Reports

- **Submission Summary**: Total invoices submitted vs. required
- **Approval Rates**: Percentage of approved submissions
- **Outstanding Issues**: Invoices requiring attention
- **Compliance Score**: Overall compliance rating

#### Export Options

- **CSV Export**: For spreadsheet analysis
- **PDF Reports**: For official documentation
- **Excel Format**: For detailed analysis

## Settings & Configuration

### Mobile Money Configuration

#### Provider Setup

**MTN MoMo Configuration:**
1. **API Key**: Your MTN API key
2. **API Secret**: Your MTN API secret
3. **Subscription Key**: MTN subscription key
4. **Environment**: Sandbox or Production

**Airtel Money Configuration:**
1. **Client ID**: Your Airtel client ID
2. **Client Secret**: Your Airtel client secret
3. **Environment**: Test or Live

**Zamtel Money Configuration:**
1. **Merchant Code**: Your Zamtel merchant code
2. **API Key**: Your Zamtel API key
3. **Environment**: Test or Production

#### Security Settings

- **Webhook Secret**: For securing webhook communications
- **Rate Limiting**: Configure API request limits
- **IP Whitelisting**: Restrict access to specific IP addresses
- **Encryption**: Enable data encryption for sensitive information

### ZRA Configuration

#### Taxpayer Information

1. **TPIN**: Your 10-digit taxpayer identification number
2. **Business Name**: Registered business name
3. **Business Address**: Physical business address
4. **Contact Information**: Phone and email for ZRA communications
5. **VAT Registration**: VAT number if VAT registered

#### API Configuration

1. **Username**: ZRA API username
2. **Password**: ZRA API password
3. **Environment**: Sandbox or Production
4. **Timeout Settings**: API request timeout configuration

### Notification Settings

#### Email Notifications

Configure email alerts for:
- **Transaction Completions**: Payment and payout confirmations
- **Failed Transactions**: Immediate failure notifications
- **ZRA Approvals**: Invoice approval confirmations
- **Compliance Alerts**: Monthly compliance summaries

#### SMS Notifications

Set up SMS alerts for:
- **Critical Failures**: Immediate SMS for failed transactions
- **Daily Summaries**: End-of-day transaction summaries
- **Compliance Reminders**: Monthly compliance reminders

## Troubleshooting

### Common Mobile Money Issues

#### Payment Failures

**Issue**: Customer payment fails
**Solutions**:
- Verify customer has sufficient funds
- Check phone number format (260XXXXXXXXX)
- Ensure provider service is available
- Verify API credentials are correct

#### Connection Issues

**Issue**: Cannot connect to provider API
**Solutions**:
- Check internet connectivity
- Verify API credentials
- Test in sandbox environment first
- Contact provider support if needed

### Common ZRA Issues

#### Submission Failures

**Issue**: Invoice submission to ZRA fails
**Solutions**:
- Verify TPIN is correct and active
- Check all required fields are completed
- Ensure tax calculations are accurate
- Verify ZRA API credentials

#### Approval Delays

**Issue**: ZRA approval taking too long
**Solutions**:
- Check ZRA system status
- Verify invoice data is complete and accurate
- Contact ZRA support for status updates
- Review submission for any errors

### Getting Help

#### Support Channels

1. **In-App Help**: Click the help icon for contextual assistance
2. **Documentation**: Comprehensive guides and API documentation
3. **Support Tickets**: Submit support requests through the system
4. **Training**: Schedule training sessions for your team

#### Log Files

Access detailed logs for troubleshooting:
- **Transaction Logs**: Detailed payment and payout logs
- **API Logs**: Request and response logs for debugging
- **Error Logs**: Comprehensive error tracking
- **Audit Logs**: Complete audit trail for compliance

## Best Practices

### Mobile Money Best Practices

1. **Test Thoroughly**: Always test in sandbox before going live
2. **Monitor Regularly**: Check transaction status regularly
3. **Reconcile Daily**: Perform daily reconciliation
4. **Keep Records**: Maintain detailed transaction records
5. **Customer Communication**: Keep customers informed of payment status

### ZRA Compliance Best Practices

1. **Submit Promptly**: Submit invoices to ZRA as soon as they're finalized
2. **Verify Data**: Double-check all tax calculations before submission
3. **Monitor Status**: Regularly check submission status
4. **Maintain Records**: Keep complete records of all submissions
5. **Stay Updated**: Keep up with ZRA regulation changes

### Security Best Practices

1. **Secure Credentials**: Store API credentials securely
2. **Regular Updates**: Keep system and credentials updated
3. **Access Control**: Limit access to authorized personnel only
4. **Monitor Activity**: Regularly review transaction and access logs
5. **Backup Data**: Maintain regular backups of transaction data

### Performance Optimization

1. **Batch Operations**: Use batch processing for multiple transactions
2. **Cache Settings**: Optimize caching for better performance
3. **Monitor Limits**: Stay within API rate limits
4. **Regular Maintenance**: Perform regular system maintenance
5. **Update Regularly**: Keep the system updated with latest features

---

For technical support or additional questions, please contact the TekRem ERP support team or refer to the comprehensive API documentation.
