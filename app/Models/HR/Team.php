<?php

namespace App\Models\HR;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    protected $table = 'hr_teams';

        /**
     * The employees in this team.
     */
    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'hr_employee_team', 'team_id', 'employee_id')
            ->withPivot('is_lead')
            ->withTimestamps();
    }
}
