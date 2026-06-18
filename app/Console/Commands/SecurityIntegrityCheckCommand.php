<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class SecurityIntegrityCheckCommand extends Command
{
    protected $signature = 'security:integrity-check
                            {--paths= : Comma-separated extra paths to scan relative to base path}';

    protected $description = 'Scan core PHP entry files for common webshell / malware signatures';

    /**
     * Patterns commonly used in injected PHP malware.
     *
     * @var list<string>
     */
    private array $suspiciousPatterns = [
        'eval\s*\(\s*base64_decode',
        'eval\s*\(\s*gzinflate',
        'eval\s*\(\s*str_rot13',
        'assert\s*\(\s*base64_decode',
        'preg_replace\s*\(.*/e',
        'create_function\s*\(',
        'shell_exec\s*\(',
        'passthru\s*\(',
        'proc_open\s*\(',
        'system\s*\(',
        '\$_(GET|POST|REQUEST|COOKIE)\s*\[\s*[\'"]cmd',
    ];

    public function handle(): int
    {
        $paths = array_merge($this->corePaths(), $this->extraPaths());
        $issues = [];

        foreach ($paths as $path) {
            if (! is_file($path)) {
                continue;
            }

            $contents = File::get($path);
            $relative = $this->relativePath($path);

            foreach ($this->suspiciousPatterns as $pattern) {
                if (preg_match('#'.$pattern.'#i', $contents)) {
                    $issues[] = [$relative, $pattern];
                }
            }
        }

        if ($issues === []) {
            $this->components->info('No suspicious patterns found in core files.');

            return self::SUCCESS;
        }

        $this->components->error('Possible compromise detected in core files:');

        foreach ($issues as [$file, $pattern]) {
            $this->line("  - {$file} matched /{$pattern}/i");
        }

        $this->newLine();
        $this->line('Treat this as a security incident: restore clean files, rotate secrets, and review server access logs.');

        return self::FAILURE;
    }

    /**
     * @return list<string>
     */
    private function corePaths(): array
    {
        return [
            public_path('index.php'),
            base_path('artisan'),
            base_path('bootstrap/app.php'),
        ];
    }

    /**
     * @return list<string>
     */
    private function extraPaths(): array
    {
        $paths = $this->option('paths');

        if (! is_string($paths) || trim($paths) === '') {
            return [];
        }

        return array_values(array_filter(array_map(
            fn (string $path) => base_path(trim($path)),
            explode(',', $paths)
        )));
    }

    private function relativePath(string $path): string
    {
        return ltrim(str_replace(base_path(), '', $path), DIRECTORY_SEPARATOR);
    }
}
