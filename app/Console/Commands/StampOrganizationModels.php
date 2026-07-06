<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class StampOrganizationModels extends Command
{
    protected $signature = 'organizations:stamp-models {--dry-run : Preview changes without writing files}';

    protected $description = 'Apply BelongsToOrganization trait to all tenant-scoped models';

    /** @var list<string> */
    private array $excludedClasses = [
        'Organization',
        'BillingPlan',
        'OrganizationSubscription',
        'User',
        'Role',
        'Permission',
        'Module',
        'Setting',
        'Notification',
        'GuestSession',
    ];

    public function handle(): int
    {
        $tables = config('organization_scoped_tables', []);
        $tableSet = array_flip($tables);
        $dryRun = (bool) $this->option('dry-run');
        $stamped = 0;
        $skipped = 0;

        foreach (File::allFiles(app_path('Models')) as $file) {
            if ($file->getExtension() !== 'php') {
                continue;
            }

            $relative = str_replace([app_path('Models').'/', '.php'], ['', ''], $file->getPathname());
            $classShort = str_replace('/', '\\', $relative);
            $classBase = class_basename($classShort);

            if (in_array($classBase, $this->excludedClasses, true) || str_starts_with($relative, 'Guest/')) {
                continue;
            }

            $contents = File::get($file->getPathname());
            $table = $this->resolveTableName($contents, $classBase);

            if (! $table || ! isset($tableSet[$table])) {
                continue;
            }

            if ($this->usesOrganizationTrait($contents)) {
                $skipped++;

                continue;
            }

            $updated = $this->stampFile($contents);

            if ($updated === $contents) {
                $this->warn("Could not stamp: {$relative} (table: {$table})");
                continue;
            }

            if (! $dryRun) {
                File::put($file->getPathname(), $updated);
            }

            $this->line(($dryRun ? '[dry-run] ' : '')."Stamped {$relative} ({$table})");
            $stamped++;
        }

        $this->info("Done. Stamped {$stamped}, skipped {$skipped} (already had trait).");

        return self::SUCCESS;
    }

    private function resolveTableName(string $contents, string $classBase): ?string
    {
        if (preg_match('/protected\s+\$table\s*=\s*[\'"]([^\'"]+)[\'"]\s*;/', $contents, $matches)) {
            return $matches[1];
        }

        return Str::snake(Str::pluralStudly($classBase));
    }

    private function stampFile(string $contents): string
    {
        if (! str_contains($contents, 'use App\Models\Concerns\BelongsToOrganization;')) {
            $replaced = preg_replace(
                '/(namespace App\\\\Models(?:\\\\[^;]+)?;\r?\n)/',
                "$1\nuse App\Models\Concerns\BelongsToOrganization;\n",
                $contents,
                1,
            );

            if (is_string($replaced)) {
                $contents = $replaced;
            }
        }

        if (! $this->usesOrganizationTrait($contents)) {
            if (preg_match('/use HasFactory;/', $contents)) {
                $replaced = preg_replace('/use HasFactory;/', 'use BelongsToOrganization, HasFactory;', $contents, 1);
            } elseif (preg_match('/use HasApiTokens;/', $contents)) {
                $replaced = preg_replace('/use HasApiTokens;/', 'use BelongsToOrganization, HasApiTokens;', $contents, 1);
            } else {
                $replaced = preg_replace('/(\{\r?\n)/', "{\n    use BelongsToOrganization;\n", $contents, 1);
            }

            if (is_string($replaced)) {
                $contents = $replaced;
            }
        }

        if (
            str_contains($contents, 'protected $fillable = [')
            && ! str_contains($contents, "'organization_id'")
            && ! str_contains($contents, '"organization_id"')
        ) {
            $replaced = preg_replace(
                '/protected \$fillable = \[\r?\n/',
                "protected \$fillable = [\n        'organization_id',\n",
                $contents,
                1,
            );

            if (is_string($replaced)) {
                $contents = $replaced;
            }
        }

        return $contents;
    }

    private function usesOrganizationTrait(string $contents): bool
    {
        return (bool) preg_match('/^\s+use BelongsToOrganization(?:,|\s|;)/m', $contents);
    }
}
