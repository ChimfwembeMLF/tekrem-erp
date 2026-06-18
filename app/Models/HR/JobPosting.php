<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    protected $table = 'hr_job_postings';

    protected $fillable = [
        'title',
        'slug',
        'department_id',
        'location',
        'employment_type',
        'description',
        'requirements',
        'responsibilities',
        'salary_range',
        'status',
        'published_at',
        'closes_at',
        'created_by',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'closes_at' => 'datetime',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('closes_at')->orWhere('closes_at', '>=', now());
            });
    }

    public function isPubliclyVisible(): bool
    {
        if ($this->status !== 'published') {
            return false;
        }

        return $this->closes_at === null || $this->closes_at->gte(now());
    }

    public static function closeExpired(): int
    {
        return static::where('status', 'published')
            ->whereNotNull('closes_at')
            ->where('closes_at', '<', now())
            ->update(['status' => 'closed']);
    }
}
