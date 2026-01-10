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
        'company_id',
];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function invoice()
    {
        return $this->belongsTo(\App\Models\Finance\Invoice::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
