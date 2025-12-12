<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'default_amount',
        'is_statutory',
    ];
}
