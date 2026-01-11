<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'package_id', 'starts_at', 'ends_at', 'trial_ends_at', 'status', 'price', 'currency', 'payment_method', 'meta'
    ];

    protected $casts = [
        'starts_at' => 'date',
        'ends_at' => 'date',
        'trial_ends_at' => 'date',
        'meta' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
