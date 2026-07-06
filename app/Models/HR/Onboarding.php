<?php

namespace App\Models\HR;

use App\Models\Concerns\BelongsToOrganization;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Onboarding extends Model
{
    use BelongsToOrganization, HasFactory;

    protected $fillable = [
        'organization_id',
        'employee_id',
        'title',
        'start_date',
        'status',
        'checklist',
        'completed_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'checklist' => 'array',
        'completed_at' => 'datetime',
    ];

    public static function workflowTitles(): array
    {
        return [
            'General onboarding',
            'Engineering onboarding',
            'Sales & marketing onboarding',
            'Operations onboarding',
            'Finance onboarding',
            'HR onboarding',
            'Management onboarding',
            'Intern onboarding',
            'Remote onboarding',
        ];
    }

    public static function defaultChecklist(): array
    {
        return [
            ['id' => 'contract', 'label' => 'Employment contract signed', 'completed' => false],
            ['id' => 'documents', 'label' => 'ID & tax documents collected', 'completed' => false],
            ['id' => 'it_setup', 'label' => 'IT accounts & email created', 'completed' => false],
            ['id' => 'equipment', 'label' => 'Equipment issued', 'completed' => false],
            ['id' => 'policies', 'label' => 'Policies acknowledged', 'completed' => false],
            ['id' => 'orientation', 'label' => 'Team orientation complete', 'completed' => false],
            ['id' => 'benefits', 'label' => 'Benefits enrollment', 'completed' => false],
        ];
    }

    protected $table = 'hr_onboardings';

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
