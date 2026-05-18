<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation {{ $quotation->quotation_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #1a1a1a;
            background: #fff;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 24px 28px;
        }

        /* ── HEADER ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
        }

        .logo-block img {
            height: 60px;
            width: auto;
        }

        .company-right {
            text-align: right;
        }

        .company-name {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
            line-height: 1.2;
        }

        .company-address {
            font-size: 11px;
            color: #444;
            margin-top: 4px;
            line-height: 1.6;
        }

        /* ── TITLE ── */
        .title-section {
            text-align: center;
            margin: 10px 0 14px;
        }

        .quotation-title {
            font-size: 32px;
            font-weight: 900;
            color: #1a1a1a;
            letter-spacing: 3px;
            text-transform: uppercase;
        }

        /* ── TPIN ROW ── */
        .tpin-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 6px;
        }

        .tpin-line {
            font-size: 13px;
            font-weight: bold;
            color: #1a1a1a;
        }

        .tpin-line span {
            color: #dc2626;
        }

        /* ── META FIELDS ── */
        .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            gap: 20px;
        }

        .meta-left {
            flex: 1.2;
        }

        .meta-right {
            flex: 1;
            text-align: right;
        }

        .field-line {
            display: flex;
            align-items: baseline;
            margin-bottom: 8px;
            font-size: 12px;
        }

        .field-label {
            font-weight: bold;
            white-space: nowrap;
            min-width: 40px;
        }

        .field-dots {
            flex: 1;
            border-bottom: 1px solid #555;
            margin: 0 4px 2px;
            min-width: 140px;
        }

        .right-field-line {
            display: flex;
            align-items: baseline;
            justify-content: flex-end;
            margin-bottom: 8px;
        }

        .right-field-line .field-label {
            min-width: 50px;
            text-align: right;
            margin-right: 6px;
        }

        .right-field-dots {
            border-bottom: 1px solid #555;
            width: 150px;
            margin-bottom: 2px;
        }

        /* ── ITEMS TABLE ── */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0 0;
            border: 1.5px solid #333;
        }

        .items-table th {
            background-color: #fff;
            color: #1a1a1a;
            font-weight: bold;
            font-size: 12px;
            padding: 8px 10px;
            text-align: left;
            border: 1.5px solid #333;
        }

        .items-table th.text-center { text-align: center; }
        .items-table th.text-right  { text-align: right; }

        .items-table td {
            padding: 7px 10px;
            border: 1px solid #bbb;
            font-size: 11.5px;
            vertical-align: top;
        }

        .items-table td.empty {
            color: transparent;
            user-select: none;
        }

        .items-table tr:nth-child(even) td {
            background-color: #fdf0f0;
        }

        .td-center { text-align: center; }
        .td-right  { text-align: right; }

        /* ── BOTTOM: SIGNATURE + TOTALS ── */
        .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 0;
        }

        .signature-block {
            flex: 1;
            font-size: 11.5px;
            padding-right: 20px;
            padding-top: 10px;
        }

        .sig-line {
            display: flex;
            align-items: baseline;
            margin-bottom: 14px;
        }

        .sig-label {
            white-space: nowrap;
            min-width: 100px;
        }

        .sig-dots {
            flex: 1;
            border-bottom: 1px solid #555;
            margin-left: 4px;
            margin-bottom: 2px;
        }

        .totals-block {
            width: 240px;
            border: 1.5px solid #333;
            border-top: none;
        }

        .totals-block table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-block table td {
            padding: 7px 10px;
            font-size: 12px;
            border-bottom: 1px solid #bbb;
        }

        .totals-block table td:last-child {
            text-align: right;
            border-left: 1px solid #bbb;
            min-width: 90px;
        }

        .totals-block .grand-total td {
            font-weight: bold;
            font-size: 13px;
            border-bottom: none;
        }

        /* ── BANK DETAILS ── */
        .bank-section {
            margin-top: 16px;
            display: flex;
            justify-content: flex-end;
        }

        .bank-box {
            width: 240px;
            background-color: #1a1a1a;
            color: #fff;
            padding: 10px 14px;
            font-size: 11px;
            line-height: 1.8;
        }

        .bank-box .bank-row {
            display: flex;
            gap: 4px;
        }

        .bank-box .bank-label {
            font-weight: bold;
            white-space: nowrap;
        }

        /* ── FOOTER ── */
        .footer {
            margin-top: 20px;
            border-top: 3px solid #dc2626;
            padding-top: 10px;
            text-align: center;
            font-size: 11px;
            color: #444;
            line-height: 1.8;
        }

        /* ── WATERMARK ── */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            font-size: 120px;
            font-weight: 900;
            color: #1a1a1a;
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
        }
    </style>
</head>
<body>
<div class="watermark">TEKREM</div>

<div class="container">

    <!-- ── HEADER ── -->
    <div class="header">
        <div class="logo-block">
          <img src="{{ public_path('logo-blue.png') }}" alt="Company Logo">
        </div>
        <div class="company-right">
            <div class="company-name">{{ $company['name'] }}</div>
            <div class="company-address">
                {{ $company['address'] }}<br>
                {{ $company['city'] }} {{ $company['country'] }}.
            </div>
        </div>
    </div>

    <!-- ── TITLE ── -->
    <div class="title-section">
        <div class="quotation-title">Quotation</div>
    </div>

    <!-- ── TPIN + No. ROW ── -->
    <div class="tpin-row">
        <div class="tpin-line"><span>TPIN:</span> {{ $company['tax_number'] }}</div>
        <div style="font-weight:bold; font-size:13px;">
            No.&nbsp;&nbsp;<span style="border-bottom:1px solid #555; min-width:120px; display:inline-block; padding-bottom:1px;">{{ $quotation->quotation_number }}</span>
        </div>
    </div>

    <!-- ── META FIELDS ── -->
    <div class="meta-row">
        <div class="meta-left">
            <div class="field-line">
                <span class="field-label">M/s</span>
                <span class="field-dots">{{ $quotation->lead->name ?? '' }}{{ isset($quotation->lead->company) ? ' – ' . $quotation->lead->company : '' }}</span>
            </div>
            <div class="field-line">
                <span class="field-label"></span>
                <span class="field-dots">{{ $quotation->lead->phone ?? ($quotation->lead->email ?? '') }}</span>
            </div>
        </div>

        <div class="meta-right">
            <div class="right-field-line">
                <span class="field-label">Date</span>
                <span class="right-field-dots">{{ $quotation->issue_date->format('d/m/Y') }}</span>
            </div>
        </div>
    </div>

    <!-- ── ITEMS TABLE ── -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width:10%" class="text-center">Qty</th>
                <th style="width:55%">Description</th>
                <th style="width:17.5%" class="text-right">Unit Price</th>
                <th style="width:17.5%" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @php $filled = 0; @endphp
            @foreach($quotation->items as $item)
                @php $filled++; @endphp
                <tr>
                    <td class="td-center">{{ $item->quantity }}</td>
                    <td>{{ $item->description }}</td>
                    <td class="td-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="td-right">{{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach

            {{-- Pad to 18 rows --}}
            @for($i = $filled; $i < 18; $i++)
                <tr>
                    <td class="empty">&nbsp;</td>
                    <td class="empty">&nbsp;</td>
                    <td class="empty">&nbsp;</td>
                    <td class="empty">&nbsp;</td>
                </tr>
            @endfor
        </tbody>
    </table>

    <!-- ── BOTTOM: SIGNATURE + TOTALS ── -->
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
        </div>

        <div class="totals-block">
            <table>
                <tr>
                    <td><strong>Sub-Total</strong></td>
                    <td>{{ number_format($quotation->subtotal, 2) }}</td>
                </tr>
                <tr>
                    <td><strong>VAT 16%</strong></td>
                    <td>{{ number_format($quotation->tax_amount, 2) }}</td>
                </tr>
                @if($quotation->discount_amount > 0)
                <tr>
                    <td><strong>Discount</strong></td>
                    <td>-{{ number_format($quotation->discount_amount, 2) }}</td>
                </tr>
                @endif
                <tr class="grand-total">
                    <td><strong>Grand Total</strong></td>
                    <td><strong>{{ number_format($quotation->total_amount, 2) }}</strong></td>
                </tr>
            </table>
        </div>
    </div>

    <!-- ── BANK DETAILS ── -->
    <div class="bank-section">
        <div class="bank-box">
            <div class="bank-row"><span class="bank-label">Bank Name:</span><span>&nbsp;{{ $company['bank_name'] ?? 'Standard Chartered' }}</span></div>
            <div class="bank-row"><span class="bank-label">Branch:</span><span>&nbsp;{{ $company['bank_branch'] ?? '' }}</span></div>
            <div class="bank-row"><span class="bank-label">Account Name:</span><span>&nbsp;{{ $company['account_name'] ?? '' }}</span></div>
            <div class="bank-row"><span class="bank-label">Account Number:</span><span>&nbsp;{{ $company['account_number'] ?? '' }}</span></div>
        </div>
    </div>

    <!-- ── FOOTER ── -->
    <div class="footer">
        {{ $company['address'] }}, {{ $company['city'] }} {{ $company['country'] }}.<br>
        Cell: {{ $company['phone'] }}<br>
        Email: {{ $company['email'] }}&nbsp;&nbsp;|&nbsp;&nbsp;Website: {{ $company['website'] ?? '' }}
    </div>

</div>
</body>
</html>