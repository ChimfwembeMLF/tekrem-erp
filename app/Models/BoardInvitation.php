<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_id',
        'email',
        'token',
        'status',
        'invited_by',
        'company_id',
];

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function board()
    {
        return $this->belongsTo(Board::class);
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
