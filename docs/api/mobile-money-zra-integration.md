# TekRem ERP - Mobile Money & ZRA Smart Invoice Integration API Documentation

## Overview

This document provides comprehensive API documentation for the Mobile Money (MoMo) and ZRA Smart Invoice integration features in TekRem ERP. These integrations enable seamless payment processing through Zambian mobile money providers and automated tax compliance through ZRA Smart Invoice submission.

## Table of Contents

1. [Mobile Money API](#mobile-money-api)
2. [ZRA Smart Invoice API](#zra-smart-invoice-api)
3. [Settings & Configuration API](#settings--configuration-api)
4. [Authentication & Security](#authentication--security)
5. [Error Handling](#error-handling)
6. [Webhooks](#webhooks)
7. [Testing](#testing)

## Mobile Money API

### Base URL
```
/api/finance/momo
```

### Endpoints

#### 1. Get MoMo Dashboard Data
```http
GET /api/finance/momo/dashboard
```

**Response:**
```json
{
  "stats": {
    "total_transactions": 150,
    "completed_transactions": 142,
    "pending_transactions": 5,
    "failed_transactions": 3,
    "total_amount": 45000.00,
    "success_rate": 94.67
  },
  "recent_transactions": [...],
  "providers": [...]
}
```

#### 2. Create Payment Transaction
```http
POST /api/finance/momo/transactions
```

**Request Body:**
```json
{
  "provider_id": 1,
  "type": "payment",
  "amount": 100.00,
  "currency": "ZMW",
  "customer_phone": "260971234567",
  "description": "Payment for consultation",
  "external_reference": "INV-2024-001",
  "metadata": {
    "service_type": "consultation",
    "customer_id": 123
  }
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "reference": "MOMO-2024-001",
    "provider_reference": "MTN-REF-123456",
    "status": "pending",
    "amount": 100.00,
    "currency": "ZMW",
    "customer_phone": "260971234567",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. Initiate Payout
```http
POST /api/finance/momo/payouts
```

**Request Body:**
```json
{
  "provider_id": 1,
  "amount": 50.00,
  "currency": "ZMW",
  "customer_phone": "260971234567",
  "description": "Refund payment",
  "external_reference": "REF-2024-001"
}
```

#### 4. Check Transaction Status
```http
POST /api/finance/momo/transactions/{id}/status
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "status": "completed",
    "provider_reference": "MTN-REF-123456",
    "completed_at": "2024-01-15T10:35:00Z",
    "financial_transaction_id": "FT-789456"
  }
}
```

#### 5. Get Transaction Details
```http
GET /api/finance/momo/transactions/{id}
```

#### 6. List Transactions
```http
GET /api/finance/momo/transactions?status=completed&provider_id=1&page=1
```

**Query Parameters:**
- `status`: Filter by transaction status (pending, completed, failed)
- `provider_id`: Filter by MoMo provider
- `type`: Filter by transaction type (payment, payout)
- `search`: Search in description or phone number
- `start_date`: Filter from date (Y-m-d format)
- `end_date`: Filter to date (Y-m-d format)
- `page`: Page number for pagination

#### 7. Reconciliation
```http
POST /api/finance/momo/reconciliation/auto
POST /api/finance/momo/reconciliation/manual
```

**Manual Reconciliation Request:**
```json
{
  "transaction_id": 1,
  "bank_reference": "BANK-REF-123",
  "reconciled_amount": 100.00,
  "reconciliation_notes": "Manual reconciliation"
}
```

## ZRA Smart Invoice API

### Base URL
```
/api/finance/zra
```

### Endpoints

#### 1. Get ZRA Dashboard Data
```http
GET /api/finance/zra/dashboard
```

**Response:**
```json
{
  "stats": {
    "total_invoices": 50,
    "submitted_invoices": 45,
    "approved_invoices": 42,
    "failed_invoices": 3,
    "compliance_rate": 93.33
  },
  "recent_invoices": [...],
  "compliance_status": {
    "current_month": "compliant",
    "overdue_submissions": 0
  }
}
```

#### 2. Submit Invoice to ZRA
```http
POST /api/finance/zra/invoices/{invoice_id}/submit
```

**Response:**
```json
{
  "success": true,
  "zra_invoice": {
    "id": 1,
    "invoice_id": 123,
    "zra_reference": "ZRA-2024-001",
    "status": "submitted",
    "qr_code": "base64_encoded_qr_code",
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. Check ZRA Invoice Status
```http
POST /api/finance/zra/invoices/{id}/status
```

**Response:**
```json
{
  "success": true,
  "zra_invoice": {
    "id": 1,
    "status": "approved",
    "approval_reference": "APPR-123456",
    "approved_at": "2024-01-15T11:00:00Z"
  }
}
```

#### 4. Cancel ZRA Invoice
```http
POST /api/finance/zra/invoices/{id}/cancel
```

**Request Body:**
```json
{
  "reason": "Customer request for cancellation"
}
```

#### 5. Retry Failed Submission
```http
POST /api/finance/zra/invoices/{id}/retry
```

#### 6. Download QR Code
```http
GET /api/finance/zra/invoices/{id}/qr-code
```

**Response:** Binary PNG image data

#### 7. Bulk Status Check
```http
POST /api/finance/zra/invoices/bulk-status-check
```

**Request Body:**
```json
{
  "invoice_ids": [1, 2, 3, 4, 5]
}
```

#### 8. Export Compliance Report
```http
GET /api/finance/zra/export?format=csv&start_date=2024-01-01&end_date=2024-01-31
```

**Query Parameters:**
- `format`: Export format (csv, excel, pdf)
- `start_date`: Report start date
- `end_date`: Report end date
- `status`: Filter by invoice status

## Settings & Configuration API

### Base URL
```
/api/settings/finance
```

### Endpoints

#### 1. Get Finance Settings Overview
```http
GET /api/settings/finance
```

#### 2. MoMo API Configuration
```http
GET /api/settings/finance/momo/api-configuration
PUT /api/settings/finance/momo/api-configuration
```

**Update Request Body:**
```json
{
  "mtn_api_key": "your_mtn_api_key",
  "mtn_api_secret": "your_mtn_api_secret",
  "mtn_subscription_key": "your_mtn_subscription_key",
  "mtn_environment": "sandbox",
  "airtel_api_key": "your_airtel_api_key",
  "airtel_api_secret": "your_airtel_api_secret",
  "zamtel_api_key": "your_zamtel_api_key",
  "zamtel_api_secret": "your_zamtel_api_secret",
  "webhook_secret": "your_webhook_secret",
  "rate_limit_per_minute": 100,
  "request_timeout": 30,
  "enable_logging": true
}
```

#### 3. Test MoMo API Connection
```http
POST /api/settings/finance/momo/test-connection
```

**Request Body:**
```json
{
  "provider": "mtn"
}
```

#### 4. ZRA Taxpayer Information
```http
GET /api/settings/finance/zra/taxpayer-information
PUT /api/settings/finance/zra/taxpayer-information
```

**Update Request Body:**
```json
{
  "taxpayer_tpin": "1234567890",
  "taxpayer_name": "Your Company Ltd",
  "business_address": "123 Business Street",
  "postal_address": "P.O. Box 123",
  "phone_number": "+260971234567",
  "email_address": "contact@company.com",
  "vat_registered": true,
  "vat_number": "VAT123456789",
  "business_type": "Limited Company",
  "api_username": "zra_api_user",
  "api_password": "zra_api_password",
  "api_environment": "sandbox",
  "api_timeout": 30
}
```

#### 5. Validate ZRA TPIN
```http
POST /api/settings/finance/zra/validate-tpin
```

**Request Body:**
```json
{
  "tpin": "1234567890"
}
```

#### 6. Security & API Management
```http
GET /api/settings/finance/security/api-management
PUT /api/settings/finance/security/update
POST /api/settings/finance/security/generate-api-key
DELETE /api/settings/finance/security/revoke-api-key
```

## Authentication & Security

### API Authentication
All API endpoints require authentication using Laravel Sanctum tokens or session-based authentication.

**Headers:**
```http
Authorization: Bearer {your_api_token}
Content-Type: application/json
Accept: application/json
```

### Permissions
The following permissions are required:
- `manage momo`: For MoMo transaction operations
- `manage zra`: For ZRA invoice operations
- `manage settings`: For configuration management

### Rate Limiting
- Default: 100 requests per minute per user
- Configurable through settings
- Returns `429 Too Many Requests` when exceeded

### IP Whitelisting
Optional IP address restrictions can be configured for enhanced security.

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "error_code": "MOMO_001"
}
```

### Common Error Codes

#### Mobile Money Errors
- `MOMO_001`: Invalid provider configuration
- `MOMO_002`: Insufficient funds
- `MOMO_003`: Invalid phone number format
- `MOMO_004`: Transaction timeout
- `MOMO_005`: Provider API error

#### ZRA Errors
- `ZRA_001`: Invalid taxpayer TPIN
- `ZRA_002`: Invoice validation failed
- `ZRA_003`: ZRA API authentication failed
- `ZRA_004`: Invoice already submitted
- `ZRA_005`: Cannot cancel approved invoice

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Too Many Requests
- `500`: Internal Server Error

## Webhooks

### MoMo Transaction Webhooks
```http
POST /webhooks/momo/transaction-status
```

**Payload:**
```json
{
  "event": "transaction.completed",
  "transaction": {
    "reference": "MOMO-2024-001",
    "provider_reference": "MTN-REF-123456",
    "status": "completed",
    "amount": 100.00,
    "currency": "ZMW"
  },
  "timestamp": "2024-01-15T10:35:00Z",
  "signature": "webhook_signature"
}
```

### ZRA Invoice Webhooks
```http
POST /webhooks/zra/invoice-status
```

**Payload:**
```json
{
  "event": "invoice.approved",
  "invoice": {
    "zra_reference": "ZRA-2024-001",
    "status": "approved",
    "approval_reference": "APPR-123456"
  },
  "timestamp": "2024-01-15T11:00:00Z",
  "signature": "webhook_signature"
}
```

### Webhook Security
- All webhooks include HMAC-SHA256 signatures
- Verify signatures using your webhook secret
- Implement idempotency to handle duplicate deliveries

## Testing

### Test Environment
- Use sandbox/test environments for all providers
- Test API keys and credentials are provided in documentation
- Mock responses available for unit testing

### Test Data
- Sample phone numbers: `260971234567`, `260979876543`
- Test amounts: Use amounts ending in `.00` for success, `.01` for failure
- Test TPINs: `1234567890` (valid), `9999999999` (invalid)

### Running Tests
```bash
# Run all integration tests
php tests/run-momo-zra-tests.php

# Run with coverage
php tests/run-momo-zra-tests.php --coverage

# Run specific test suite
php tests/run-momo-zra-tests.php --filter=MomoController
```

For more detailed testing information, see the [Testing Guide](../testing/momo-zra-testing-guide.md).
