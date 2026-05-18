<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Information
    |--------------------------------------------------------------------------
    |
    | This file contains the company information used throughout the application,
    | particularly for PDF generation, email templates, and invoicing.
    |
    */

    'name' => env('COMPANY_NAME', 'Tekrem Innovations Solutions'),
    'address' => env('COMPANY_ADDRESS', 'PLOT NO 03/84 ESTHER LUNGU ROAD MISISI COMPOUND Lusaka'),
    'city' => env('COMPANY_CITY', 'Lusaka'),
    'postal_code' => env('COMPANY_POSTAL_CODE', '10101'),
    'country' => env('COMPANY_COUNTRY', 'Zambia'),
    'phone' => env('COMPANY_PHONE', '+260 976607840'),
    'email' => env('COMPANY_EMAIL', 'tekremsolutions@gmail.com'),
    'website' => env('COMPANY_WEBSITE', 'www.tekreminnovations.com'),
    'tax_number' => env('COMPANY_TAX_NUMBER', '2003620656'),
    'logo' => env('COMPANY_LOGO', 'https://www.tekreminnovations.com/logo-blue.png'),

    /*
    |--------------------------------------------------------------------------
    | Banking Information
    |--------------------------------------------------------------------------
    |
    | Banking details for payment instructions on invoices.
    |
    */

    'bank' => [
        'name' => env('COMPANY_BANK_NAME', 'Business Bank'),
        'account_name' => env('COMPANY_BANK_ACCOUNT_NAME', 'TekRem ERP'),
        'account_number' => env('COMPANY_BANK_ACCOUNT_NUMBER', '1234567890'),
        'routing_number' => env('COMPANY_BANK_ROUTING_NUMBER', '123456789'),
        'swift_code' => env('COMPANY_BANK_SWIFT_CODE', 'BANKUS33'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for financial documents.
    |
    */

    'defaults' => [
        'currency' => env('COMPANY_DEFAULT_CURRENCY', 'USD'),
        'tax_rate' => env('COMPANY_DEFAULT_TAX_RATE', 0),
        'payment_terms' => env('COMPANY_DEFAULT_PAYMENT_TERMS', 'Net 30'),
        'quotation_validity_days' => env('COMPANY_QUOTATION_VALIDITY_DAYS', 30),
        'invoice_due_days' => env('COMPANY_INVOICE_DUE_DAYS', 30),
    ],

];
