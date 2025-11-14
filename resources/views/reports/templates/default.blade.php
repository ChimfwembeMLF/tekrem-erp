<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $report->name }} - Tekrem ERP</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 0; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { width: 120px; margin: 20px auto 10px; }
        .report-title { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        .meta { color: #888; font-size: 0.95em; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 1.2em; font-weight: bold; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <div class="header">
        @if($logoBase64)
            <img src="{{ $logoBase64 }}" class="logo" alt="Tekrem Logo">
        @endif
        <div class="report-title">{{ $report->name }}</div>
        <div class="meta">
            Generated: {{ now()->format('Y-m-d H:i:s') }}<br>
            Created by: {{ $report->createdBy?->name ?? 'System' }}<br>
            Type: {{ $report->getTypeLabel() }}
        </div>
    </div>
    <div class="section">
        <div class="section-title">Description</div>
        <div>{{ $report->description }}</div>
    </div>
    <div class="section">
        <div class="section-title">Report Data</div>
        <pre style="font-size:0.95em;">{{ json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) }}</pre>
    </div>
</body>
</html>
