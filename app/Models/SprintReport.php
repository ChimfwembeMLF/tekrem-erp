<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SprintReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'sprint_id',
        'user_id',
        'summary',
        'completed_points',
        'incomplete_points',
        'velocity',
        'metrics',
    ];

    protected $casts = [
        'metrics' => 'array',
    ];

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
