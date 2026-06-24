<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Payslip {{ $period }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; margin: 24px; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .muted { color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 8px 10px; border-bottom: 1px solid #e5e5e5; text-align: left; }
        th { background: #f8f8f8; font-size: 10px; text-transform: uppercase; }
        .amount { text-align: right; }
        .total-row td { font-weight: bold; border-top: 2px solid #111; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-approved { background: #dcfce7; color: #166534; }
    </style>
</head>
<body>
    <h1>Payslip</h1>
    <p class="muted">Pay period: {{ $period }} · Generated {{ $generatedAt->format('M j, Y H:i') }}</p>

    <table>
        <tr><th colspan="2">Employee</th></tr>
        <tr><td>Name</td><td>{{ $employee->user?->name }}</td></tr>
        <tr><td>Employee ID</td><td>{{ $employee->employee_id }}</td></tr>
        <tr><td>Job title</td><td>{{ $employee->job_title }}</td></tr>
        <tr><td>Department</td><td>{{ $employee->department?->name ?? '—' }}</td></tr>
    </table>

    <table>
        <tr><th>Description</th><th class="amount">Amount ({{ $currency }})</th></tr>
        <tr><td>Base salary</td><td class="amount">{{ number_format($breakdown['base_salary'] ?? 0, 2) }}</td></tr>
        <tr><td>Overtime ({{ $breakdown['overtime_hours'] ?? 0 }}h)</td><td class="amount">{{ number_format($breakdown['overtime_pay'] ?? 0, 2) }}</td></tr>
        <tr><td>Bonus</td><td class="amount">{{ number_format($breakdown['bonus'] ?? 0, 2) }}</td></tr>
        <tr><td>Allowances / adjustments</td><td class="amount">{{ number_format($breakdown['allowances_deductions_net'] ?? 0, 2) }}</td></tr>
        <tr><td>Absence deduction</td><td class="amount">-{{ number_format($breakdown['absence_deduction'] ?? 0, 2) }}</td></tr>
        <tr><td>Unpaid leave deduction</td><td class="amount">-{{ number_format($breakdown['unpaid_leave_deduction'] ?? 0, 2) }}</td></tr>
        <tr class="total-row"><td>Gross pay</td><td class="amount">{{ number_format($breakdown['gross'] ?? 0, 2) }}</td></tr>
        <tr class="total-row"><td>Net pay</td><td class="amount">{{ number_format($breakdown['net'] ?? 0, 2) }}</td></tr>
    </table>

    <p style="margin-top: 20px;">
        Status:
        <span class="status status-{{ $status === 'approved' ? 'approved' : 'pending' }}">{{ $status }}</span>
    </p>
</body>
</html>
