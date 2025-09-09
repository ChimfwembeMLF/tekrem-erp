<?php

/**
 * TekRem ERP - Mobile Money & ZRA Smart Invoice Integration Test Runner
 * 
 * This script runs comprehensive tests for the Mobile Money and ZRA Smart Invoice
 * integration features, including unit tests, feature tests, and integration tests.
 * 
 * Usage:
 * php tests/run-momo-zra-tests.php [--coverage] [--verbose] [--filter=pattern]
 * 
 * Options:
 * --coverage    Generate code coverage report
 * --verbose     Show detailed test output
 * --filter      Run only tests matching the pattern
 */

require_once __DIR__ . '/../vendor/autoload.php';

class MomoZraTestRunner
{
    private array $testSuites = [
        'Unit Tests' => [
            'tests/Unit/Finance/MomoTransactionModelTest.php',
            'tests/Unit/Finance/ZraSmartInvoiceModelTest.php',
        ],
        'Feature Tests - Services' => [
            'tests/Feature/Services/MoMo/MomoApiServiceTest.php',
            'tests/Feature/Services/MoMo/MomoTransactionServiceTest.php',
            'tests/Feature/Services/ZRA/ZraApiServiceTest.php',
            'tests/Feature/Services/ZRA/ZraSmartInvoiceServiceTest.php',
        ],
        'Feature Tests - Controllers' => [
            'tests/Feature/Finance/MomoControllerTest.php',
            'tests/Feature/Finance/ZraControllerTest.php',
            'tests/Feature/Settings/FinanceSettingsControllerTest.php',
        ],
        'Integration Tests' => [
            'tests/Feature/MomoTransactionServiceTest.php',
            'tests/Feature/EnhancedNotificationSystemTest.php',
        ],
    ];

    private array $options;
    private array $results = [];

    public function __construct(array $options = [])
    {
        $this->options = array_merge([
            'coverage' => false,
            'verbose' => false,
            'filter' => null,
        ], $options);
    }

    public function run(): void
    {
        $this->printHeader();
        
        foreach ($this->testSuites as $suiteName => $testFiles) {
            $this->runTestSuite($suiteName, $testFiles);
        }
        
        $this->printSummary();
    }

    private function printHeader(): void
    {
        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════════════════════╗\n";
        echo "║                    TekRem ERP - MoMo & ZRA Integration Tests                 ║\n";
        echo "╚══════════════════════════════════════════════════════════════════════════════╝\n";
        echo "\n";
        echo "Running comprehensive tests for Mobile Money and ZRA Smart Invoice integration...\n";
        echo "\n";
    }

    private function runTestSuite(string $suiteName, array $testFiles): void
    {
        echo "┌─ Running {$suiteName}\n";
        
        $suiteResults = [
            'passed' => 0,
            'failed' => 0,
            'skipped' => 0,
            'total' => 0,
        ];

        foreach ($testFiles as $testFile) {
            if ($this->options['filter'] && !str_contains($testFile, $this->options['filter'])) {
                continue;
            }

            if (!file_exists($testFile)) {
                echo "│  ⚠️  Test file not found: {$testFile}\n";
                $suiteResults['skipped']++;
                continue;
            }

            $result = $this->runSingleTest($testFile);
            $suiteResults['passed'] += $result['passed'];
            $suiteResults['failed'] += $result['failed'];
            $suiteResults['total'] += $result['total'];

            $status = $result['failed'] > 0 ? '❌' : '✅';
            $testName = basename($testFile, '.php');
            echo "│  {$status} {$testName} ({$result['passed']}/{$result['total']} passed)\n";

            if ($this->options['verbose'] && $result['failed'] > 0) {
                echo "│     Failures: {$result['failures']}\n";
            }
        }

        $this->results[$suiteName] = $suiteResults;
        
        $status = $suiteResults['failed'] > 0 ? '❌' : '✅';
        echo "└─ {$status} {$suiteName}: {$suiteResults['passed']}/{$suiteResults['total']} tests passed\n";
        echo "\n";
    }

    private function runSingleTest(string $testFile): array
    {
        $command = $this->buildTestCommand($testFile);
        
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        return $this->parseTestOutput($output, $returnCode);
    }

    private function buildTestCommand(string $testFile): string
    {
        $command = "php artisan test {$testFile}";
        
        if ($this->options['coverage']) {
            $command .= " --coverage";
        }
        
        if ($this->options['verbose']) {
            $command .= " --verbose";
        }
        
        $command .= " 2>&1";
        
        return $command;
    }

    private function parseTestOutput(array $output, int $returnCode): array
    {
        $result = [
            'passed' => 0,
            'failed' => 0,
            'total' => 0,
            'failures' => '',
        ];

        $outputText = implode("\n", $output);
        
        // Parse PHPUnit output for test results
        if (preg_match('/Tests: (\d+), Assertions: \d+/', $outputText, $matches)) {
            $result['total'] = (int) $matches[1];
        }
        
        if (preg_match('/OK \((\d+) tests?, \d+ assertions?\)/', $outputText, $matches)) {
            $result['passed'] = (int) $matches[1];
            $result['total'] = $result['passed'];
        }
        
        if (preg_match('/FAILURES!\s*Tests: (\d+), Assertions: \d+, Failures: (\d+)/', $outputText, $matches)) {
            $result['total'] = (int) $matches[1];
            $result['failed'] = (int) $matches[2];
            $result['passed'] = $result['total'] - $result['failed'];
        }
        
        // Extract failure details
        if ($returnCode !== 0 && $this->options['verbose']) {
            $result['failures'] = $this->extractFailures($outputText);
        }
        
        return $result;
    }

    private function extractFailures(string $output): string
    {
        $lines = explode("\n", $output);
        $failures = [];
        $inFailure = false;
        
        foreach ($lines as $line) {
            if (str_contains($line, 'FAILED')) {
                $inFailure = true;
                $failures[] = trim($line);
            } elseif ($inFailure && (str_contains($line, 'Tests:') || str_contains($line, 'Time:'))) {
                $inFailure = false;
            } elseif ($inFailure) {
                $failures[] = trim($line);
            }
        }
        
        return implode("\n", array_slice($failures, 0, 5)); // Limit to first 5 lines
    }

    private function printSummary(): void
    {
        $totalPassed = 0;
        $totalFailed = 0;
        $totalTests = 0;
        
        foreach ($this->results as $suiteResults) {
            $totalPassed += $suiteResults['passed'];
            $totalFailed += $suiteResults['failed'];
            $totalTests += $suiteResults['total'];
        }
        
        echo "╔══════════════════════════════════════════════════════════════════════════════╗\n";
        echo "║                                   SUMMARY                                    ║\n";
        echo "╠══════════════════════════════════════════════════════════════════════════════╣\n";
        
        foreach ($this->results as $suiteName => $suiteResults) {
            $status = $suiteResults['failed'] > 0 ? '❌' : '✅';
            $percentage = $suiteResults['total'] > 0 
                ? round(($suiteResults['passed'] / $suiteResults['total']) * 100, 1)
                : 0;
            
            printf("║ %s %-50s %3d/%3d (%5.1f%%) ║\n", 
                $status, 
                $suiteName, 
                $suiteResults['passed'], 
                $suiteResults['total'], 
                $percentage
            );
        }
        
        echo "╠══════════════════════════════════════════════════════════════════════════════╣\n";
        
        $overallStatus = $totalFailed > 0 ? '❌' : '✅';
        $overallPercentage = $totalTests > 0 ? round(($totalPassed / $totalTests) * 100, 1) : 0;
        
        printf("║ %s %-50s %3d/%3d (%5.1f%%) ║\n", 
            $overallStatus, 
            'OVERALL', 
            $totalPassed, 
            $totalTests, 
            $overallPercentage
        );
        
        echo "╚══════════════════════════════════════════════════════════════════════════════╝\n";
        
        if ($totalFailed > 0) {
            echo "\n⚠️  Some tests failed. Please review the output above for details.\n";
            echo "💡 Run with --verbose flag for detailed failure information.\n";
        } else {
            echo "\n🎉 All tests passed! Mobile Money and ZRA integration is working correctly.\n";
        }
        
        if ($this->options['coverage']) {
            echo "\n📊 Code coverage report has been generated.\n";
        }
        
        echo "\n";
    }
}

// Parse command line arguments
$options = [];
foreach ($argv as $arg) {
    if ($arg === '--coverage') {
        $options['coverage'] = true;
    } elseif ($arg === '--verbose') {
        $options['verbose'] = true;
    } elseif (str_starts_with($arg, '--filter=')) {
        $options['filter'] = substr($arg, 9);
    }
}

// Run the tests
$runner = new MomoZraTestRunner($options);
$runner->run();
