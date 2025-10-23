<?php

require_once 'vendor/autoload.php';

use App\Models\Finance\Report;
use App\Models\User;
use App\Jobs\GenerateReportJob;
use Illuminate\Foundation\Application;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Finance Reports System\n";
echo "==============================\n\n";

try {
    // 1. Check if Report model works
    echo "1. Testing Report Model...\n";
    $reportCount = Report::count();
    echo "   Current reports in database: {$reportCount}\n\n";

    // 2. Create a test report
    echo "2. Creating test report...\n";
    $user = User::first();
    if (!$user) {
        echo "   Error: No users found in database\n";
        exit(1);
    }

    $report = Report::create([
        'name' => 'Test Income Statement - ' . date('Y-m-d H:i:s'),
        'description' => 'Test report for system verification',
        'type' => 'income_statement',
        'status' => 'pending',
        'parameters' => [
            'date_from' => '2025-01-01',
            'date_to' => '2025-10-10',
            'format' => 'pdf'
        ],
        'created_by' => $user->id
    ]);

    echo "   Report created with ID: {$report->id}\n\n";

    // 3. Test report generation service
    echo "3. Testing Report Generator Service...\n";
    $service = new \App\Services\Finance\ReportGeneratorService();
    
    try {
        $result = $service->generateReport($report);
        echo "   Service executed successfully\n";
        echo "   Generated data structure: " . json_encode(array_keys($result), JSON_PRETTY_PRINT) . "\n\n";
    } catch (Exception $e) {
        echo "   Service error: " . $e->getMessage() . "\n\n";
    }

    // 4. Check if job can be dispatched
    echo "4. Testing Job Dispatch...\n";
    try {
        GenerateReportJob::dispatch($report);
        echo "   Job dispatched successfully\n\n";
    } catch (Exception $e) {
        echo "   Job dispatch error: " . $e->getMessage() . "\n\n";
    }

    // 5. Check updated report status
    echo "5. Checking report status after processing...\n";
    $report->refresh();
    echo "   Report status: {$report->status}\n";
    echo "   File path: " . ($report->file_path ?? 'Not set') . "\n\n";

    echo "Test completed successfully!\n";

} catch (Exception $e) {
    echo "Test failed with error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}