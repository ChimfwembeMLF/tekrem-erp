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
    ];

    protected $table = 'hr_payrolls';

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
