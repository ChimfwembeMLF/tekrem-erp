<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleBilling extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'module_id',
        'amount',
        'currency',
        'status',
        'billing_date',
        'due_date',
        'payment_method',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
