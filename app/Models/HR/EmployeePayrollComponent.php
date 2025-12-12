<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeePayrollComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payroll_component_id',
        'amount',
        'period',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function component()
    {
        return $this->belongsTo(PayrollComponent::class, 'payroll_component_id');
    }
}
