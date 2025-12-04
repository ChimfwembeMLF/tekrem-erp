
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report->name }} - Tekrem ERP</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 0; color: #222; background: #fff; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0a4d8c; padding-bottom: 10px; }
        .logo { width: 200px; margin: 20px auto 10px; }
        .report-title { font-size: 2.2em; font-weight: bold; margin-bottom: 6px; color: #0a4d8c; letter-spacing: 1px; }
        .meta { color: #666; font-size: 1em; margin-bottom: 18px; }
        .company-info { font-size: 0.95em; color: #888; margin-bottom: 10px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 1.25em; font-weight: bold; margin-bottom: 10px; color: #0a4d8c; border-left: 4px solid #0a4d8c; padding-left: 8px; }
        .description { font-size: 1.05em; color: #333; margin-bottom: 10px; }
        .summary-box { background: #f5faff; border: 1px solid #b3d8f7; border-radius: 6px; padding: 12px 18px; margin-bottom: 18px; }
        .summary-title { font-size: 1.1em; font-weight: bold; color: #0a4d8c; margin-bottom: 6px; }
        .summary-value { font-size: 1.3em; font-weight: bold; color: #1a7bb7; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.98em; }
        th, td { border: 1px solid #b3d8f7; padding: 7px 12px; text-align: left; }
        th { background: #eaf4fb; color: #0a4d8c; font-weight: bold; }
        tr:nth-child(even) { background: #f7fbfd; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.95em; color: #888; border-top: 1px solid #b3d8f7; padding: 8px 0; }
        .watermark { position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); font-size: 4em; color: #eaf4fb; opacity: 0.25; z-index: 0; pointer-events: none; }
        .page-break { page-break-after: always; }
        .highlight { background: #fffbe6; color: #b38f00; padding: 2px 6px; border-radius: 3px; }
        .totals-row { background: #d9f2e6; font-weight: bold; }
        .net-income { color: #0a4d8c; font-weight: bold; font-size: 1.1em; }
        .balanced { color: #1a7bb7; font-weight: bold; }
        .not-balanced { color: #b71a1a; font-weight: bold; }
        .category-header { background: #f0f7fa; font-weight: bold; color: #0a4d8c; }
        .table-title { font-size: 1.1em; color: #0a4d8c; margin-bottom: 4px; font-weight: bold; }
        .small { font-size: 0.92em; color: #888; }
        .right { text-align: right; }
        .center { text-align: center; }
        .mt-2 { margin-top: 12px; }
        .mb-2 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 24px; }
        .w-50 { width: 50%; }
        .w-33 { width: 33%; }
        .w-25 { width: 25%; }
        .nowrap { white-space: nowrap; }
    </style>
</head>
<body>
    <div class="watermark">Tekrem ERP</div>
    <div class="header">
        @if($logoBase64)
           <img src="{{ $logoBase64 }}" style="width: 180px; height: auto; display: block; margin: 0 auto;" alt="Logo">
        @endif
        <div class="report-title">{{ $report->name }}</div>
        <div class="company-info">
            Tekrem ERP &mdash; {{ config('app.url') }}<br>
            {{ config('app.name') }} | {{ config('app.env') }}
        </div>
        <div class="meta">
            Generated: {{ now()->format('Y-m-d H:i:s') }}<br>
            Created by: {{ $report->createdBy?->name ?? 'System' }}<br>
            Type: {{ $report->getTypeLabel() }}<br>
            Report ID: {{ $report->id }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Description</div>
        <div class="description">{{ $report->description }}</div>
    </div>

    {{-- Dynamic Report Content --}}
    @if($report->type === 'chart_of_accounts')
        <div class="section">
            <div class="section-title">Chart of Accounts</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Total Accounts</div>
                <div class="summary-value">{{ $data['summary']['total_accounts'] ?? 0 }}</div>
                <span class="small">Active: {{ $data['summary']['active_accounts'] ?? 0 }}</span>
            </div>
            <div class="table-title">Accounts by Category</div>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Count</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(($data['summary']['by_category'] ?? []) as $cat => $count)
                        <tr>
                            <td>{{ $cat }}</td>
                            <td>{{ $count }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="table-title mt-2">Account Details</div>
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Balance</th>
                        <th>Normal</th>
                        <th>Status</th>
                        <th>Parent</th>
                        <th>Level</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(($data['accounts'] ?? []) as $acc)
                        <tr>
                            <td class="nowrap">{{ $acc['account_code'] }}</td>
                            <td>{{ $acc['name'] }}</td>
                            <td>{{ $acc['type'] }}</td>
                            <td>{{ $acc['category'] }}</td>
                            <td class="right">{{ number_format($acc['balance'], 2) }}</td>
                            <td>{{ $acc['normal_balance'] }}</td>
                            <td>{{ $acc['is_active'] ? 'Active' : 'Inactive' }}</td>
                            <td>{{ $acc['parent_code'] ?? '-' }}</td>
                            <td class="center">{{ $acc['level'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    @elseif($report->type === 'trial_balance')
        <div class="section">
            <div class="section-title">Trial Balance</div>
            <div class="summary-box mb-2">
                <div class="summary-title">As of {{ $data['as_of_date'] }}</div>
                <div class="summary-value">Accounts: {{ count($data['accounts'] ?? []) }}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Debit</th>
                        <th>Credit</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(($data['accounts'] ?? []) as $acc)
                        <tr>
                            <td>{{ $acc['account_code'] }}</td>
                            <td>{{ $acc['name'] }}</td>
                            <td class="right">{{ number_format($acc['debit_balance'], 2) }}</td>
                            <td class="right">{{ number_format($acc['credit_balance'], 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="totals-row">
                        <td colspan="2">Totals</td>
                        <td class="right">{{ number_format($data['totals']['total_debits'] ?? 0, 2) }}</td>
                        <td class="right">{{ number_format($data['totals']['total_credits'] ?? 0, 2) }}</td>
                    </tr>
                    <tr>
                        <td colspan="4" class="center">
                            @if($data['totals']['is_balanced'] ?? false)
                                <span class="balanced">Balanced ✓</span>
                            @else
                                <span class="not-balanced">Not Balanced ✗</span>
                            @endif
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    @elseif($report->type === 'income_statement')
        <div class="section">
            <div class="section-title">Income Statement</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Period</div>
                <div class="summary-value">{{ $data['period']['from'] ?? '' }} &mdash; {{ $data['period']['to'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th colspan="2">Revenue</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['revenue']['transactions'] ?? []) as $cat => $amt)
                        <tr><td>{{ $cat }}</td><td class="right">{{ number_format($amt, 2) }}</td></tr>
                    @endforeach
                    <tr><td>Invoice Revenue</td><td class="right">{{ number_format($data['revenue']['invoices'] ?? 0, 2) }}</td></tr>
                    <tr class="totals-row"><td>Total Revenue</td><td class="right">{{ number_format($data['revenue']['total'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr><th colspan="2">Expenses</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['expenses']['transactions'] ?? []) as $cat => $amt)
                        <tr><td>{{ $cat }}</td><td class="right">{{ number_format($amt, 2) }}</td></tr>
                    @endforeach
                    <tr class="totals-row"><td>Total Expenses</td><td class="right">{{ number_format($data['expenses']['total'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
            <div class="summary-box">
                <div class="summary-title">Net Income</div>
                <div class="net-income">{{ number_format($data['net_income'] ?? 0, 2) }}</div>
                <span class="small">Gross Profit Margin: {{ number_format($data['gross_profit_margin'] ?? 0, 1) }}%</span>
            </div>
        </div>
    @elseif($report->type === 'balance_sheet')
        <div class="section">
            <div class="section-title">Balance Sheet</div>
            <div class="summary-box mb-2">
                <div class="summary-title">As of {{ $data['as_of_date'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th colspan="2">Assets</th></tr>
                </thead>
                <tbody>
                    <tr><td>Current Assets</td><td class="right">{{ number_format($data['assets']['current_assets'] ?? 0, 2) }}</td></tr>
                    <tr><td>Non-Current Assets</td><td class="right">{{ number_format($data['assets']['non_current_assets'] ?? 0, 2) }}</td></tr>
                    <tr class="totals-row"><td>Total Assets</td><td class="right">{{ number_format($data['assets']['total'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr><th colspan="2">Liabilities</th></tr>
                </thead>
                <tbody>
                    <tr><td>Current Liabilities</td><td class="right">{{ number_format($data['liabilities']['current_liabilities'] ?? 0, 2) }}</td></tr>
                    <tr><td>Non-Current Liabilities</td><td class="right">{{ number_format($data['liabilities']['non_current_liabilities'] ?? 0, 2) }}</td></tr>
                    <tr class="totals-row"><td>Total Liabilities</td><td class="right">{{ number_format($data['liabilities']['total'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
            <table>
                <thead>
                    <tr><th colspan="2">Equity</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['equity']['details'] ?? []) as $name => $amt)
                        <tr><td>{{ $name }}</td><td class="right">{{ number_format($amt, 2) }}</td></tr>
                    @endforeach
                    <tr class="totals-row"><td>Total Equity</td><td class="right">{{ number_format($data['equity']['total'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
            <div class="summary-box">
                <span class="small">Balance Check: 
                    @if($data['is_balanced'] ?? false)
                        <span class="balanced">BALANCED ✓</span>
                    @else
                        <span class="not-balanced">NOT BALANCED ✗</span>
                    @endif
                </span>
            </div>
        </div>
    @elseif($report->type === 'cash_flow')
        <div class="section">
            <div class="section-title">Cash Flow Statement</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Period</div>
                <div class="summary-value">{{ $data['period']['from'] ?? '' }} &mdash; {{ $data['period']['to'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th>Activity</th><th>Receipts</th><th>Payments</th><th>Net Cash</th></tr>
                </thead>
                <tbody>
                    <tr><td>Operating</td><td class="right">{{ number_format($data['operating_activities']['cash_receipts'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['operating_activities']['cash_payments'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['operating_activities']['net_operating_cash'] ?? 0, 2) }}</td></tr>
                    <tr><td>Investing</td><td class="right">{{ number_format($data['investing_activities']['cash_receipts'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['investing_activities']['cash_payments'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['investing_activities']['net_investing_cash'] ?? 0, 2) }}</td></tr>
                    <tr><td>Financing</td><td class="right">{{ number_format($data['financing_activities']['cash_receipts'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['financing_activities']['cash_payments'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['financing_activities']['net_financing_cash'] ?? 0, 2) }}</td></tr>
                </tbody>
            </table>
        </div>
    @elseif($report->type === 'expense_report')
        <div class="section">
            <div class="section-title">Expense Report</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Period</div>
                <div class="summary-value">{{ $data['period']['from'] ?? '' }} &mdash; {{ $data['period']['to'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th>Category</th><th>Total</th><th>Count</th><th>Average</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['by_category'] ?? []) as $cat => $info)
                        <tr><td>{{ $cat }}</td><td class="right">{{ number_format($info['total'] ?? 0, 2) }}</td><td class="center">{{ $info['count'] ?? 0 }}</td><td class="right">{{ number_format($info['average'] ?? 0, 2) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
            <table>
                <thead>
                    <tr><th>Month</th><th>Total Expenses</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['by_month'] ?? []) as $month => $amt)
                        <tr><td>{{ $month }}</td><td class="right">{{ number_format($amt, 2) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
            <div class="summary-box">
                <span class="small">Total Expenses: <span class="highlight">{{ number_format($data['total_expenses'] ?? 0, 2) }}</span> | Count: {{ $data['expense_count'] ?? 0 }}</span>
            </div>
        </div>
    @elseif($report->type === 'reconciliation_summary')
        <div class="section">
            <div class="section-title">Reconciliation Summary</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Period</div>
                <div class="summary-value">{{ $data['period']['from'] ?? '' }} &mdash; {{ $data['period']['to'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th>Number</th><th>Account</th><th>Date</th><th>Status</th><th>Difference</th></tr>
                </thead>
                <tbody>
                    @foreach(($data['reconciliations'] ?? []) as $rec)
                        <tr><td>{{ $rec['reconciliation_number'] }}</td><td>{{ $rec['account_name'] }}</td><td>{{ $rec['reconciliation_date'] }}</td><td>{{ $rec['status'] }}</td><td class="right">{{ number_format($rec['difference'], 2) }}</td></tr>
                    @endforeach
                </tbody>
            </table>
            <div class="summary-box">
                <span class="small">Total: {{ $data['summary']['total_reconciliations'] ?? 0 }} | By Status: 
                    @foreach(($data['summary']['by_status'] ?? []) as $status => $count)
                        <span class="highlight">{{ $status }}: {{ $count }}</span>
                    @endforeach
                    | Total Difference: <span class="highlight">{{ number_format($data['summary']['total_difference'] ?? 0, 2) }}</span>
                </span>
            </div>
        </div>
    @elseif($report->type === 'budget_analysis')
        <div class="section">
            <div class="section-title">Budget vs Actual Analysis</div>
            <div class="summary-box mb-2">
                <div class="summary-title">Period</div>
                <div class="summary-value">{{ $data['period']['from'] ?? '' }} &mdash; {{ $data['period']['to'] ?? '' }}</div>
            </div>
            <table>
                <thead>
                    <tr><th></th><th>Budget</th><th>Actual</th><th>Variance</th><th>Variance %</th></tr>
                </thead>
                <tbody>
                    <tr><td>Revenue</td><td class="right">{{ number_format($data['revenue']['budget'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['revenue']['actual'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['revenue']['variance'] ?? 0, 2) }}</td><td class="right">{{ $data['revenue']['variance_percent'] ?? 0 }}%</td></tr>
                    <tr><td>Expenses</td><td class="right">{{ number_format($data['expenses']['budget'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['expenses']['actual'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['expenses']['variance'] ?? 0, 2) }}</td><td class="right">{{ $data['expenses']['variance_percent'] ?? 0 }}%</td></tr>
                    <tr><td>Net Income</td><td class="right">{{ number_format($data['net_income']['budget'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['net_income']['actual'] ?? 0, 2) }}</td><td class="right">{{ number_format($data['net_income']['variance'] ?? 0, 2) }}</td><td></td></tr>
                </tbody>
            </table>
        </div>
    @else
        <div class="section">
            <div class="section-title">Raw Report Data</div>
            <pre style="font-size:0.95em;">{{ json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
        </div>
    @endif

    <div class="footer">
        Tekrem ERP &copy; {{ date('Y') }} &mdash; Page <span class="pageNumber"></span>
    </div>

    <script type="text/php">
        if (isset($pdf)) {
            $pdf->page_script('if ($PAGE_COUNT > 1) { $font = $fontMetrics->get_font("DejaVu Sans", "normal"); $size = 9; $pageText = "Page " . $PAGE_NUM . " of " . $PAGE_COUNT; $pdf->text(520, 820, $pageText, $font, $size); }');
        }
    </script>
</body>
</html>
