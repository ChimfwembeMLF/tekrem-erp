<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'project_id',
        'name',
        'description',
        'type',
        'owner_id',
        'visibility',
        'settings',
    ];

    /**
     * Get the company that owns the board.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    protected $casts = [
        'settings' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function columns()
    {
        return $this->hasMany(BoardColumn::class);
    }

    public function cards()
    {
        return $this->hasMany(BoardCard::class);
    }

    public function sprints()
    {
        return $this->hasMany(Sprint::class);
    }

    public function epics()
    {
        return $this->hasMany(Epic::class);
    }

    public function members()
    {
        return $this->hasMany(BoardMember::class);
    }

    public function invitations()
    {
        return $this->hasMany(BoardInvitation::class);
    }
}
