<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Payroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'period',
        'amount',
        'status',
        'approved_by',
        'approved_at',
        'rejected_reason',
        'payslip_file_path',
        'company_id',
];

    protected $table = 'hr_payrolls';

    protected $dates = [
        'approved_at',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
    }

    public function audits()
    {
        return $this->hasMany(PayrollAudit::class);
    }

    public function components()
    {
        return $this->hasMany(EmployeePayrollComponent::class, 'employee_id', 'employee_id')
            ->where('period', $this->period);
    }


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
