<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offboarding extends Model
{
    protected $table = 'hr_offboardings';

    protected $fillable = [
        'employee_id',
        'last_working_date',
        'reason',
        'status',
        'checklist',
        'exit_interview_date',
        'exit_interview_notes',
        'satisfaction_rating',
        'completed_at',
    ];

    protected $casts = [
        'last_working_date' => 'date',
        'exit_interview_date' => 'date',
        'checklist' => 'array',
        'completed_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public static function defaultChecklist(): array
    {
        return [
            ['id' => 'exit_interview', 'label' => 'Schedule exit interview', 'completed' => false],
            ['id' => 'knowledge_transfer', 'label' => 'Knowledge transfer complete', 'completed' => false],
            ['id' => 'equipment', 'label' => 'Equipment returned', 'completed' => false],
            ['id' => 'access', 'label' => 'System access revoked', 'completed' => false],
            ['id' => 'payroll', 'label' => 'Final payroll processed', 'completed' => false],
            ['id' => 'farewell', 'label' => 'Farewell & reference letter', 'completed' => false],
        ];
    }
}
