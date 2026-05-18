<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice {{ $invoice->invoice_number }}</title>

    <style>
        @page {
            margin: 2px 6px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            line-height: 1.2;
            color: #111;
            background: #fff;
        }

        table,
        tr {
            page-break-inside: avoid;
        }

        .container {
            width: 100%;
            padding: 4px 10px;
            position: relative;
            z-index: 2;
        }

        /* WATERMARK */
        .watermark-wrap {
            position: fixed;
            top: 53%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.045;
            width: 610px;
            pointer-events: none;
            z-index: 0;
        }

        .watermark-wrap img {
            width: 100%;
            height: auto;
        }

        /* HEADER */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: -2px;
        }

        .logo-block {
            width: 45%;
        }

        .logo-block img {
            height: 47px;
            width: auto;
        }

        .company-right {
            width: 55%;
            text-align: right;
        }

        .company-name {
            font-size: 16px;
            font-weight: 900;
            line-height: 1;
            text-transform: uppercase;
        }

        .company-address {
            font-size: 9px;
            line-height: 1.2;
            margin-top: 1px;
        }

        .tpin-line {
            font-size: 11px;
            font-weight: bold;
            margin-top: 4px;
        }

        .tpin-line span {
            color: #2f3d9b;
        }

        /* TITLE */
        .title-section {
            text-align: center;
            margin: 0 0 2px;
        }

        .tax-invoice-title {
            font-size: 21px;
            font-weight: 900;
            color: #ef1d25;
            letter-spacing: 0.2px;
            text-transform: uppercase;
        }

        /* META */
        .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 5px;
        }

        .meta-left {
            width: 58%;
        }

        .meta-right {
            width: 42%;
        }

        .field-line {
            display: flex;
            align-items: baseline;
            margin-bottom: 2px;
            font-size: 9px;
        }

        .field-label {
            min-width: 70px;
            white-space: nowrap;
        }

        .field-dots {
            flex: 1;
            border-bottom: 1px dotted #444;
            margin-left: 3px;
            min-height: 10px;
            padding-bottom: 1px;
        }

        .right-field-line {
            display: flex;
            justify-content: flex-end;
            align-items: baseline;
            margin-bottom: 2px;
            font-size: 9px;
        }

        .right-field-line .field-label {
            min-width: 68px;
            text-align: right;
            margin-right: 4px;
        }

        .right-field-dots {
            border-bottom: 1px dotted #444;
            width: 140px;
            min-height: 10px;
            padding-bottom: 1px;
            text-align: left;
        }

        /* TABLE */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            border: 1.2px solid #111;
            border-radius: 0 0 16px 16px;
            overflow: hidden;
            table-layout: fixed;
        }

        .items-table th {
            border: 1px solid #222;
            font-size: 10px;
            padding: 4px 6px;
            background: #f7f7f7;
            text-align: center;
            font-weight: bold;
        }

        .items-table td {
            border: 0.8px solid #222;
            height: 16.8px;
            padding: 1px 5px;
            font-size: 8.8px;
        }

        .items-table tbody tr:nth-child(even) td {
            background: #faf7f8;
        }

        .items-table tbody tr:last-child td:first-child {
            border-bottom-left-radius: 16px;
        }

        .items-table tbody tr:last-child td:last-child {
            border-bottom-right-radius: 16px;
        }

        .td-center {
            text-align: center;
        }

        .td-right {
            text-align: right;
        }

        .empty {
            color: transparent;
        }

        /* BOTTOM */
        .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 1px;
        }

        /* SIGNATURE */
        .signature-block {
            flex: 1;
            padding-right: 18px;
            font-size: 8px;
        }

        .sig-line {
            display: flex;
            align-items: baseline;
            margin-bottom: 5px;
        }

        .sig-label {
            min-width: 72px;
        }

        .sig-dots {
            flex: 1;
            border-bottom: 1px dotted #555;
            margin-left: 4px;
        }

        /* TOTALS */
        .totals-block {
            width: 235px;
            margin-left: auto;
        }

        .totals-block table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-block td {
            padding: 1px 0;
            vertical-align: middle;
        }

        .total-label {
            width: 52%;
            text-align: right;
            padding-right: 6px;
            font-weight: bold;
            font-size: 10px;
        }

        .total-value-wrap {
            width: 48%;
        }

        .total-value {
            border: 1.5px solid #222;
            border-radius: 5px;
            height: 22px;
            line-height: 20px;
            text-align: right;
            padding: 0 7px;
            font-size: 10px;
            font-weight: 600;
            background: #fff;
        }

        .grand .total-label {
            font-size: 12px;
            font-weight: 900;
        }

        .grand .total-value {
            border: 2px solid #111;
            height: 24px;
            line-height: 22px;
            font-weight: 800;
        }

        /* BANK */
        .bank-section {
            margin-top: 7px;
            display: flex;
            justify-content: flex-end;
        }

        .bank-box {
            width: 235px;
            color: #4048a0;
            border-top: 4px solid #b45b7e;
            border-bottom: 4px solid #b45b7e;
            padding: 5px 8px 3px;
            font-size: 8px;
            font-weight: 700;
            line-height: 1.25;
        }

        .bank-row {
            margin-bottom: 2px;
        }

        /* FOOTER */
        .footer {
            margin-top: -36px;
            width: 55%;
            text-align: center;
            font-size: 8px;
            color: #4048a0;
            line-height: 1.1;
        }
    </style>
</head>
<body>

<div class="watermark-wrap">
    <img src="{{ public_path('logo-blue.png') }}" alt="Watermark">
</div>

@php
    $extraRows = 2;
    $minimumRows = 21;

    $displayRows = max(
        $invoice->items->count() + $extraRows,
        $minimumRows
    );

    $subtotal = (float) ($invoice->items->sum('total_price') ?: $invoice->subtotal);
    $taxAmount = (float) ($invoice->tax_amount ?? 0);
    $discountAmount = (float) ($invoice->discount_amount ?? 0);

    $grandTotal = (float) ($subtotal + $taxAmount - $discountAmount);

    $paidAmount = (float) ($invoice->payments?->sum('amount') ?? 0);

    $balanceDue = max($grandTotal - $paidAmount, 0);
@endphp

<div class="container">

    <!-- HEADER -->
    <div class="header">

        <div class="logo-block">
            <img src="{{ public_path('logo-blue.png') }}" alt="Company Logo">
        </div>

        <div class="company-right">
            <div class="company-name">
                {{ $company['name'] }}
            </div>

            <div class="company-address">
                {{ $company['address'] }}<br>
                {{ $company['city'] }} {{ $company['country'] }}
            </div>

            <div class="tpin-line">
                <span>TPIN:</span> {{ $company['tax_number'] }}
            </div>
        </div>

    </div>

    <!-- TITLE -->
    <div class="title-section">
        <div class="tax-invoice-title">
            TAX INVOICE
        </div>
    </div>

    <!-- META -->
    <div class="meta-row">

        <div class="meta-left">

            <div class="field-line">
                <span class="field-label">Client TPIN</span>
                <span class="field-dots">
                    {{ $invoice->billable->tax_number ?? '' }}
                </span>
            </div>

            <div class="field-line">
                <span class="field-label">M/s</span>
                <span class="field-dots">
                    {{ $invoice->billable->name ?? '' }}
                </span>
            </div>

            <div class="field-line">
                <span class="field-label"></span>
                <span class="field-dots">
                    {{ $invoice->billable->address ?? '' }}
                </span>
            </div>

        </div>

        <div class="meta-right">

            <div class="right-field-line">
                <span class="field-label">No.</span>
                <span class="right-field-dots">
                    {{ $invoice->invoice_number }}
                </span>
            </div>

            <div class="right-field-line">
                <span class="field-label">Order No.</span>
                <span class="right-field-dots">
                    {{ $invoice->order_number ?? '' }}
                </span>
            </div>

            <div class="right-field-line">
                <span class="field-label">Date</span>
                <span class="right-field-dots">
                    {{ $invoice->issue_date->format('d/m/Y') }}
                </span>
            </div>

        </div>

    </div>

    <!-- TABLE -->
    <table class="items-table">

        <thead>
        <tr>
            <th style="width:10%">Qty</th>
            <th style="width:54%">Description</th>
            <th style="width:16%">Unit Price</th>
            <th style="width:20%">Amount</th>
        </tr>
        </thead>

        <tbody>

        @foreach($invoice->items as $item)
            <tr>
                <td class="td-center">
                    {{ $item->quantity }}
                </td>

                <td>
                    {{ $item->description }}
                </td>

                <td class="td-right">
                    {{ number_format($item->unit_price, 2) }}
                </td>

                <td class="td-right">
                    {{ number_format($item->total_price, 2) }}
                </td>
            </tr>
        @endforeach

        @for($i = $invoice->items->count(); $i < $displayRows; $i++)
            <tr>
                <td class="empty">&nbsp;</td>
                <td class="empty">&nbsp;</td>
                <td class="empty">&nbsp;</td>
                <td class="empty">&nbsp;</td>
            </tr>
        @endfor

        </tbody>

    </table>

    <!-- BOTTOM -->
    <div class="bottom-section">

        <div class="signature-block">

            <div class="sig-line">
                <span class="sig-label">Prepared by:</span>
                <span class="sig-dots"></span>
            </div>

            <div class="sig-line">
                <span class="sig-label">Signature:</span>
                <span class="sig-dots"></span>
            </div>

            <div class="sig-line">
                <span class="sig-label">Received by:</span>
                <span class="sig-dots"></span>
            </div>

            <div class="sig-line">
                <span class="sig-label">Signature:</span>
                <span class="sig-dots"></span>
            </div>

        </div>

        <div class="totals-block">

            <table>

                <tr>
                    <td class="total-label">Sub-Total</td>
                    <td class="total-value-wrap">
                        <div class="total-value">
                            {{ number_format($subtotal, 2) }}
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="total-label">VAT 16%</td>
                    <td class="total-value-wrap">
                        <div class="total-value">
                            {{ number_format($taxAmount, 2) }}
                        </div>
                    </td>
                </tr>

                <tr class="grand">
                    <td class="total-label">Grand Total K</td>
                    <td class="total-value-wrap">
                        <div class="total-value">
                            {{ number_format($grandTotal, 2) }}
                        </div>
                    </td>
                </tr>

            </table>

        </div>

    </div>

    <!-- BANK -->
    <div class="bank-section">

        <div class="bank-box">

            <div class="bank-row">
                Bank Name:
                {{ $company['bank_name'] ?? '-' }}
            </div>

            <div class="bank-row">
                Branch:
                {{ $company['bank_branch'] ?? '-' }}
            </div>

            <div class="bank-row">
                Account Name:
                {{ $company['account_name'] ?? '-' }}
            </div>

            <div class="bank-row">
                Account Number:
                {{ $company['account_number'] ?? '-' }}
            </div>

        </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">

        {{ $company['address'] }},
        {{ $company['city'] }}
        {{ $company['country'] }}

        <br>

        Cell:
        {{ $company['phone'] }}

        <br>

        Email:
        {{ $company['email'] }}

        |

        Website:
        {{ $company['website'] ?? '' }}

    </div>

</div>

</body>
</html>