<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Onboarding extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'start_date',
        'status',
    ];

    protected $table = 'hr_onboardings';

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
